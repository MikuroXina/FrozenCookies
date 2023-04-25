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
            if (getNumber("mineLimit")) {
                const mineMax = getNumber("mineMax");
                safeBuy(Game.Objects["Mine"], mineMax);
                modify("autobuyCount", (count) => count + 1);
                logEvent("AutoGodzamok", "Bought " + mineMax + " mines");
            } else {
                safeBuy(Game.Objects["Mine"], countMine);
                modify("autobuyCount", (count) => count + 1);
                logEvent("AutoGodzamok", "Bought " + countMine + " mines");
            }
            // Rebuy factories
            if (getNumber("factoryLimit")) {
                const factoryMax = getNumber("factoryMax");
                safeBuy(Game.Objects["Factory"], factoryMax);
                modify("autobuyCount", (count) => count + 1);
                logEvent(
                    "AutoGodzamok",
                    "Bought " + factoryMax + " factories",
                );
            } else {
                safeBuy(Game.Objects["Factory"], countFactory);
                modify("autobuyCount", (count) => count + 1);
                logEvent("AutoGodzamok", "Bought " + countFactory + " factories");
            }
        }
    }
}
