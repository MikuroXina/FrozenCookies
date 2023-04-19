import { hasClickBuff } from "../fc_time.js";

export function start() {
    if (FrozenCookies.autoGS) {
        FrozenCookies.autoGSBot = setInterval(autoGSBuy, FrozenCookies.frequency);
    }
}

export function stop() {
    if (FrozenCookies.autoGSBot) {
        clearInterval(FrozenCookies.autoGSBot);
        FrozenCookies.autoGSBot = 0;
    }
}

function autoGSBuy() {
    if (hasClickBuff()) {
        if (
            Game.Upgrades["Golden switch [off]"].unlocked &&
            !Game.Upgrades["Golden switch [off]"].bought
        ) {
            Game.Upgrades["Golden switch [off]"].buy();
        }
    } else if (!hasClickBuff()) {
        if (
            Game.Upgrades["Golden switch [on]"].unlocked &&
            !Game.Upgrades["Golden switch [on]"].bought
        ) {
            Game.CalculateGains(); // Ensure price is updated since Frenzy ended
            Game.Upgrades["Golden switch [on]"].buy();
        }
    }
}
