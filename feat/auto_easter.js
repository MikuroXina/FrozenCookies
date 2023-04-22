import { getNumber } from "../fc_store.js";

export function start() {
    if (FrozenCookies.autoEaster) {
        FrozenCookies.autoEasterBot = setInterval(
            autoEasterAction,
            getNumber("frequency"),
        );
    }
}

export function stop() {
    if (FrozenCookies.autoEasterBot) {
        clearInterval(FrozenCookies.autoEasterBot);
        FrozenCookies.autoEasterBot = 0;
    }
}

function autoEasterAction() {
    if (!FrozenCookies.autoEaster || Game.season == "easter" || haveAll("easter")) {
        return;
    }

    if (Game.hasBuff("Cookie storm") && Game.season != "easter" && !haveAll("easter")) {
        Game.UpgradesById[209].buy();
    }
}
