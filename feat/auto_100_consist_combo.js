import { cpsBonus, goldenCookieLife, hasClickBuff } from "../fc_time.js";
import { safeBuy } from "../fc_pay.js";
import { getNumber } from "../fc_store.js";

export function start() {
    if (FrozenCookies.auto100ConsistencyCombo) {
        FrozenCookies.auto100ConsistencyComboBot = setInterval(
            auto100ConsistencyComboAction,
            getNumber("frequency") * 2
        );
        return;
    }
    if (auto100ConsistencyComboAction.autobuyyes == 1) {
        FrozenCookies.autoBuy = 1;
        auto100ConsistencyComboAction.autobuyyes = 0;
    }
    if (auto100ConsistencyComboAction.autogcyes == 1) {
        FrozenCookies.autoGC = 1;
        auto100ConsistencyComboAction.autogcyes = 0;
    }
    if (auto100ConsistencyComboAction.autogodyes == 1) {
        FrozenCookies.autoGodzamok = 1;
        auto100ConsistencyComboAction.autogodyes = 0;
    }
    if (auto100ConsistencyComboAction.autoworshipyes == 1) {
        FrozenCookies.autoWorshipToggle = 1;
        auto100ConsistencyComboAction.autoworshipyes = 0;
    }
    if (auto100ConsistencyComboAction.autodragonyes == 1) {
        FrozenCookies.autoDragonToggle = 1;
        auto100ConsistencyComboAction.autodragonyes = 0;
    }
}

export function stop() {
    if (FrozenCookies.auto100ConsistencyComboBot) {
        clearInterval(FrozenCookies.auto100ConsistencyComboBot);
        FrozenCookies.auto100ConsistencyComboBot = 0;
    }
}

function auto100ConsistencyComboAction() {
    if (
        !TOWER_GAME ||
        !GARDEN_GAME ||
        FrozenCookies.auto100ConsistencyCombo == 0
    ) {
        return;
    }

    // Prereqs check
    if (
        Game.Objects["Wizard tower"].level != 10 // Only works with wizard towers level 10
    ) {
        FrozenCookies.auto100ConsistencyCombo = 0;
        logEvent("auto100ConsistencyCombo", "Combo disabled, impossible");
        return;
    }

    // Autosweet overrides
    if (FrozenCookies.autoSweet == 1) {
        FrozenCookies.auto100ConsistencyCombo = 0;
    }

    // Not currently possible to do the combo
    if (
        Game.dragonLevel < 26 || // Fully upgraded dragon needed for two auras
        !GARDEN_GAME.canPlant(GARDEN_GAME.plantsById[14]) // Can currently plant whiskerbloom
    ) {
        return;
    }

    if (typeof auto100ConsistencyComboAction.state == "undefined") {
        auto100ConsistencyComboAction.state = 0;
    }
    if (typeof auto100ConsistencyComboAction.countFarm == "undefined") {
        auto100ConsistencyComboAction.countFarm = 0;
    }
    if (typeof auto100ConsistencyComboAction.countMine == "undefined") {
        auto100ConsistencyComboAction.countMine = 0;
    }
    if (typeof auto100ConsistencyComboAction.countFactory == "undefined") {
        auto100ConsistencyComboAction.countFactory = 0;
    }
    if (typeof auto100ConsistencyComboAction.countBank == "undefined") {
        auto100ConsistencyComboAction.countBank = 0;
    }
    if (typeof auto100ConsistencyComboAction.countTemple == "undefined") {
        auto100ConsistencyComboAction.countTemple = 0;
    }
    if (typeof auto100ConsistencyComboAction.countWizard == "undefined") {
        auto100ConsistencyComboAction.countWizard = 0;
    }
    if (typeof auto100ConsistencyComboAction.countShipment == "undefined") {
        auto100ConsistencyComboAction.countShipment = 0;
    }
    if (typeof auto100ConsistencyComboAction.countAlchemy == "undefined") {
        auto100ConsistencyComboAction.countAlchemy = 0;
    }
    if (typeof auto100ConsistencyComboAction.countTimeMach == "undefined") {
        auto100ConsistencyComboAction.countTimeMach = 0;
    }

    if (
        auto100ConsistencyComboAction.state > 20 ||
        // Either at stage 0 or 1 with flags set or in progress, but broken
        (((auto100ConsistencyComboAction.state < 2 &&
            (auto100ConsistencyComboAction.autobuyyes == 1 ||
                auto100ConsistencyComboAction.autogcyes == 1 ||
                auto100ConsistencyComboAction.autogsyes == 1 ||
                auto100ConsistencyComboAction.autogodyes == 1 ||
                auto100ConsistencyComboAction.autodragonyes == 1 ||
                auto100ConsistencyComboAction.autoworshipyes == 1)) ||
            (auto100ConsistencyComboAction.state > 1 &&
                !BuildingSpecialBuff() &&
                !hasClickBuff())) &&
            ((FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
                (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1)))
    ) {
        if (auto100ConsistencyComboAction.autobuyyes == 1) {
            FrozenCookies.autoBuy = 1;
            auto100ConsistencyComboAction.autobuyyes = 0;
        }
        if (auto100ConsistencyComboAction.autogcyes == 1) {
            FrozenCookies.autoGC = 1;
            auto100ConsistencyComboAction.autogcyes = 0;
        }
        if (auto100ConsistencyComboAction.autogsyes == 1) {
            FrozenCookies.autoGS = 1;
            auto100ConsistencyComboAction.autogsyes = 0;
        }
        if (auto100ConsistencyComboAction.autogodyes == 1) {
            FrozenCookies.autoGodzamok = 1;
            auto100ConsistencyComboAction.autogodyes = 0;
        }
        if (auto100ConsistencyComboAction.autodragonyes == 1) {
            FrozenCookies.autoDragonToggle = 1;
            auto100ConsistencyComboAction.autodragonyes = 0;
        }
        if (auto100ConsistencyComboAction.autoworshipyes == 1) {
            FrozenCookies.autoWorshipToggle = 1;
            auto100ConsistencyComboAction.autoworshipyes = 0;
        }
        auto100ConsistencyComboAction.state = 0;
        logEvent("auto100ConsistencyCombo", "Trying to recover from soft fail");
    }

    if (
        !auto100ConsistencyComboAction.state &&
        TOWER_GAME.magicM >= 98 &&
        ((nextSpellName(0) == "Click Frenzy" && nextSpellName(1) == "Building Special") ||
            (nextSpellName(1) == "Click Frenzy" &&
                nextSpellName(0) == "Building Special") ||
            (nextSpellName(0) == "Click Frenzy" && nextSpellName(1) == "Elder Frenzy") ||
            (nextSpellName(1) == "Click Frenzy" && nextSpellName(0) == "Elder Frenzy"))
    ) {
        auto100ConsistencyComboAction.state = 1;
    }

    auto100ConsistencyComboAction.countFarm = Game.Objects["Farm"].amount - 1;
    auto100ConsistencyComboAction.countMine = Game.Objects["Mine"].amount;
    auto100ConsistencyComboAction.countFactory = Game.Objects["Factory"].amount;
    auto100ConsistencyComboAction.countBank = Game.Objects["Bank"].amount - 1;
    auto100ConsistencyComboAction.countTemple = Game.Objects["Temple"].amount - 1;
    auto100ConsistencyComboAction.countWizard = Game.Objects["Wizard tower"].amount - 1;
    auto100ConsistencyComboAction.countShipment = Game.Objects["Shipment"].amount;
    auto100ConsistencyComboAction.countAlchemy = Game.Objects["Alchemy lab"].amount;
    auto100ConsistencyComboAction.countTimeMach = Game.Objects["Time machine"].amount;

    // Continue casting Haggler's Charm - unless it's something we need right now
    if (
        !auto100ConsistencyComboAction.state &&
        ((FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
            (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1))
    ) {
        if (nextSpellName(0) == "Sugar Lump") {
            TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
            logEvent("auto100ConsistencyCombo", "Cast Force the Hand of Fate");
        } else if (
            cpsBonus() < 1 &&
            (nextSpellName(0) == "Clot" || nextSpellName(0) == "Ruin Cookies")
        ) {
            TOWER_GAME.castSpell(TOWER_GAME.spellsById[2]);
            logEvent("auto100ConsistencyCombo", "Cast Stretch Time instead of FTHOF");
        } else {
            TOWER_GAME.castSpell(TOWER_GAME.spellsById[4]);
            logEvent("auto100ConsistencyCombo", "Cast Haggler's Charm instead of FTHOF");
        }
    }

    switch (auto100ConsistencyComboAction.state) {
        case 0:
            return;

        case 1: // Start combo
            if (
                ((FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
                    (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1)) &&
                cpsBonus() >= FrozenCookies.minCpSMult &&
                (((Game.hasAura("Reaper of Fields") || Game.hasAura("Reality Bending")) &&
                    Game.hasBuff("Dragon Harvest") &&
                    Game.hasBuff("Frenzy") &&
                    Game.hasBuff("Dragon Harvest").time / 30 >=
                        Math.ceil(13 * BuffTimeFactor()) - 1 &&
                    Game.hasBuff("Frenzy").time / 30 >=
                        Math.ceil(13 * BuffTimeFactor()) - 1) ||
                    (!Game.hasAura("Reaper of Fields") &&
                        (Game.hasBuff("Dragon Harvest") || Game.hasBuff("Frenzy")) &&
                        (Game.hasBuff("Dragon Harvest").time / 30 >=
                            Math.ceil(13 * BuffTimeFactor()) - 1 ||
                            Game.hasBuff("Frenzy").time / 30 >=
                                Math.ceil(13 * BuffTimeFactor()) - 1))) &&
                BuildingSpecialBuff() == 1 &&
                BuildingBuffTime() >= Math.ceil(13 * BuffTimeFactor())
            ) {
                // Turn off autoBuy
                if (FrozenCookies.autoBuy == 1) {
                    auto100ConsistencyComboAction.autobuyyes = 1;
                    FrozenCookies.autoBuy = 0;
                } else {
                    auto100ConsistencyComboAction.autobuyyes = 0;
                }
                // Turn off Auto Dragon Auras
                if (FrozenCookies.autoDragonToggle == 1) {
                    auto100ConsistencyComboAction.autodragonyes = 1;
                    FrozenCookies.autoDragonToggle = 0;
                } else {
                    auto100ConsistencyComboAction.autodragonyes = 0;
                }
                // Turn off Auto Pantheon
                if (FrozenCookies.autoWorshipToggle == 1) {
                    auto100ConsistencyComboAction.autoworshipyes = 1;
                    FrozenCookies.autoWorshipToggle = 0;
                } else {
                    auto100ConsistencyComboAction.autoworshipyes = 0;
                }
                logEvent("auto100ConsistencyCombo", "Starting combo");
                auto100ConsistencyComboAction.state = 2;
            }
            return;

        case 2: // Turn off auto click golden cookie
            if (FrozenCookies.autoGC > 0) {
                auto100ConsistencyComboAction.autogcyes = 1;
                FrozenCookies.autoGC = 0;
            } else {
                auto100ConsistencyComboAction.autogcyes = 0;
            }
            if (FrozenCookies.autoGS > 0) {
                auto100ConsistencyComboAction.autogsyes = 1;
                FrozenCookies.autoGS = 0;
            } else {
                auto100ConsistencyComboAction.autogsyes = 0;
            }
            auto100ConsistencyComboAction.state = 3;
            return;

        case 3: // Check for whiskerbloom (14) and if not found, plant it
            let whisk = false;
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 6; j++) {
                    if (GARDEN_GAME.plot[i][j][0] - 1 === 14) {
                        whisk = true;
                    }
                }
            }
            if (whisk) {
                auto100ConsistencyComboAction.state = 4;
                return;
            }
            GARDEN_GAME.harvestAll();
            for (let y = 0; y <= 5; y++) {
                for (let x = 0; x <= 5; x++) {
                    GARDEN_GAME.seedSelected = GARDEN_GAME.plants["whiskerbloom"].id;
                    GARDEN_GAME.clickTile(x, y);
                }
            }
            auto100ConsistencyComboAction.state = 4;
            return;

        case 4: // Change dragon auras to radiant appetite and dragon's fortune
            if (
                Game.dragonAura == 16 && // DF
                !Game.dragonAura2 == 15 // RA
            ) {
                Game.specialTab = "dragon";
                Game.SetDragonAura(15, 1);
                Game.ConfirmPrompt();
            } else if (!Game.hasAura("Radiant Appetite")) {
                Game.specialTab = "dragon";
                Game.SetDragonAura(15, 0);
                Game.ConfirmPrompt();
            }

            if (
                Game.dragonAura2 == 15 && // RA
                !Game.dragonAura == 16 // DF
            ) {
                Game.specialTab = "dragon";
                Game.SetDragonAura(16, 0);
                Game.ConfirmPrompt();
            } else if (!Game.hasAura("Dragon's Fortune")) {
                Game.specialTab = "dragon";
                Game.SetDragonAura(16, 1);
                Game.ConfirmPrompt();
            }
            auto100ConsistencyComboAction.state = 5;
            return;

        case 5: // Activate golden switch to prevent backfired natural GCs
            if (
                Game.Upgrades["Golden switch [off]"].unlocked &&
                !Game.Upgrades["Golden switch [off]"].bought
            ) {
                Game.Upgrades["Golden switch [off]"].buy();
            }
            auto100ConsistencyComboAction.state = 6;
            return;

        case 6: // Cast FTHOF 1
            if (
                (FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
                (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1)
            ) {
                TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                logEvent("auto100ConsistencyCombo", "Cast FTHOF 1");
                auto100ConsistencyComboAction.state = 7;
            }
            return;

        case 7: // Cast FTHOF 2 then buy
            Game.Objects["Wizard tower"].sell(auto100ConsistencyComboAction.countWizard);
            TOWER_GAME.computeMagicM(); // Recalc max after selling
            if (TOWER_GAME.magic >= 30) {
                TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                logEvent("auto100ConsistencyCombo", "Cast FTHOF 2");
                Game.Objects["Wizard tower"].buy(
                    auto100ConsistencyComboAction.countWizard
                );
                FrozenCookies.autobuyCount += 1;
                auto100ConsistencyComboAction.state = 8;
            }
            return;

        case 8: // Use sugar lump to refill magic
            TOWER_GAME.lumpRefill.click();
            Game.ConfirmPrompt();
            auto100ConsistencyComboAction.state = 9;
            return;

        case 9: // Cast FTHOF 3
            if (
                (FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
                (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1)
            ) {
                TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                logEvent("auto100ConsistencyCombo", "Cast FTHOF 3");
                auto100ConsistencyComboAction.state = 10;
            }
            return;

        case 10: // Cast FTHOF 4 then buy
            Game.Objects["Wizard tower"].sell(auto100ConsistencyComboAction.countWizard);
            TOWER_GAME.computeMagicM(); // Recalc max after selling
            if (TOWER_GAME.magic >= 30) {
                TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                logEvent("auto100ConsistencyCombo", "Cast FTHOF 4");
                Game.Objects["Wizard tower"].buy(
                    auto100ConsistencyComboAction.countWizard
                );
                FrozenCookies.autobuyCount += 1;
                auto100ConsistencyComboAction.state = 11;
            }

            return;

        case 11: // If autoGodzamok is on, disable
            if (FrozenCookies.autoGodzamok > 0) {
                auto100ConsistencyComboAction.autogodyes = 1;
                FrozenCookies.autoGodzamok = 0;
            } else {
                auto100ConsistencyComboAction.autogodyes = 0;
            }
            auto100ConsistencyComboAction.state = 12;

            return;

        case 12: // Activate Building Special/Elder Frenzy and Click Frenzy buffs
            Game.shimmers[0].pop();
            Game.shimmers[0].pop();
            auto100ConsistencyComboAction.state = 13;
            return;

        case 13: // sell buildings for first Devastation boost
            if (!Game.hasGod("ruin") && TEMPLE_GAME.swaps >= 1) {
                swapIn(2, 0);
            }
            Game.Objects["Farm"].sell(auto100ConsistencyComboAction.countFarm);
            Game.Objects["Mine"].sell(auto100ConsistencyComboAction.countMine);
            Game.Objects["Factory"].sell(auto100ConsistencyComboAction.countFactory);
            Game.Objects["Bank"].sell(auto100ConsistencyComboAction.countBank);
            Game.Objects["Temple"].sell(auto100ConsistencyComboAction.countTemple);
            Game.Objects["Shipment"].sell(auto100ConsistencyComboAction.countShipment);
            Game.Objects["Alchemy lab"].sell(auto100ConsistencyComboAction.countAlchemy);
            Game.Objects["Time machine"].sell(
                auto100ConsistencyComboAction.countTimeMach
            );
            auto100ConsistencyComboAction.state = 14;
            return;

        case 14: // Swap Mokalsium to ruby slot
            if (!Game.hasGod("mother") && TEMPLE_GAME.swaps >= 1) {
                swapIn(8, 1);
            }
            auto100ConsistencyComboAction.state = 15;
            return;

        case 15: // buy back buildings
            safeBuy(Game.Objects["Farm"], auto100ConsistencyComboAction.countFarm);
            safeBuy(Game.Objects["Mine"], auto100ConsistencyComboAction.countMine);
            safeBuy(Game.Objects["Factory"], auto100ConsistencyComboAction.countFactory);
            safeBuy(Game.Objects["Bank"], auto100ConsistencyComboAction.countBank);
            safeBuy(Game.Objects["Temple"], auto100ConsistencyComboAction.countTemple);
            safeBuy(
                Game.Objects["Shipment"],
                auto100ConsistencyComboAction.countShipment
            );
            safeBuy(
                Game.Objects["Alchemy lab"],
                auto100ConsistencyComboAction.countAlchemy
            );
            safeBuy(
                Game.Objects["Time machine"],
                auto100ConsistencyComboAction.countTimeMach
            );
            FrozenCookies.autobuyCount += 1;
            auto100ConsistencyComboAction.state = 16;
            return;

        case 16: // Pop any other golden cookies as long as they're not wrath
            for (const i in Game.shimmers) {
                if (Game.shimmers[i].type == "golden" && !Game.shimmer.wrath) {
                    Game.shimmers[i].pop();
                }
            }
            auto100ConsistencyComboAction.state = 17;
            return;

        case 17: // Perform custom autogodzamok
            if (!Game.hasBuff("Devastation") && hasClickBuff()) {
                if (Game.Objects["Farm"].amount >= 10) {
                    Game.Objects["Farm"].sell(auto100ConsistencyComboAction.countFarm);
                    Game.Objects["Mine"].sell(auto100ConsistencyComboAction.countMine);
                    Game.Objects["Factory"].sell(
                        auto100ConsistencyComboAction.countFactory
                    );
                    Game.Objects["Bank"].sell(auto100ConsistencyComboAction.countBank);
                    Game.Objects["Temple"].sell(
                        auto100ConsistencyComboAction.countTemple
                    );
                    Game.Objects["Shipment"].sell(
                        auto100ConsistencyComboAction.countShipment
                    );
                    Game.Objects["Alchemy lab"].sell(
                        auto100ConsistencyComboAction.countAlchemy
                    );
                    Game.Objects["Time machine"].sell(
                        auto100ConsistencyComboAction.countTimeMach
                    );
                }
                if (Game.Objects["Farm"].amount < 10) {
                    safeBuy(
                        Game.Objects["Farm"],
                        auto100ConsistencyComboAction.countFarm -
                            Game.Objects["Farm"].amount
                    );
                    safeBuy(
                        Game.Objects["Mine"],
                        auto100ConsistencyComboAction.countMine -
                            Game.Objects["Mine"].amount
                    );
                    safeBuy(
                        Game.Objects["Factory"],
                        auto100ConsistencyComboAction.countFactory -
                            Game.Objects["Factory"].amount
                    );
                    safeBuy(
                        Game.Objects["Bank"],
                        auto100ConsistencyComboAction.countBank -
                            Game.Objects["Bank"].amount
                    );
                    safeBuy(
                        Game.Objects["Temple"],
                        auto100ConsistencyComboAction.countTemple -
                            Game.Objects["Temple"].amount
                    );
                    safeBuy(
                        Game.Objects["Shipment"],
                        auto100ConsistencyComboAction.countShipment -
                            Game.Objects["Shipment"].amount
                    );
                    safeBuy(
                        Game.Objects["Alchemy lab"],
                        auto100ConsistencyComboAction.countAlchemy -
                            Game.Objects["Alchemy lab"].amount
                    );
                    safeBuy(
                        Game.Objects["Time machine"],
                        auto100ConsistencyComboAction.countTimeMach -
                            Game.Objects["Time machine"].amount
                    );
                    FrozenCookies.autobuyCount += 1;
                }
            }
            if (Game.hasBuff("Devastation") && hasClickBuff()) {
                if (
                    Game.Objects["Farm"].amount < auto100ConsistencyComboAction.countFarm
                ) {
                    safeBuy(
                        Game.Objects["Farm"],
                        auto100ConsistencyComboAction.countFarm -
                            Game.Objects["Farm"].amount
                    );
                }
                if (
                    Game.Objects["Mine"].amount < auto100ConsistencyComboAction.countMine
                ) {
                    safeBuy(
                        Game.Objects["Mine"],
                        auto100ConsistencyComboAction.countMine -
                            Game.Objects["Mine"].amount
                    );
                }
                if (
                    Game.Objects["Factory"].amount <
                    auto100ConsistencyComboAction.countFactory
                ) {
                    safeBuy(
                        Game.Objects["Factory"],
                        auto100ConsistencyComboAction.countFactory -
                            Game.Objects["Factory"].amount
                    );
                }
                if (
                    Game.Objects["Bank"].amount < auto100ConsistencyComboAction.countBank
                ) {
                    safeBuy(
                        Game.Objects["Bank"],
                        auto100ConsistencyComboAction.countBank -
                            Game.Objects["Bank"].amount
                    );
                }
                if (
                    Game.Objects["Temple"].amount <
                    auto100ConsistencyComboAction.countTemple
                ) {
                    safeBuy(
                        Game.Objects["Temple"],
                        auto100ConsistencyComboAction.countTemple -
                            Game.Objects["Temple"].amount
                    );
                }
                if (
                    Game.Objects["Shipment"].amount <
                    auto100ConsistencyComboAction.countShipment
                ) {
                    safeBuy(
                        Game.Objects["Shipment"],
                        auto100ConsistencyComboAction.countShipment -
                            Game.Objects["Shipment"].amount
                    );
                }
                if (
                    Game.Objects["Alchemy lab"].amount <
                    auto100ConsistencyComboAction.countAlchemy
                ) {
                    safeBuy(
                        Game.Objects["Alchemy lab"],
                        auto100ConsistencyComboAction.countAlchemy -
                            Game.Objects["Alchemy lab"].amount
                    );
                }
                if (
                    Game.Objects["Time machine"].amount <
                    auto100ConsistencyComboAction.countTimeMach
                ) {
                    safeBuy(
                        Game.Objects["Time machine"],
                        auto100ConsistencyComboAction.countTimeMach -
                            Game.Objects["Time machine"].amount
                    );
                }
                FrozenCookies.autobuyCount += 1;
            }

            if (!hasClickBuff()) {
                auto100ConsistencyComboAction.state = 18;
            }
            return;

        case 18: // Once click frenzy buff and GCs are gone, turn autoGC on if it were on previously
            if (!Game.hasBuff("Click frenzy") && !goldenCookieLife()) {
                if (
                    Game.Upgrades["Golden switch [on]"].unlocked &&
                    !Game.Upgrades["Golden switch [on]"].bought
                ) {
                    Game.CalculateGains(); // Ensure price is updated since Frenzy ended
                    Game.Upgrades["Golden switch [on]"].buy();
                }
                if (auto100ConsistencyComboAction.autogcyes == 1) {
                    FrozenCookies.autoGC = 1;
                    auto100ConsistencyComboAction.autogcyes = 0;
                }
                if (auto100ConsistencyComboAction.autogsyes == 1) {
                    FrozenCookies.autoGS = 1;
                    auto100ConsistencyComboAction.autogsyes = 0;
                }
                auto100ConsistencyComboAction.state = 19;
            }
            return;

        case 19: // Buy back
            if (Game.Objects["Farm"].amount < auto100ConsistencyComboAction.countFarm) {
                safeBuy(
                    Game.Objects["Farm"],
                    auto100ConsistencyComboAction.countFarm - Game.Objects["Farm"].amount
                );
            }
            if (Game.Objects["Mine"].amount < auto100ConsistencyComboAction.countMine) {
                safeBuy(
                    Game.Objects["Mine"],
                    auto100ConsistencyComboAction.countMine - Game.Objects["Mine"].amount
                );
            }
            if (
                Game.Objects["Factory"].amount <
                auto100ConsistencyComboAction.countFactory
            ) {
                safeBuy(
                    Game.Objects["Factory"],
                    auto100ConsistencyComboAction.countFactory -
                        Game.Objects["Factory"].amount
                );
            }
            if (Game.Objects["Bank"].amount < auto100ConsistencyComboAction.countBank) {
                safeBuy(
                    Game.Objects["Bank"],
                    auto100ConsistencyComboAction.countBank - Game.Objects["Bank"].amount
                );
            }
            if (
                Game.Objects["Temple"].amount < auto100ConsistencyComboAction.countTemple
            ) {
                safeBuy(
                    Game.Objects["Temple"],
                    auto100ConsistencyComboAction.countTemple -
                        Game.Objects["Temple"].amount
                );
            }
            if (
                Game.Objects["Shipment"].amount <
                auto100ConsistencyComboAction.countShipment
            ) {
                safeBuy(
                    Game.Objects["Shipment"],
                    auto100ConsistencyComboAction.countShipment -
                        Game.Objects["Shipment"].amount
                );
            }
            if (
                Game.Objects["Alchemy lab"].amount <
                auto100ConsistencyComboAction.countAlchemy
            ) {
                safeBuy(
                    Game.Objects["Alchemy lab"],
                    auto100ConsistencyComboAction.countAlchemy -
                        Game.Objects["Alchemy lab"].amount
                );
            }
            if (
                Game.Objects["Time machine"].amount <
                auto100ConsistencyComboAction.countTimeMach
            ) {
                safeBuy(
                    Game.Objects["Time machine"],
                    auto100ConsistencyComboAction.countTimeMach -
                        Game.Objects["Time machine"].amount
                );
            }
            if (
                Game.Objects["Antimatter condenser"].amount <
                auto100ConsistencyComboAction.countAntiMatter
            ) {
                safeBuy(
                    Game.Objects["Antimatter condenser"],
                    auto100ConsistencyComboAction.countAntiMatter -
                        Game.Objects["Antimatter condenser"].amount
                );
            }
            FrozenCookies.autobuyCount += 1;
            auto100ConsistencyComboAction.state = 20;
            return;

        case 20: // Turning things back on
            if (auto100ConsistencyComboAction.autobuyyes == 1) {
                FrozenCookies.autoBuy = 1;
                auto100ConsistencyComboAction.autobuyyes = 0;
            }
            if (auto100ConsistencyComboAction.autogodyes == 1) {
                FrozenCookies.autoGodzamok = 1;
                auto100ConsistencyComboAction.autogodyes = 0;
            }
            if (auto100ConsistencyComboAction.autodragonyes == 1) {
                FrozenCookies.autoDragonToggle = 1;
                auto100ConsistencyComboAction.autodragonyes = 0;
            }
            if (auto100ConsistencyComboAction.autoworshipyes == 1) {
                FrozenCookies.autoWorshipToggle = 1;
                auto100ConsistencyComboAction.autoworshipyes = 0;
            }
            logEvent("auto100ConsistencyCombo", "Combo completed");
            auto100ConsistencyComboAction.state = 0;
            return;
    }
}
