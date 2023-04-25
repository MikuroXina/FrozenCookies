import { cpsBonus } from "../fc_time.js";
import { safeBuy } from "../fc_pay.js";
import { getNumber } from "../fc_store.js";

export function start() {
    if (FrozenCookies.autoFTHOFCombo) {
        FrozenCookies.autoFTHOFComboBot = setInterval(
            autoFTHOFComboAction,
            getNumber("frequency") * 2
        );
    } else if (autoFTHOFComboAction.autobuyyes == 1) {
        set("autoBuy", 1);
        autoFTHOFComboAction.autobuyyes = 0;
    }
}

export function stop() {
    if (FrozenCookies.autoFTHOFComboBot) {
        clearInterval(FrozenCookies.autoFTHOFComboBot);
        FrozenCookies.autoFTHOFComboBot = 0;
    }
}

// Thank goodness for static variables otherwise this function would not have worked as intended.
function autoFTHOFComboAction() {
    const IDLE = 0;
    const CLICK_AND_BUILD = 1;
    const BUILD_AND_BUILD = 2;
    const OFF_AUTO_BUY_NOT_SELL = 3;

    if (!TOWER_GAME || FrozenCookies.autoFTHOFCombo == 0) {
        return;
    }

    // Prereqs check
    if (Game.Objects["Wizard tower"].level > 10) {
        // Will not work with wizard tower level > 10
        FrozenCookies.autoFTHOFCombo = 0;
        logEvent("autoFTHOFCombo", "Combo disabled, wizard tower level too high");
        return;
    }

    // Not currently possible to do the combo
    if (
        FrozenCookies.auto100ConsistencyCombo == 1 || // 100% combo should override
        FrozenCookies.autoSweet == 1 // Autosweet overrides
    ) {
        FrozenCookies.autoFTHOFCombo = 0;
    }

    if (typeof autoFTHOFComboAction.state == "undefined") {
        autoFTHOFComboAction.state = IDLE;
    }
    if (typeof autoFTHOFComboAction.count == "undefined") {
        autoFTHOFComboAction.count = 0;
    }

    if (
        autoFTHOFComboAction.state > OFF_AUTO_BUY_NOT_SELL ||
        // Combo started but failed
        (autoFTHOFComboAction.state > BUILD_AND_BUILD &&
            ((FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
                (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1)) &&
            !Game.hasBuff("Click frenzy") &&
            !nextSpellName(0) == "Click Frenzy" &&
            !nextSpellName(1) == "Click Frenzy")
    ) {
        if (autoFTHOFComboAction.autobuyyes == 1) {
            set("autoBuy", 1);
            autoFTHOFComboAction.autobuyyes = 0;
        }
        autoFTHOFComboAction.state = IDLE;
        logEvent("autoFTHOFCombo", "Soft fail, spell combo is gone");
    }

    if (
        autoFTHOFComboAction.state == IDLE &&
        ((nextSpellName(0) == "Click Frenzy" && nextSpellName(1) == "Building Special") ||
            (nextSpellName(1) == "Click Frenzy" &&
                nextSpellName(0) == "Building Special") ||
            (nextSpellName(0) == "Click Frenzy" && nextSpellName(1) == "Elder Frenzy") ||
            (nextSpellName(1) == "Click Frenzy" && nextSpellName(0) == "Elder Frenzy"))
    ) {
        autoFTHOFComboAction.state = CLICK_AND_BUILD;
    }
    if (
        autoFTHOFComboAction.state == IDLE &&
        nextSpellName(0) == "Building Special" &&
        nextSpellName(1) == "Building Special"
    ) {
        autoFTHOFComboAction.state = BUILD_AND_BUILD;
    }

    if (
        autoFTHOFComboAction.state == IDLE &&
        ((FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
            (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1))
    ) {
        // Continue casting Haggler's Charm - unless it's something we need right now
        if (nextSpellName(0) == "Sugar Lump") {
            TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
            logEvent("autoFTHOFCombo", "Cast Force the Hand of Fate");
        } else if (
            cpsBonus() < 1 &&
            (nextSpellName(0) == "Clot" || nextSpellName(0) == "Ruin Cookies")
        ) {
            TOWER_GAME.castSpell(TOWER_GAME.spellsById[2]);
            logEvent("autoFTHOFCombo", "Cast Stretch Time instead of FTHOF");
        } else {
            TOWER_GAME.castSpell(TOWER_GAME.spellsById[4]);
            logEvent("autoFTHOFCombo", "Cast Haggler's Charm instead of FTHOF");
        }
    }

    const SugarLevel = Game.Objects["Wizard tower"].level;
    if (SugarLevel == 0) {
        return;
    }

    // Calculated with https:// lookas123.github.io/CCGrimoireCalculator/
    const CONDITIONS = {
        1: {
            cost: 81,
            towers: 21,
        },
        2: {
            cost: 81,
            towers: 14,
        },
        3: {
            cost: 81,
            towers: 8,
        },
        4: {
            cost: 81,
            towers: 3,
        },
        5: {
            cost: 83,
            towers: 1,
        },
        6: {
            cost: 88,
            towers: 1,
        },
        7: {
            cost: 91,
            towers: 1,
        },
        8: {
            cost: 93,
            towers: 1,
        },
        9: {
            cost: 96,
            towers: 1,
        },
        10: {
            cost: 98,
            towers: 1,
        },
    };

    switch (autoFTHOFComboAction.state) {
        case IDLE:
            return;
        case CLICK_AND_BUILD:
            if (
                !nextSpellName(0) == "Click Frenzy" &&
                !nextSpellName(1) == "Click Frenzy"
            ) {
                autoFTHOFComboAction.state = IDLE;
                return;
            }
            if (
                (
                    (FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
                    (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1)
                ) &&
                cpsBonus() >= getNumber("minCpSMult") &&
                (
                    (
                        (Game.hasAura("Reaper of Fields") || Game.hasAura("Reality Bending")) &&
                        Game.hasBuff("Dragon Harvest") &&
                        Game.hasBuff("Frenzy") &&
                        remainsDragonHarvest(13) &&
                        remainsFrenzy(13)
                    ) ||
                    (
                        !Game.hasAura("Reaper of Fields") &&
                        (Game.hasBuff("Dragon Harvest") || Game.hasBuff("Frenzy")) &&
                        (remainsDragonHarvest(13) || remainsFrenzy(13))
                    )
                ) &&
                BuildingSpecialBuff() == 1 &&
                BuildingBuffTime() >= Math.ceil(13 * BuffTimeFactor())
            ) {
                if (TOWER_GAME.magic >= CONDITIONS[SugarLevel].cost) {
                    autoFTHOFComboAction.count = Game.Objects["Wizard tower"].amount - CONDITIONS[SugarLevel].towers;
                    TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                    logEvent(
                        "autoFTHOFCombo",
                        "Cast first Force the Hand of Fate"
                    );
                    autoFTHOFComboAction.state = OFF_AUTO_BUY_NOT_SELL;
                }
            }
            return;
        case BUILD_AND_BUILD:
            if (
                !nextSpellName(0) == "Building Special" &&
                !nextSpellName(1) == "Building Special"
            ) {
                autoFTHOFComboAction.state = IDLE;
                return;
            }
            if (
                (
                    (FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
                    (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1)
                ) &&
                cpsBonus() >= getNumber("minCpSMult") &&
                (
                    (
                        (Game.hasAura("Reaper of Fields") || Game.hasAura("Reality Bending")) &&
                        Game.hasBuff("Dragon Harvest") &&
                        Game.hasBuff("Frenzy") &&
                        remainsDragonHarvest(13) &&
                        remainsFrenzy(13)
                    ) ||
                    (
                        !Game.hasAura("Reaper of Fields") &&
                        (Game.hasBuff("Dragon Harvest") || Game.hasBuff("Frenzy")) &&
                        (remainsDragonHarvest(13) || remainsFrenzy(13))
                    )
                ) &&
                (Game.hasBuff("Click frenzy") || Game.hasBuff("Dragonflight")) &&
                (remainsClickFrenzy(10) || remainsDragonflight(6))
            ) {
                if (TOWER_GAME.magic >= CONDITIONS[SugarLevel].cost) {
                    autoFTHOFComboAction.count = Game.Objects["Wizard tower"].amount - CONDITIONS[SugarLevel].towers;
                    TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                    logEvent(
                        "autoFTHOFCombo",
                        "Cast first Force the Hand of Fate"
                    );
                    autoFTHOFComboAction.state = OFF_AUTO_BUY_NOT_SELL;
                }
            }
            return;
        case OFF_AUTO_BUY_NOT_SELL:
            // Turn off autoBuy and make sure we're not in sell mode
            if (!!getNumber("autoBuy")) {
                autoFTHOFComboAction.autobuyyes = 1;
                set("autoBuy", 0);
            } else {
                autoFTHOFComboAction.autobuyyes = 0;
            }
            if (Game.buyMode == -1) {
                Game.buyMode = 1;
            }
            Game.Objects["Wizard tower"].sell(autoFTHOFComboAction.count);
            TOWER_GAME.computeMagicM(); // Recalc max after selling
            TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
            logEvent("autoFTHOFCombo", "Double cast Force the Hand of Fate");
            if (
                FrozenCookies.towerLimit &&
                getNumber("manaMax") <= 100 &&
                autoFTHOFComboAction.count <= 497
            ) {
                safeBuy(Game.Objects["Wizard tower"], autoFTHOFComboAction.count);
            } else if (
                FrozenCookies.towerLimit &&
                getNumber("manaMax") <= 100 &&
                SugarLevel == 10
            ) {
                safeBuy(Game.Objects["Wizard tower"], 486);
            } else {
                safeBuy(Game.Objects["Wizard tower"], autoFTHOFComboAction.count);
            }
            modify("autobuyCount", (count) => count + 1);
            // Turn autoBuy back on if it was on before
            if (autoFTHOFComboAction.autobuyyes == 1) {
                set("autoBuy", 1);
                autoFTHOFComboAction.autobuyyes = 0;
            }
            autoFTHOFComboAction.count = 0;
            autoFTHOFComboAction.state = IDLE;
            return;
    }
}
