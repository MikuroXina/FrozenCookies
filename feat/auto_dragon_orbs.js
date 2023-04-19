import { goldenCookieLife } from "../fc_time.js";

export function start() {
    if (FrozenCookies.autoDragonOrbs) {
        FrozenCookies.autoDragonOrbsBot = setInterval(
            autoDragonOrbsAction,
            FrozenCookies.frequency * 10
        );
    }
}

export function stop() {
    if (FrozenCookies.autoDragonOrbsBot) {
        clearInterval(FrozenCookies.autoDragonOrbsBot);
        FrozenCookies.autoDragonOrbsBot = 0;
    }
}

function autoDragonOrbsAction() {
    if (
        FrozenCookies.autoDragonOrbs == 1 &&
        (!Game.hasAura("Dragon Orbs") ||
            Game.hasGod("ruin") ||
            Game.Objects["Cortex baker"].amount < 1)
    ) {
        FrozenCookies.autoDragonOrbs = 0;
        logEvent("autoDragonOrbs", "Not currently possible to use Dragon Orbs");
    }

    let buffsN = 0;
    for (const _ii in Game.buffs) {
        buffsN++;
        break;
    }
    if (!goldenCookieLife() && Game.hasAura("Dragon Orbs") && !buffsN) {
        Game.Objects["Cortex baker"].sell(1);
        logEvent(
            "autoDragonOrbs",
            "Sold 1 Cortex baker for " +
                (Beautify(
                    Game.Objects["Cortex baker"].price *
                        Game.Objects["Cortex baker"].getSellMultiplier()
                ) +
                    " cookies and a wish")
        );
    }
}
