import { hasClickBuff } from "../fc_time.js";
import { safeBuy } from "../fc_pay.js";
import { getNumber } from "../fc_store.js";

export function start() {
    if (FrozenCookies.autoGodzamok) {
        FrozenCookies.autoGodzamokBot = setInterval(
            autoGodzamokAction,
            getNumber("frequency"),
        );
    }
}

export function stop() {
    if (FrozenCookies.autoGodzamokBot) {
        clearInterval(FrozenCookies.autoGodzamokBot);
        FrozenCookies.autoGodzamokBot = 0;
    }
}

function autoGodzamokAction() {
    if (!TEMPLE_GAME) {
        return;
    }

    // if Godz is here and autoGodzamok is set
    if (Game.hasGod("ruin") && FrozenCookies.autoGodzamok) {
        // Need at least 10 of each to be useful
        // if (Game.Objects["Mine"].amount < 10 || Game.Objects["Factory"].amount < 10) return;
        const countMine = Game.Objects["Mine"].amount;
        const countFactory = Game.Objects["Factory"].amount;

        // Automatically sell all mines and factories
        if (!Game.hasBuff("Devastation") && hasClickBuff()) {
            Game.Objects["Mine"].sell(countMine);
            Game.Objects["Factory"].sell(countFactory);
            // Rebuy mines
            if (FrozenCookies.mineLimit) {
                safeBuy(Game.Objects["Mine"], FrozenCookies.mineMax);
                FrozenCookies.autobuyCount += 1;
                logEvent("AutoGodzamok", "Bought " + FrozenCookies.mineMax + " mines");
            } else {
                safeBuy(Game.Objects["Mine"], countMine);
                FrozenCookies.autobuyCount += 1;
                logEvent("AutoGodzamok", "Bought " + countMine + " mines");
            }
            // Rebuy factories
            if (FrozenCookies.factoryLimit) {
                safeBuy(Game.Objects["Factory"], FrozenCookies.factoryMax);
                FrozenCookies.autobuyCount += 1;
                logEvent(
                    "AutoGodzamok",
                    "Bought " + FrozenCookies.factoryMax + " factories"
                );
            } else {
                safeBuy(Game.Objects["Factory"], countFactory);
                FrozenCookies.autobuyCount += 1;
                logEvent("AutoGodzamok", "Bought " + countFactory + " factories");
            }
        }
    }
}
