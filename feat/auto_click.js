import { getNumber } from "../fc_store.js";
import { hasClickBuff } from "../fc_time.js";

export function start() {
    const cookieClickSpeed = getNumber("cookieClickSpeed");
    if (!!getNumber("autoClick") && cookieClickSpeed) {
        FrozenCookies.autoclickBot = setInterval(
            fcClickCookie,
            1000 / cookieClickSpeed
        );
    }
    if (FrozenCookies.autoFrenzy && FrozenCookies.frenzyClickSpeed) {
        FrozenCookies.frenzyClickBot = setInterval(
            autoFrenzyClick,
            getNumber("frequency"),
        );
    }
}

export function stop() {
    if (FrozenCookies.autoclickBot) {
        clearInterval(FrozenCookies.autoclickBot);
        FrozenCookies.autoclickBot = 0;
    }
}

function fcClickCookie() {
    if (!Game.OnAscend && !Game.AscendTimer && !Game.specialTabHovered) {
        Game.ClickCookie();
    }
}

function autoFrenzyClick() {
    if (hasClickBuff() && !FrozenCookies.autoFrenzyBot) {
        if (FrozenCookies.autoclickBot) {
            clearInterval(FrozenCookies.autoclickBot);
            FrozenCookies.autoclickBot = 0;
        }
        FrozenCookies.autoFrenzyBot = setInterval(
            fcClickCookie,
            1000 / FrozenCookies.frenzyClickSpeed
        );
    } else if (!hasClickBuff() && FrozenCookies.autoFrenzyBot) {
        clearInterval(FrozenCookies.autoFrenzyBot);
        FrozenCookies.autoFrenzyBot = 0;
        const cookieClickSpeed = getNumber("cookieClickSpeed")
        if (!!getNumber("autoClick") && cookieClickSpeed) {
            FrozenCookies.autoclickBot = setInterval(
                fcClickCookie,
                1000 / cookieClickSpeed
            );
        }
    }
}

