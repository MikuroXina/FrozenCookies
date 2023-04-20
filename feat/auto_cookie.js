import { Beautify } from "../fc_beautify.js";
import { goldenCookieLife, liveWrinklers } from "../fc_time.js";
import { chocolateValue, safeBuy } from "../fc_pay.js";
import { getNumber, set } from "../fc_store.js";
import { updateFrenzyTimes } from "../fc_frenzy_times.js";

let cookieBot = 0;

export function start() {
    const freq = getNumber('frequency');
    if (freq) {
        cookieBot = setTimeout(() => {
            autoCookie(config);
        }, freq);
    }
}

export function stop() {
    if (cookieBot) {
        clearInterval(cookieBot);
        cookieBot = 0;
    }
}

let processing = false;

function autoCookie() {
    // console.log('autocookie called');
    if (!processing && !Game.OnAscend && !Game.AscendTimer) {
        processing = true;
        const currentHCAmount = Game.HowMuchPrestige(
            Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
        );

        const lastHCAmount = getNumber("lastHCAmount");
        if (Math.floor(lastHCAmount) < Math.floor(currentHCAmount)) {
            const changeAmount = currentHCAmount - lastHCAmount;
            set("lastHCAmount", currentHCAmount);
            FrozenCookies.prevLastHCTime = FrozenCookies.lastHCTime;
            FrozenCookies.lastHCTime = Date.now();
            const currHCPercent =
                (60 * 60 * (lastHCAmount - Game.heavenlyChips)) /
                ((FrozenCookies.lastHCTime - Game.startDate) / 1000);
            if (
                Game.heavenlyChips < currentHCAmount - changeAmount &&
                currHCPercent > FrozenCookies.maxHCPercent
            ) {
                FrozenCookies.maxHCPercent = currHCPercent;
            }
            set("heavenlyChipsGain", getNumber("heavenlyChipsGain") + changeAmount);
        }
        updateCaches();
        const recommendation = nextPurchase();
        const delay = delayAmount();
        if (FrozenCookies.autoSL) {
            const started = Game.lumpT;
            const ripeAge = Math.ceil(Game.lumpRipeAge);
            if (
                Date.now() - started >= ripeAge &&
                Game.dragonLevel >= 21 &&
                FrozenCookies.dragonsCurve
            ) {
                autoDragonsCurve();
            } else if (Date.now() - started >= ripeAge) {
                Game.clickLump();
            }
        }
        if (FrozenCookies.autoSL == 2) {
            autoRigidel();
        }
        if (FrozenCookies.autoWrinkler == 1) {
            let popCount = 0;
            const popList = shouldPopWrinklers();
            if (FrozenCookies.shinyPop == 1) {
                _.filter(Game.wrinklers, function (w) {
                    return _.contains(popList, w.id);
                }).forEach(function (w) {
                    if (w.type !== 1) {
                        // do not pop Shiny Wrinkler
                        w.hp = 0;
                        popCount += 1;
                    }
                });
                if (popCount > 0) {
                    logEvent("Wrinkler", "Popped " + popCount + " wrinklers.");
                }
            } else {
                _.filter(Game.wrinklers, function (w) {
                    return _.contains(popList, w.id);
                }).forEach(function (w) {
                    w.hp = 0;
                    popCount += 1;
                });
                if (popCount > 0) {
                    logEvent("Wrinkler", "Popped " + popCount + " wrinklers.");
                }
            }
        }
        if (FrozenCookies.autoWrinkler == 2) {
            let popCount = 0;
            const popList = Game.wrinklers;
            if (FrozenCookies.shinyPop == 1) {
                popList.forEach(function (w) {
                    if (w.close == true && w.type !== 1) {
                        w.hp = 0;
                        popCount += 1;
                    }
                });
                if (popCount > 0) {
                    logEvent("Wrinkler", "Popped " + popCount + " wrinklers.");
                }
            } else {
                popList.forEach(function (w) {
                    if (w.close == true) {
                        w.hp = 0;
                        popCount += 1;
                    }
                });
                if (popCount > 0) {
                    logEvent("Wrinkler", "Popped " + popCount + " wrinklers.");
                }
            }
        }

        let itemBought = false;

        // const seConditions = (Game.cookies >= delay + recommendation.cost) || (!(FrozenCookies.autoSpell == 3) && !(FrozenCookies.holdSEBank))); // true == good on SE bank or don't care about it
        if (
            FrozenCookies.autoBuy &&
            (Game.cookies >= delay + recommendation.cost ||
                recommendation.purchase.name == "Elder Pledge") &&
            (FrozenCookies.pastemode || isFinite(nextChainedPurchase().efficiency))
        ) {
            //    if (FrozenCookies.autoBuy && (Game.cookies >= delay + recommendation.cost)) {
            // console.log('something should get bought');
            recommendation.time = Date.now() - Game.startDate;
            //      full_history.push(recommendation);  // Probably leaky, maybe laggy?
            recommendation.purchase.clickFunction = null;
            disabledPopups = false;
            //      console.log(purchase.name + ': ' + Beautify(recommendation.efficiency) + ',' + Beautify(recommendation.delta_cps));
            if (
                Math.floor(Game.HowMuchPrestige(Game.cookiesReset + Game.cookiesEarned)) -
                    Math.floor(Game.HowMuchPrestige(Game.cookiesReset)) <
                    1 &&
                Game.Has("Inspired checklist") &&
                FrozenCookies.autoBuyAll &&
                nextPurchase().type == "upgrade" &&
                Game.cookies >= nextPurchase().cost &&
                nextPurchase().purchase.name != "Bingo center/Research facility" &&
                nextPurchase().purchase.name != "Specialized chocolate chips" &&
                nextPurchase().purchase.name != "Designer cocoa beans" &&
                nextPurchase().purchase.name != "Ritual rolling pins" &&
                nextPurchase().purchase.name != "Underworld ovens" &&
                nextPurchase().purchase.name != "One mind" &&
                nextPurchase().purchase.name != "Exotic nuts" &&
                nextPurchase().purchase.name != "Communal brainsweep" &&
                nextPurchase().purchase.name != "Arcane sugar" &&
                nextPurchase().purchase.name != "Elder Pact"
            ) {
                document.getElementById("storeBuyAllButton").click();
                logEvent("Autobuy", "Bought all upgrades!");
            } else if (
                recommendation.type == "building" &&
                Game.buyBulk == 100 &&
                ((FrozenCookies.autoSpell == 3 &&
                    recommendation.purchase.name == "Cortex baker" &&
                    Game.Objects["Cortex baker"].amount >= 299) ||
                    (FrozenCookies.towerLimit &&
                        recommendation.purchase.name == "Wizard tower" &&
                        TOWER_GAME.magic >= FrozenCookies.manaMax - 10) ||
                    (FrozenCookies.mineLimit &&
                        recommendation.purchase.name == "Mine" &&
                        Game.Objects["Mine"].amount >= FrozenCookies.mineMax - 100) ||
                    (FrozenCookies.factoryLimit &&
                        recommendation.purchase.name == "Factory" &&
                        Game.Objects["Factory"].amount >=
                            FrozenCookies.factoryMax - 100) ||
                    (FrozenCookies.autoDragonOrbs &&
                        FrozenCookies.cortexLimit &&
                        recommendation.purchase.name == "Cortex baker" &&
                        Game.Objects["Cortex baker"].amount >=
                            FrozenCookies.cortexMax - 100))
            ) {
                document.getElementById("storeBulk10").click();
                safeBuy(recommendation.purchase);
                document.getElementById("storeBulk100").click();
            } else if (
                recommendation.type == "building" &&
                Game.buyBulk == 10 &&
                ((FrozenCookies.autoSpell == 3 &&
                    recommendation.purchase.name == "Cortex baker" &&
                    Game.Objects["Cortex baker"].amount >= 389) ||
                    (FrozenCookies.towerLimit &&
                        recommendation.purchase.name == "Wizard tower" &&
                        TOWER_GAME.magic >= FrozenCookies.manaMax - 2) ||
                    (FrozenCookies.mineLimit &&
                        recommendation.purchase.name == "Mine" &&
                        Game.Objects["Mine"].amount >= FrozenCookies.mineMax - 10) ||
                    (FrozenCookies.factoryLimit &&
                        recommendation.purchase.name == "Factory" &&
                        Game.Objects["Factory"].amount >=
                            FrozenCookies.factoryMax - 10) ||
                    (FrozenCookies.autoDragonOrbs &&
                        FrozenCookies.cortexLimit &&
                        recommendation.purchase.name == "Cortex baker" &&
                        Game.Objects["Cortex baker"].amount >=
                            FrozenCookies.cortexMax - 10))
            ) {
                document.getElementById("storeBulk1").click();
                safeBuy(recommendation.purchase);
                document.getElementById("storeBulk10").click();
            } else if (recommendation.type == "building") {
                safeBuy(recommendation.purchase);
            } else {
                recommendation.purchase.buy();
            }
            FrozenCookies.autobuyCount += 1;
            if (FrozenCookies.trackStats == 5 && recommendation.type == "upgrade") {
                saveStats();
            } else if (FrozenCookies.trackStats == 6) {
                FrozenCookies.delayPurchaseCount += 1;
            }
            if (FrozenCookies.purchaseLog == 1) {
                logEvent(
                    "Store",
                    "Autobought " +
                        recommendation.purchase.name +
                        " for " +
                        Beautify(recommendation.cost) +
                        ", resulting in " +
                        Beautify(recommendation.delta_cps) +
                        " CPS."
                );
            }
            disabledPopups = true;
            if (FrozenCookies.autobuyCount >= 10) {
                Game.Draw();
                FrozenCookies.autobuyCount = 0;
            }
            FrozenCookies.recalculateCaches = true;
            processing = false;
            itemBought = true;
        }

        if (FrozenCookies.autoAscend && !Game.OnAscend && !Game.AscendTimer) {
            const currPrestige = Game.prestige;
            const resetPrestige = Game.HowMuchPrestige(
                Game.cookiesReset +
                    Game.cookiesEarned +
                    wrinklerValue() +
                    chocolateValue()
            );
            const ascendChips = FrozenCookies.HCAscendAmount;
            if (resetPrestige - currPrestige >= ascendChips && ascendChips > 0) {
                Game.ClosePrompt();
                Game.Ascend(1);
                setTimeout(function () {
                    Game.ClosePrompt();
                    Game.Reincarnate(1);
                }, 10000);
            }
        }

        const FPS_AMOUNTS = [
            "15",
            "24",
            "30",
            "48",
            "60",
            "72",
            "88",
            "100",
            "120",
            "144",
            "200",
            "240",
            "300",
            "5",
            "10",
        ];
        if (parseInt(FPS_AMOUNTS[FrozenCookies["fpsModifier"]]) != Game.fps) {
            Game.fps = parseInt(FPS_AMOUNTS[FrozenCookies["fpsModifier"]]);
        }

        // This apparently *has* to stay here, or else fast purchases will multi-click it.
        if (goldenCookieLife() && FrozenCookies.autoGC) {
            for (const i in Game.shimmers) {
                if (Game.shimmers[i].type == "golden") {
                    Game.shimmers[i].pop();
                }
            }
        }
        if (reindeerLife() > 0 && FrozenCookies.autoReindeer) {
            for (const i in Game.shimmers) {
                if (Game.shimmers[i].type == "reindeer") {
                    Game.shimmers[i].pop();
                }
            }
        }
        if (FrozenCookies.autoBlacklistOff) {
            autoBlacklistOff();
        }
        updateFrenzyTimes();
        processing = false;
        if (FrozenCookies.frequency) {
            FrozenCookies.cookieBot = setTimeout(
                autoCookie,
                itemBought ? 0 : FrozenCookies.frequency
            );
        }
    } else if (!processing && FrozenCookies.frequency) {
        FrozenCookies.cookieBot = setTimeout(autoCookie, FrozenCookies.frequency);
    }
}

function updateCaches() {
    let recommendation, currentBank, targetBank, currentCookieCPS, currentUpgradeCount;
    let recalcCount = 0;
    do {
        recommendation = nextPurchase(FrozenCookies.recalculateCaches);
        FrozenCookies.recalculateCaches = false;
        currentBank = bestBank(0);
        targetBank = bestBank(recommendation.efficiency);
        currentCookieCPS = gcPs(cookieValue(currentBank.cost));
        currentUpgradeCount = Game.UpgradesInStore.length;
        FrozenCookies.safeGainsCalc();

        if (FrozenCookies.lastCPS != FrozenCookies.calculatedCps) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.lastCPS = FrozenCookies.calculatedCps;
        }

        if (FrozenCookies.currentBank.cost != currentBank.cost) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.currentBank = currentBank;
        }

        if (FrozenCookies.targetBank.cost != targetBank.cost) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.targetBank = targetBank;
        }

        if (FrozenCookies.lastCookieCPS != currentCookieCPS) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.lastCookieCPS = currentCookieCPS;
        }

        if (FrozenCookies.lastUpgradeCount != currentUpgradeCount) {
            FrozenCookies.recalculateCaches = true;
            FrozenCookies.lastUpgradeCount = currentUpgradeCount;
        }
        recalcCount += 1;
    } while (FrozenCookies.recalculateCaches && recalcCount < 10);

    Game.recalculateGains = 1;
    Game.CalculateGains();
}

function reindeerLife() {
    for (const i in Game.shimmers) {
        if (Game.shimmers[i].type == "reindeer") {
            return Game.shimmers[i].life;
        }
    }
    return null;
}

function shouldPopWrinklers() {
    const toPop = [];
    const living = liveWrinklers();
    if (living.length > 0) {
        if (
            (Game.season == "halloween" || Game.season == "easter") &&
            !haveAll(Game.season)
        ) {
            toPop = living.map(function (w) {
                return w.id;
            });
        } else {
            const delay = delayAmount();
            const wrinklerList = Game.wrinklers;
            const nextRecNeeded = nextPurchase().cost + delay - Game.cookies;
            const nextRecCps = nextPurchase().delta_cps;
            const wrinklersNeeded = wrinklerList
                .sort(function (w1, w2) {
                    return w1.sucked < w2.sucked;
                })
                .reduce(
                    function (current, w) {
                        const futureWrinklers = living.length - (current.ids.length + 1);
                        if (
                            current.total < nextRecNeeded &&
                            effectiveCps(delay, Game.elderWrath, futureWrinklers) +
                                nextRecCps >
                                effectiveCps()
                        ) {
                            current.ids.push(w.id);
                            current.total += popValue(w);
                        }
                        return current;
                    },
                    {
                        total: 0,
                        ids: [],
                    }
                );
            toPop = wrinklersNeeded.total > nextRecNeeded ? wrinklersNeeded.ids : toPop;
        }
    }
    return toPop;
}

function autoBlacklistOff() {
    switch (FrozenCookies.blacklist) {
        case 1:
            FrozenCookies.blacklist = Game.cookiesEarned >= 1000000 ? 0 : 1;
            break;
        case 2:
            FrozenCookies.blacklist = Game.cookiesEarned >= 1000000000 ? 0 : 2;
            break;
        case 3:
            FrozenCookies.blacklist = haveAll("halloween") && haveAll("easter") ? 0 : 3;
            break;
    }
}

function autoRigidel() {
    if (!TEMPLE_GAME) {
        // Exit if pantheon doesnt even exist
        return;
    }
    const timeToRipe = (Math.ceil(Game.lumpRipeAge) - (Date.now() - Game.lumpT)) / 60000; // Minutes until sugar lump ripens
    const started = Game.lumpT;
    const ripeAge = Math.ceil(Game.lumpRipeAge);
    const orderLvl = Game.hasGod("order") ? Game.hasGod("order") : 0;
    switch (orderLvl) {
        case 0: // Rigidel isn't in a slot
            if (TEMPLE_GAME.swaps < 2 || (TEMPLE_GAME.swaps == 1 && TEMPLE_GAME.slot[0] == -1)) {
                // Don't do anything if we can't swap Rigidel in
                return;
            }
            if (timeToRipe < 60) {
                const prev = TEMPLE_GAME.slot[0]; // cache whatever god you have equipped
                swapIn(10, 0); // swap in rigidel
                Game.computeLumpTimes();
                rigiSell(); // Meet the %10 condition
                Game.computeLumpTimes();
                if (Date.now() - started >= ripeAge) {
                    if (Game.dragonLevel >= 21 && FrozenCookies.dragonsCurve) {
                        autoDragonsCurve();
                    } else {
                        Game.clickLump();
                    }
                    if (prev != -1) {
                        // put the old one back
                        swapIn(prev, 0);
                    }
                    logEvent("autoRigidel", "Sugar lump harvested early");
                }
            }
        case 1: // Rigidel is already in diamond slot
            if (timeToRipe < 60 && Game.BuildingsOwned % 10) {
                rigiSell();
                Game.computeLumpTimes();
                if (Date.now() - started >= ripeAge) {
                    if (Game.dragonLevel >= 21 && FrozenCookies.dragonsCurve) {
                        autoDragonsCurve();
                    } else {
                        Game.clickLump();
                    }
                    logEvent("autoRigidel", "Sugar lump harvested early");
                }
            }
        case 2: // Rigidel in Ruby slot,
            if (timeToRipe < 40 && Game.BuildingsOwned % 10) {
                rigiSell();
                Game.computeLumpTimes();
                if (Date.now() - started >= ripeAge) {
                    if (Game.dragonLevel >= 21 && FrozenCookies.dragonsCurve) {
                        autoDragonsCurve();
                    } else {
                        Game.clickLump();
                    }
                    logEvent("autoRigidel", "Sugar lump harvested early");
                }
            }
        case 3: // Rigidel in Jade slot
            if (timeToRipe < 20 && Game.BuildingsOwned % 10) {
                rigiSell();
                Game.computeLumpTimes();
                if (Date.now() - started >= ripeAge) {
                    if (Game.dragonLevel >= 21 && FrozenCookies.dragonsCurve) {
                        autoDragonsCurve();
                    } else {
                        Game.clickLump();
                    }
                    logEvent("autoRigidel", "Sugar lump harvested early");
                }
            }
    }
}

function autoDragonsCurve() {
    // Swap dragon auras to try for unusual lumps
    if (Game.dragonLevel < 21 || FrozenCookies.dragonsCurve < 1) {
        return;
    }

    if (FrozenCookies.autoDragonToggle == 1) {
        autoDragonsCurve.autodragonyes = 1;
        FrozenCookies.autoDragonToggle = 0;
    } else {
        autoDragonsCurve.autodragonyes = 0;
    }

    if (
        Game.dragonLevel > 25 &&
        Game.dragonAura == 18 && // RB
        !Game.dragonAura2 == 17 // DC
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(17, 1);
        Game.ConfirmPrompt();
        logEvent("autoDragonsCurve", "Dragon auras swapped to manipulate new Sugar Lump");
    } else if (!Game.hasAura("Dragon's Curve")) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(17, 0);
        Game.ConfirmPrompt();
        logEvent("autoDragonsCurve", "Dragon auras swapped to manipulate new Sugar Lump");
    }

    if (
        FrozenCookies.dragonsCurve == 2 &&
        Game.dragonLevel > 25 &&
        !Game.hasAura("Reality Bending")
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(18, 1);
        Game.ConfirmPrompt();
    }

    Game.clickLump();

    if (autoDragonsCurve.autodragonyes == 1) {
        FrozenCookies.autoDragonToggle = 1;
        autoDragonsCurve.autodragonyes = 0;
    }
}

function rigiSell() {
    const toSell = Game.BuildingsOwned % 10;
    // Sell enough of the cheapest building to enable Rigidels effect
    if (toSell == 0) {
        return;
    }
    const cheapest = Game.ObjectsById.reduce(function (acc, curr) {
        if (!acc || curr.price < acc.price) {
            return curr;
        }
        return acc;
    }, undefined);
    cheapest?.sell(toSell);
}
