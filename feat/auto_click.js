import { getNumber } from "../fc_store";

export function start() {
    const cookieClickSpeed = getNumber("cookieClickSpeed");
    if (FrozenCookies.autoClick && cookieClickSpeed) {
        FrozenCookies.autoclickBot = setInterval(
            fcClickCookie,
            1000 / cookieClickSpeed
        );
    }
}

export function stop() {
    if (FrozenCookies.autoclickBot) {
        clearInterval(FrozenCookies.autoclickBot);
        FrozenCookies.autoclickBot = 0;
    }
}

export function fcClickCookie() {
    if (!Game.OnAscend && !Game.AscendTimer && !Game.specialTabHovered) {
        Game.ClickCookie();
    }
}
