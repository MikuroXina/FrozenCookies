export function start() {
    if (FrozenCookies.autoSweet) {
        FrozenCookies.autoSweetBot = setInterval(
            autoSweetAction,
            FrozenCookies.frequency * 2
        );
    }
}

export function stop() {}

function autoSweetAction() {
    if (!FrozenCookies.autoSweet) {
        return;
    }

    if (FrozenCookies.autoBuy == 1) {
        autoSweetAction.autobuyyes = 1;
        FrozenCookies.autoBuy = 0;
    } else {
        autoSweetAction.autobuyyes = 0;
    }

    if (typeof Game.ready !== "undefined" && Game.ready) {
        if (typeof autoSweetAction.state == "undefined") {
            autoSweetAction.state = 0;
        }

        if (!autoSweetAction.state) {
            if (
                // Check first 10 spells
                nextSpellName(0) == "Sugar Lump" ||
                nextSpellName(1) == "Sugar Lump" ||
                nextSpellName(2) == "Sugar Lump" ||
                nextSpellName(3) == "Sugar Lump" ||
                nextSpellName(4) == "Sugar Lump" ||
                nextSpellName(5) == "Sugar Lump" ||
                nextSpellName(6) == "Sugar Lump" ||
                nextSpellName(7) == "Sugar Lump" ||
                nextSpellName(8) == "Sugar Lump" ||
                nextSpellName(9) == "Sugar Lump"
            ) {
                autoSweetAction.state = 1;
            }
        }

        if (!autoSweetAction.state && !Game.OnAscend && !Game.AscendTimer) {
            logEvent("autoSweet", 'No "Sweet" detected, ascending');
            Game.ClosePrompt();
            Game.Ascend(1);
            setTimeout(function () {
                Game.ClosePrompt();
                Game.Reincarnate(1);
            }, 10000);
        }

        switch (autoSweetAction.state) {
            case 0:
                return;
            case 1:
                if (FrozenCookies.towerLimit) {
                    autoSweetAction.manaPrev = FrozenCookies.manaMax;
                    FrozenCookies.manaMax = 37;
                }
                if (
                    (FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM) ||
                    (!FrozenCookies.towerLimit && TOWER_GAME.magic >= TOWER_GAME.magicM - 1)
                ) {
                    if (nextSpellName(0) != "Sugar Lump") {
                        TOWER_GAME.castSpell(TOWER_GAME.spellsById[4]);
                        logEvent(
                            "autoSweet",
                            "Cast Haggler's Charm while waiting for 'Sweet'"
                        );
                    }
                    if (nextSpellName(0) == "Sugar Lump") {
                        TOWER_GAME.castSpell(TOWER_GAME.spellsById[1]);
                        autoSweetAction.state = 0;
                        logEvent("autoSweet", "Sugar Lump Get! Disabling Auto Sweet");
                        if (autoSweetAction.manaPrev != -1) {
                            FrozenCookies.manaMax = autoSweetAction.manaPrev;
                        }
                        if (autoSweetAction.autobuyyes == 1) {
                            FrozenCookies.autoBuy = 1;
                            autoSweetAction.autobuyyes = 0;
                        }
                        FrozenCookies.autoSweet = 0;
                    }
                }
                return;
        }
        return;
    }
}
