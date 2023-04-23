import { getNumber } from "../fc_store.js";
import { hasClickBuff } from "../fc_time.js";

let autoClickBot = 0;
let frenzyClickBot = 0;
let autoFrenzyBot = 0;

export function start() {
    const cookieClickSpeed = getNumber("cookieClickSpeed");
    if (!!getNumber("autoClick") && cookieClickSpeed) {
        autoClickBot = setInterval(
            fcClickCookie,
            1000 / cookieClickSpeed,
        );
    }
    if (getNumber("autoFrenzy") && getNumber("frenzyClickSpeed")) {
        FrozenCookies.frenzyClickBot = setInterval(
            autoFrenzyClick,
            getNumber("frequency"),
        );
    }
}

export function stop() {
    if (autoClickBot) {
        clearInterval(autoClickBot);
        autoClickBot = 0;
    }
    if (frenzyClickBot) {
        clearInterval(frenzyClickBot);
        frenzyClickBot = 0;
    }
    if (autoFrenzyBot) {
        clearInterval(autoFrenzyBot);
        autoFrenzyBot = 0;
    }
}

function fcClickCookie() {
    if (!Game.OnAscend && !Game.AscendTimer && !Game.specialTabHovered) {
        Game.ClickCookie();
    }
}

function autoFrenzyClick() {
    if (hasClickBuff() && !autoFrenzyBot) {
        if (autoClickBot) {
            clearInterval(autoClickBot);
            autoClickBot = 0;
        }
        autoFrenzyBot = setInterval(
            fcClickCookie,
            1000 / getNumber("frenzyClickSpeed"),
        );
    } else if (!hasClickBuff() && autoFrenzyBot) {
        clearInterval(autoFrenzyBot);
        autoFrenzyBot = 0;
        const cookieClickSpeed = getNumber("cookieClickSpeed");
        if (!!getNumber("autoClick") && cookieClickSpeed) {
            autoClickBot = setInterval(
                fcClickCookie,
                1000 / cookieClickSpeed
            );
        }
    }
}

