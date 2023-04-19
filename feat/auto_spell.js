import { Beautify } from "../fc_beautify.js";
import { cpsBonus } from "../fc_time.js";

export function start() {
    if (FrozenCookies.autoSpell) {
        FrozenCookies.autoSpellBot = setInterval(autoCast, FrozenCookies.frequency * 10);
    }
}

export function stop() {
    if (FrozenCookies.autoSpellBot) {
        clearInterval(FrozenCookies.autoSpellBot);
        FrozenCookies.autoSpellBot = 0;
    }
}

function autoCast() {
    if (!TOWER_GAME || FrozenCookies.autoSpell == 0) {
        return;
    }

    if (
        FrozenCookies.autoFTHOFCombo == 1 ||
        FrozenCookies.auto100ConsistencyCombo == 1 ||
        FrozenCookies.autoSweet == 1
    ) {
        FrozenCookies.autoSpell = 0;
    }

    if (
        !((FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
        (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1))
    ) {
        return;
    }

    // Free lump!
    if (
        TOWER_GAME.magicM >=
            Math.floor(
                TOWER_GAME.spellsById[1].costMin + TOWER_GAME.spellsById[1].costPercent * TOWER_GAME.magicM
            ) &&
        nextSpellName(0) == "Sugar Lump"
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
        logEvent("AutoSpell", "Cast Force the Hand of Fate for a free lump");
        return;
    }

    // Can we shorten a negative buff with a backfire?
    if (
        TOWER_GAME.magicM >=
            Math.floor(
                TOWER_GAME.spellsById[2].costMin + TOWER_GAME.spellsById[2].costPercent * TOWER_GAME.magicM
            ) &&
        ((cpsBonus() < 7 &&
            (Game.hasBuff("Loan 1 (interest)") ||
                Game.hasBuff("Loan 2 (interest)") ||
                Game.hasBuff("Loan 3 (interest)"))) ||
            cpsBonus() < 1) &&
        (nextSpellName(0) == "Clot" || nextSpellName(0) == "Ruin Cookies")
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[2]);
        logEvent("AutoSpell", "Cast Stretch Time to shorten debuff");
        return;
    }

    // Will it backfire?
    if (
        TOWER_GAME.magicM >=
            Math.floor(
                TOWER_GAME.spellsById[4].costMin + TOWER_GAME.spellsById[4].costPercent * TOWER_GAME.magicM
            ) &&
        cpsBonus() >= FrozenCookies.minCpSMult &&
        (nextSpellName(0) == "Clot" || nextSpellName(0) == "Ruin Cookies")
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[4]);
        logEvent("AutoSpell", "Cast Haggler's Charm to avoid backfire");
        return;
    }

    switch (FrozenCookies.autoSpell) {
        case 1:
            autoCastConjureBakedGoods();
            return;

        case 2:
            autoCastForceHandFate();
            return;

        case 3:
            autoCastSpontaneousEdifice();
            return;

        case 4:
            autoCastHagglersCharm();
            return;

        case 5:
            autoCastForceHandFateClickSpecialsOnly();
            return;
    }
}

function autoCastConjureBakedGoods() {
    if (
        TOWER_GAME.magicM <
        Math.floor(
            TOWER_GAME.spellsById[0].costMin + TOWER_GAME.spellsById[0].costPercent * TOWER_GAME.magicM
        )
    ) {
        return;
    }
    TOWER_GAME.castSpell(TOWER_GAME.spellsById[0]);
    logEvent("AutoSpell", "Cast Conjure Baked Goods");
}

function autoCastForceHandFate() {
    if (
        TOWER_GAME.magicM <
        Math.floor(
            TOWER_GAME.spellsById[1].costMin + TOWER_GAME.spellsById[1].costPercent * TOWER_GAME.magicM
        )
    ) {
        return;
    }

    if (
        !Game.hasBuff("Dragonflight") &&
        (nextSpellName(0) == "Blab" ||
            nextSpellName(0) == "Cookie Storm (Drop)")
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[4]);
        logEvent(
            "AutoSpell",
            "Cast Haggler's Charm instead of Force the Hand of Fate"
        );
        return;
    }

    if (cpsBonus() < FrozenCookies.minCpSMult) {
        return;
    }
    if (!Game.hasBuff("Dragonflight") && nextSpellName(0) == "Lucky") {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
        logEvent("AutoSpell", "Cast Force the Hand of Fate");
    }

    if (
        nextSpellName(0) == "Cookie Chain" ||
        nextSpellName(0) == "Cookie Storm" ||
        nextSpellName(0) == "Frenzy" ||
        nextSpellName(0) == "Building Special"
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
        logEvent("AutoSpell", "Cast Force the Hand of Fate");
        return;
    }

    if (
        nextSpellName(0) == "Click Frenzy" &&
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
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
        logEvent("AutoSpell", "Cast Force the Hand of Fate");
        return;
    }

    if (nextSpellName(0) == "Elder Frenzy") {
        if (Game.Upgrades["Elder Pact"].bought == 1) {
            if (
                (Game.hasBuff("Click frenzy") || Game.hasBuff("Dragonflight")) &&
                (remainsClickFrenzy(6) || remainsDragonflight(6))
            ) {
                TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                logEvent("AutoSpell", "Cast Force the Hand of Fate");
            }
            return;
        }
        if (Game.Upgrades["Elder Pact"].bought == 0) {
            if (
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
                (remainsClickFrenzy(6) || remainsDragonflight(6))
            ) {
                TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                logEvent("AutoSpell", "Cast Force the Hand of Fate");
            }
        }
        return;
    }

    if (
        nextSpellName(0) == "Cursed Finger" &&
        (Game.hasBuff("Click frenzy") || Game.hasBuff("Dragonflight")) &&
        (remainsClickFrenzy(10) || remainsDragonflight(6))
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
        logEvent("AutoSpell", "Cast Force the Hand of Fate");
        return;
    }
}

function autoCastSpontaneousEdifice() {
    // If you don't have any Cortex baker yet, or can't cast SE, just give up.
    if (
        Game.Objects["Cortex baker"].amount == 0 ||
        TOWER_GAME.magicM <
            Math.floor(
                TOWER_GAME.spellsById[3].costMin +
                    TOWER_GAME.spellsById[3].costPercent * TOWER_GAME.magicM
            )
    ) {
        return;
    }

    // If we have over 400 Cortex bakers, always going to sell down to 399.
    // If you don't have half a Cortex baker's worth of cookies in bank, sell one or more until you do
    while (
        Game.Objects["Cortex baker"].amount >= 400 ||
        Game.cookies < Game.Objects["Cortex baker"].price / 2
    ) {
        Game.Objects["Cortex baker"].sell(1);
        logEvent(
            "Store",
            "Sold 1 Cortex baker for " +
                (Beautify(
                    Game.Objects["Cortex baker"].price *
                        Game.Objects["Cortex baker"].getSellMultiplier()
                ) +
                    " cookies")
        );
    }
    TOWER_GAME.castSpell(TOWER_GAME.spellsById[3]);
    logEvent("AutoSpell", "Cast Spontaneous Edifice");
}

function autoCastHagglersCharm() {
    if (
        TOWER_GAME.magicM <
        Math.floor(
            TOWER_GAME.spellsById[4].costMin + TOWER_GAME.spellsById[4].costPercent * TOWER_GAME.magicM
        )
    ) {
        return;
    }
    TOWER_GAME.castSpell(TOWER_GAME.spellsById[4]);
    logEvent("AutoSpell", "Cast Haggler's Charm");
}

function autoCastForceHandFateClickSpecialsOnly() {
    if (
        TOWER_GAME.magicM <
        Math.floor(
            TOWER_GAME.spellsById[1].costMin + TOWER_GAME.spellsById[1].costPercent * TOWER_GAME.magicM
        )
    ) {
        return;
    }

    if (
        !Game.hasBuff("Dragonflight") &&
        [
            "Blab",
            "Cookie Storm (Drop)",
            "Cookie Chain",
            "Cookie Storm",
            "Frenzy",
            "Lucky",
        ].includes(nextSpellName(0))
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[4]);
        logEvent(
            "AutoSpell",
            "Cast Haggler's Charm instead of Force the Hand of Fate"
        );
    }

    if (cpsBonus() < FrozenCookies.minCpSMult) {
        return;
    }

    if (nextSpellName(0) == "Building Special") {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
        logEvent("AutoSpell", "Cast Force the Hand of Fate");
        return;
    }

    if (
        nextSpellName(0) == "Click Frenzy" &&
        (
            (
                (
                    Game.hasAura("Reaper of Fields") || Game.hasAura("Reality Bending")
                ) &&
                Game.hasBuff("Dragon Harvest") &&
                Game.hasBuff("Frenzy") &&
                remainsDragonHarvest(13) &&
                remainsFrenzy(13)
            ) ||
            (
                !Game.hasAura("Reaper of Fields") &&
                (
                    Game.hasBuff("Dragon Harvest") || Game.hasBuff("Frenzy")
                ) &&
                (
                    remainsDragonHarvest(13) ||
                    remainsFrenzy(13)
                )
            )
        ) &&
        BuildingSpecialBuff() == 1 &&
        BuildingBuffTime() >= Math.ceil(13 * BuffTimeFactor())
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
        logEvent("AutoSpell", "Cast Force the Hand of Fate");
        return;
    }

    if (nextSpellName(0) == "Elder Frenzy") {
        if (Game.Upgrades["Elder Pact"].bought == 1) {
            if (
                (Game.hasBuff("Click frenzy") ||
                    Game.hasBuff("Dragonflight")) &&
                (remainsClickFrenzy(6) ||
                    remainsDragonflight(6))
            ) {
                TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                logEvent("AutoSpell", "Cast Force the Hand of Fate");
            }
            return;
        }
        if (Game.Upgrades["Elder Pact"].bought == 0) {
            if (
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
                (remainsClickFrenzy(6) || remainsDragonflight(6))
            ) {
                TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                logEvent("AutoSpell", "Cast Force the Hand of Fate");
            }
        }
        return;
    }

    if (
        nextSpellName(0) == "Cursed Finger" &&
        (Game.hasBuff("Click frenzy") || Game.hasBuff("Dragonflight")) &&
        (remainsClickFrenzy(10) || remainsDragonflight(6))
    ) {
        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
        logEvent("AutoSpell", "Cast Force the Hand of Fate");
        return;
    }
}
