import {
    BLACKLIST,
    HOLIDAY_COOKIES,
    RECOMMENDATION_BLACKLIST,
    SEASONS,
} from "./cc_upgrade_prerequisites.js";
import { cumulativeSantaCost } from "./fc_pay.js";
import { getNumber } from "./fc_store.js";
import { divCps } from "./fc_time.js";
import { willAutoSpellSE } from "./feat/auto_spell.js";

/**
 * Gets the best recommendation of next purchases.
 *
 * @param {boolean} recalculate - Force to recalculate if `true`.
 * @returns The best recommendation.
 */
export function nextPurchase(recalculate) {
    if (recalculate) {
        set("showAchievements", 0);
        const recList = recommendationList(recalculate);
        let purchase = null;
        for (const target of recList) {
            const unfinished = unfinishedUpgradePrereqs(Game.UpgradesById[target.id]);
            if (
                target.type == "upgrade" &&
                unfinished
            ) {
                const unfinishedTypes = new Set(unfinished.map(({ type }) => type));
                const unfinishedIds = new Set(unfinished.map(({ id }) => id));
                purchase = recList.find(function (a) {
                    return unfinishedTypes.has(a.type) && unfinishedIds.has(a.id);
                });
            } else {
                purchase = target;
            }
            if (purchase) {
                FrozenCookies.caches.nextPurchase = purchase;
                FrozenCookies.caches.nextChainedPurchase = target;
                break;
            }
        }
        if (purchase == null) {
            FrozenCookies.caches.nextPurchase = defaultPurchase();
            FrozenCookies.caches.nextChainedPurchase = defaultPurchase();
        }
        set("showAchievements", 1);
    }
    return FrozenCookies.caches.nextPurchase;
}

/**
 * Gets a list of recommendations of next purchases.
 *
 * @param {boolean} recalculate - Force to recalculate if `true`.
 * @returns A list of recommendations.
 */
export function recommendationList(recalculate) {
    if (recalculate) {
        set("showAchievements", 0);
        FrozenCookies.caches.recommendationList = addScores(
            upgradeStats(recalculate)
                .concat(buildingStats(recalculate))
                .concat(santaStats())
                .sort(function (a, b) {
                    return a.efficiency != b.efficiency
                        ? a.efficiency - b.efficiency
                        : a.delta_cps != b.delta_cps
                        ? b.delta_cps - a.delta_cps
                        : a.cost - b.cost;
                })
        );
        if (FrozenCookies.pastemode) {
            FrozenCookies.caches.recommendationList.reverse();
        }
        set("showAchievements", 1);
    }
    return FrozenCookies.caches.recommendationList;
}

function addScores(recommendations) {
    const filteredList = recommendations.filter(function (a) {
        return (
            a.efficiency < Number.POSITIVE_INFINITY &&
            a.efficiency > Number.NEGATIVE_INFINITY
        );
    });
    if (filteredList.length == 0) {
        for (let i = 0; recommendations.length; ++i) {
            recommendations[i].efficiencyScore = 0;
        }
        return recommendations;
    }
    const minValue = Math.log(recommendations[0].efficiency);
    const maxValue = Math.log(recommendations[filteredList.length - 1].efficiency);
    const spread = maxValue - minValue;
    return recommendations.map(function (purchaseRec) {
        if (
            purchaseRec.efficiency < Number.POSITIVE_INFINITY &&
            purchaseRec.efficiency > Number.NEGATIVE_INFINITY
        ) {
            const purchaseValue = Math.log(purchaseRec.efficiency);
            const purchaseSpread = purchaseValue - minValue;
            return {
                ...purchaseRec,
                efficiencyScore: 1 - purchaseSpread / spread,
            };
        }
        return {
            ...purchaseRec,
            efficiencyScore: 0,
        };
    });
}

function upgradeStats(recalculate) {
    if (recalculate) {
        const blacklist = getNumber("blacklist");
        if (BLACKLIST[blacklist].upgrades === true) {
            FrozenCookies.caches.upgrades = [];
        } else {
            const upgradeBlacklist = BLACKLIST[blacklist].upgrades;
            const existingAchievements = Object.values(
                Game.AchievementsById
            ).map(function (item) {
                return item.won;
            });

            const needToCalculate = new Set(Object.values(Game.UpgradesById).map(({ id }) => id));
            for (const { id: cachedId } of FrozenCookies.caches.upgrades) {
                if (needToCalculate.has(cachedId)) {
                    needToCalculate.delete(cachedId);
                } else {
                    needToCalculate.add(cachedId);
                }
            }

            FrozenCookies.caches.upgrades = Object.values(Game.UpgradesById)
                .filter(function (current) {
                    return (
                        !current.bought
                        && isAvailable(current, upgradeBlacklist)
                        && needToCalculate.has(current.id)
                    );
                })
                .map(function (current) {
                    const currentBank = bestBank(0).cost;
                    const cost = upgradePrereqCost(current);
                    const baseCpsOrig = baseCps();
                    const cpsOrig = effectiveCps(Math.min(Game.cookies, currentBank));
                    const existingWrath = Game.elderWrath;
                    const discounts = totalDiscount() + totalDiscount(true);

                    const reverseFunctions = upgradeToggle(current);
                    Game.recalculateGains = 1;
                    Game.CalculateGains();
                    const baseCpsNew = baseCps();
                    const cpsNew = effectiveCps(currentBank);
                    const priceReduction =
                        discounts == totalDiscount() + totalDiscount(true)
                            ? 0
                            : checkPrices(current);
                    upgradeToggleReverse(current, reverseFunctions);
                    Game.recalculateGains = 1;
                    Game.CalculateGains();

                    Game.elderWrath = existingWrath;
                    const deltaCps = cpsNew - cpsOrig;
                    const baseDeltaCps = baseCpsNew - baseCpsOrig;
                    const efficiency =
                        current.season &&
                        current.season == SEASONS[FrozenCookies.defaultSeason]
                            ? cost / baseCpsOrig
                            : priceReduction > cost
                            ? 1
                            : purchaseEfficiency(
                                    cost,
                                    deltaCps,
                                    baseDeltaCps,
                                    cpsOrig
                                );
                    return {
                        id: current.id,
                        efficiency: efficiency,
                        base_delta_cps: baseDeltaCps,
                        delta_cps: deltaCps,
                        cost: cost,
                        purchase: current,
                        type: "upgrade",
                    };
                });

                const achievementsLen = existingAchievements.length;
                for (let index = 0; index < achievementsLen; ++index) {
                    Game.AchievementsById[index].won = existingAchievements[index];
                }
                Game.AchievementsOwned = existingAchievements.filter(function (won, index) {
                    return won && Game.AchievementsById[index].pool != "shadow";
                }).length;
        }
    }
    return FrozenCookies.caches.upgrades;
}

function buildingStats(recalculate) {
    if (recalculate) {
        const blacklist = getNumber("blacklist");
        if (BLACKLIST[blacklist].buildings === true) {
            FrozenCookies.caches.buildings = [];
        } else {
            const buildingBlacklist = Array.from(
                BLACKLIST[blacklist].buildings
            );
            // If autocasting Spontaneous Edifice, don't buy any Cortex baker after 399
            if (
                TOWER_GAME &&
                willAutoSpellSE() &&
                Game.Objects["Cortex baker"].amount >= 399
            )
                buildingBlacklist.push(18);
            // Stop buying wizard towers at max Mana if enabled
            if (
                TOWER_GAME &&
                FrozenCookies.towerLimit &&
                TOWER_GAME.magicM >= getNumber("manaMax")
            ) {
                buildingBlacklist.push(7);
            }
            // Stop buying Mines if at set limit
            if (
                FrozenCookies.mineLimit &&
                Game.Objects["Mine"].amount >= getNumber("mineMax")
            )
                buildingBlacklist.push(3);
            // Stop buying Factories if at set limit
            if (
                FrozenCookies.factoryLimit &&
                Game.Objects["Factory"].amount >= getNumber("factoryMax")
            )
                buildingBlacklist.push(4);
            // Stop buying Cortex bakers if at set limit
            if (
                FrozenCookies.autoDragonOrbs &&
                FrozenCookies.cortexLimit &&
                Game.Objects["Cortex baker"].amount >= FrozenCookies.cortexMax
            )
                buildingBlacklist.push(18);
            FrozenCookies.caches.buildings = Game.ObjectsById.map(function (
                current
            ) {
                if (_.contains(buildingBlacklist, current.id)) {
                    return null;
                }
                const currentBank = bestBank(0).cost;
                const baseCpsOrig = baseCps();
                const cpsOrig = effectiveCps(Math.min(Game.cookies, currentBank));
                const existingAchievements = Object.values(Game.AchievementsById).map(
                    function (item) {
                        return item.won;
                    }
                );
                buildingToggle(current);
                const baseCpsNew = baseCps();
                const cpsNew = effectiveCps(currentBank);
                buildingToggle(current, existingAchievements);
                const deltaCps = cpsNew - cpsOrig;
                const baseDeltaCps = baseCpsNew - baseCpsOrig;
                const efficiency = purchaseEfficiency(
                    current.getPrice(),
                    deltaCps,
                    baseDeltaCps,
                    cpsOrig
                );
                return {
                    id: current.id,
                    efficiency: efficiency,
                    base_delta_cps: baseDeltaCps,
                    delta_cps: deltaCps,
                    cost: current.getPrice(),
                    purchase: current,
                    type: "building",
                };
            }).filter(function (a) {
                return a;
            });
        }
    }
    return FrozenCookies.caches.buildings;
}

// Use this for changes to future efficiency calcs
function purchaseEfficiency(price, deltaCps, _baseDeltaCps, currentCps) {
    if (deltaCps > 0) {
        return divCps(price, currentCps) + divCps(price, deltaCps);
    }
    return Number.POSITIVE_INFINITY;
}

function isAvailable(upgrade, upgradeBlacklist) {
    // should we even recommend upgrades at all?
    if (upgradeBlacklist === true) {
        return false;
    }

    // check if the upgrade is in the selected blacklist, or is an upgrade that shouldn't be recommended
    if (upgradeBlacklist.concat(RECOMMENDATION_BLACKLIST).includes(upgrade.id)) {
        return false;
    }

    // Is it vaulted?
    if (Game.Has("Inspired checklist") && Game.vault.includes(upgrade.id)) {
        return false;
    }

    // Don't pledge if Easter or Halloween not complete
    if (
        upgrade.id == 74 &&
        (Game.season == "halloween" || Game.season == "easter") &&
        !haveAll(Game.season)
    ) {
        return false;
    }

    // Don't pledge if we want to protect Shiny Wrinklers
    if (upgrade.id == 74 && FrozenCookies.shinyPop == 1) {
        return false;
    }

    // Web cookies are only on Browser
    if (App && upgrade.id == 816) {
        return false;
    }

    // Steamed cookies are only on Steam
    if (!App && upgrade.id == 817) {
        return false;
    }

    // Don't leave base season if it's desired
    if (
        (upgrade.id == 182 ||
            upgrade.id == 183 ||
            upgrade.id == 184 ||
            upgrade.id == 185 ||
            upgrade.id == 209) &&
        Game.baseSeason &&
        Game.UpgradesById[181].unlocked &&
        upgrade.id == 182 &&
        haveAll("christmas") &&
        upgrade.id == 183 &&
        haveAll("halloween") &&
        upgrade.id == 184 &&
        haveAll("valentines") &&
        upgrade.id == 209 &&
        haveAll("easter") &&
        (FrozenCookies.freeSeason == 2 ||
            (FrozenCookies.freeSeason == 1 &&
                ((Game.baseSeason == "christmas" && upgrade.id == 182) ||
                    (Game.baseSeason == "fools" && upgrade.id == 185))))
    ) {
        return false;
    }

    const needed = unfinishedUpgradePrereqs(upgrade);
    if (!upgrade.unlocked && !needed) {
        return false;
    }
    if (
        _.find(needed, function (a) {
            return a.type == "wrinklers";
        }) != null &&
        needed
    ) {
        return false;
    }
    if (
        _.find(needed, function (a) {
            return a.type == "santa";
        }) != null &&
        "christmas" != Game.season &&
        !Game.UpgradesById[181].unlocked &&
        !Game.prestige
    ) {
        return false;
    }
    if (
        (upgrade.season && !haveAll(Game.season)) ||
        (
            upgrade.season &&
            upgrade.season != SEASONS[FrozenCookies.defaultSeason] &&
            haveAll(upgrade.season)
        )
    ) {
        return false;
    }
    return true;
}

function santaStats() {
    return Game.Has("A festive hat") && Game.santaLevel + 1 < Game.santaLevels.length
        ? {
              id: 0,
              efficiency: Infinity,
              base_delta_cps: 0,
              delta_cps: 0,
              cost: cumulativeSantaCost(1),
              type: "santa",
              purchase: {
                  id: 0,
                  name:
                      "Santa Stage Upgrade (" +
                      Game.santaLevels[(Game.santaLevel + 1) % Game.santaLevels.length] +
                      ")",
                  buy: buySanta,
                  getCost: function () {
                      return cumulativeSantaCost(1);
                  },
              },
          }
        : [];
}

function defaultPurchase() {
    return {
        id: 0,
        efficiency: Infinity,
        delta_cps: 0,
        base_delta_cps: 0,
        cost: Infinity,
        type: "other",
        purchase: {
            id: 0,
            name: "No valid purchases!",
            buy: function () {},
            getCost: function () {
                return Infinity;
            },
        },
    };
}

function haveAll(holiday) {
    return _.every(HOLIDAY_COOKIES[holiday], function (id) {
        return Game.UpgradesById[id].unlocked;
    });
}

function checkPrices(currentUpgrade) {
    if (FrozenCookies.caches.recommendationList.length == 0) {
        return 0;
    }
    let nextRec = FrozenCookies.caches.recommendationList.filter(function (i) {
        return i.id != currentUpgrade.id;
    })[0];
    const nextPrereq =
        nextRec.type == "upgrade" ? unfinishedUpgradePrereqs(nextRec.purchase) : null;
    if (nextPrereq == null) {
        return 0;
    }
    const havingCosts = nextPrereq.filter(function (u) {
        return u.cost != null;
    });
    if (havingCosts.length > 0) {
        nextRec = FrozenCookies.caches.recommendationList.find(function (a) {
            return nextPrereq.some(function (b) {
                return b.id == a.id && b.type == a.type;
            });
        });
    }
    if (nextRec.cost == null) {
        return 0;
    }
    return nextRec.cost / totalDiscount(nextRec.type == "building") - nextRec.cost;
}


function upgradePrereqCost(upgrade, full) {
    let cost = upgrade.getPrice();
    if (upgrade.unlocked) {
        return cost;
    }
    const prereqs = UPGRADE_PREREQUISITES[upgrade.id];
    if (!prereqs) {
        return cost;
    }
    cost += prereqs.buildings.reduce(function (sum, item, index) {
        const building = Game.ObjectsById[index];
        if (item && full) {
            sum += cumulativeBuildingCost(building.basePrice, 0, item);
        } else if (item && building.amount < item) {
            sum += cumulativeBuildingCost(building.basePrice, building.amount, item);
        }
        return sum;
    }, 0);
    cost += prereqs.upgrades.reduce(function (sum, item) {
        const reqUpgrade = Game.UpgradesById[item];
        if (!upgrade.bought || full) {
            sum += upgradePrereqCost(reqUpgrade, full);
        }
        return sum;
    }, 0);
    cost += cumulativeSantaCost(prereqs.santa);
    return cost;
}

function unfinishedUpgradePrereqs(upgrade) {
    if (upgrade.unlocked) {
        return null;
    }
    const prereqs = UPGRADE_PREREQUISITES[upgrade.id];
    if (!prereqs) {
        return null;
    }
    const needed = [];
    prereqs.buildings.forEach(function (a, b) {
        if (a && Game.ObjectsById[b].amount < a) {
            needed.push({
                type: "building",
                id: b,
            });
        }
    });
    prereqs.upgrades.forEach(function (a) {
        if (!Game.UpgradesById[a].bought) {
            const recursiveUpgrade = Game.UpgradesById[a];
            const recursivePrereqs = unfinishedUpgradePrereqs(recursiveUpgrade);
            if (recursiveUpgrade.unlocked) {
                needed.push({
                    type: "upgrade",
                    id: a,
                });
            } else if (!recursivePrereqs) {
                // Research is being done.
            } else {
                recursivePrereqs.forEach(function (a) {
                    if (
                        !needed.some(function (b) {
                            return b.id == a.id && b.type == a.type;
                        })
                    ) {
                        needed.push(a);
                    }
                });
            }
        }
    });
    if (prereqs.santa) {
        needed.push({
            type: "santa",
            id: 0,
        });
    }
    if (prereqs.wrinklers && !Game.elderWrath) {
        needed.push({
            type: "wrinklers",
            id: 0,
        });
    }
    return needed.length ? needed : null;
}

function upgradeToggle(upgrade) {
    const reverseFunctions = {};
    if (!upgrade.unlocked) {
        const prereqs = UPGRADE_PREREQUISITES[upgrade.id];
        if (prereqs) {
            reverseFunctions.prereqBuildings = [];
            prereqs.buildings.forEach(function (requiredBuildings, buildingId) {
                const building = Game.ObjectsById[buildingId];
                if (requiredBuildings && building.amount < requiredBuildings) {
                    const difference = requiredBuildings - building.amount;
                    reverseFunctions.prereqBuildings.push({
                        id: buildingId,
                        amount: difference,
                    });
                    building.amount += difference;
                    building.bought += difference;
                    Game.BuildingsOwned += difference;
                }
            });
            reverseFunctions.prereqUpgrades = [];
            if (prereqs.upgrades.length > 0) {
                prereqs.upgrades.forEach(function (id) {
                    const upgrade = Game.UpgradesById[id];
                    if (!upgrade.bought) {
                        reverseFunctions.prereqUpgrades.push({
                            id: id,
                            reverseFunctions: upgradeToggle(upgrade),
                        });
                    }
                });
            }
        }
    }
    upgrade.bought = 1;
    Game.UpgradesOwned += 1;
    reverseFunctions.current = buyFunctionToggle(upgrade);
    return reverseFunctions;
}

function upgradeToggleReverse(upgrade, reverseFunctions) {
    if (reverseFunctions.prereqBuildings) {
        reverseFunctions.prereqBuildings.forEach(function (b) {
            const building = Game.ObjectsById[b.id];
            building.amount -= b.amount;
            building.bought -= b.amount;
            Game.BuildingsOwned -= b.amount;
        });
    }
    if (reverseFunctions.prereqUpgrades) {
        reverseFunctions.prereqUpgrades.forEach(function (u) {
            const upgrade = Game.UpgradesById[u.id];
            upgradeToggleReverse(upgrade, u.reverseFunctions);
        });
    }
    upgrade.bought = 0;
    Game.UpgradesOwned -= 1;
    buyFunctionToggle(reverseFunctions.current);
}

function buildingToggle(building, achievements) {
    if (!achievements) {
        building.amount += 1;
        building.bought += 1;
        Game.BuildingsOwned += 1;
    } else {
        building.amount -= 1;
        building.bought -= 1;
        Game.BuildingsOwned -= 1;
        Game.AchievementsOwned = 0;
        achievements.forEach(function (won, index) {
            const achievement = Game.AchievementsById[index];
            achievement.won = won;
            if (won && achievement.pool != "shadow") {
                Game.AchievementsOwned += 1;
            }
        });
    }
}

function buyFunctionToggle(upgrade) {
    if (!upgrade) {
        return null;
    }
    if (upgrade.id == 452) {
        return null;
    }
    if (!upgrade.length) {
        if (!upgrade.buyFunction) {
            return null;
        }

        const IGNORE_FUNCTIONS = [
            /Game\.Earn\('.*\)/,
            /Game\.Lock\('.*'\)/,
            /Game\.Unlock\(.*\)/,
            /Game\.Objects\['.*'\]\.drawFunction\(\)/,
            /Game\.Objects\['.*'\]\.redraw\(\)/,
            /Game\.SetResearch\('.*'\)/,
            /Game\.Upgrades\['.*'\]\.basePrice=.*/,
            "Game.CollectWrinklers()",
            "Game.RefreshBuildings()",
            "Game.storeToRefresh=1",
            "Game.upgradesToRebuild=1",
            /Game\.Popup\(.*\)/,
            /Game\.Notify\(.*\)/,
            /var\s+.+\s*=.+/,
            "Game.computeSeasonPrices()",
            "Game.seasonPopup.reset()",
            /\S/,
        ];
        const buyFunctions = upgrade.buyFunction
            .toString()
            .replace(/[\n\r\s]+/g, " ")
            .replace(/function\s*\(\)\s*{(.+)\s*}/, "$1")
            .replace(/for\s*\(.+\)\s*\{.+\}/, "")
            .replace(
                /if\s*\(this\.season\)\s*Game\.season=this\.season\;/,
                'Game.season="' + upgrade.season + '";'
            )
            .replace(/if\s*\(.+\)\s*[^{}]*?\;/, "")
            .replace(/if\s*\(.+\)\s*\{.+\}/, "")
            .replace(/else\s+\(.+\)\s*\;/, "")
            .replace("++", "+=1")
            .replace("--", "-=1")
            .split(";")
            .map(function (a) {
                return a.trim();
            })
            .filter(function (a) {
                for (const ignoreFunction of IGNORE_FUNCTIONS) {
                    if (a === "") {
                        break;
                    }
                    a = a.replace(ignoreFunction, "");
                }
                return a != "";
            });

        if (buyFunctions.length == 0) {
            return null;
        }

        const reversedFunctions = buyFunctions.map(function (a) {
            const achievementMatch = /Game\.Win\('(.*)'\)/.exec(a);
            if (a.indexOf("+=") > -1) {
                return a.replace("+=", "-=");
            }
            if (a.indexOf("-=") > -1) {
                return a.replace("-=", "+=");
            }
            if (
                achievementMatch &&
                Game.Achievements[achievementMatch[1]].won == 0
            ) {
                return "Game.Achievements['" + achievementMatch[1] + "'].won=0";
            }
            if (a.indexOf("=") < 0) {
                return "";
            }
            const expression = a.split("=");
            const expressionResult = eval(expression[0]);
            const isString = _.isString(expressionResult);
            return (
                expression[0] +
                "=" +
                (isString ? "'" : "") +
                expressionResult +
                (isString ? "'" : "")
            );
        });
        buyFunctions.forEach(function (f) {
            eval(f);
        });
        return reversedFunctions;
    }
    if (upgrade.length) {
        upgrade.forEach(function (f) {
            eval(f);
        });
    }
    return null;
}

function buySanta() {
    Game.specialTab = "santa";
    Game.UpgradeSanta();
    if (Game.santaLevel + 1 >= Game.santaLevels.length) {
        Game.ToggleSpecialMenu();
    }
}
