import { liveWrinklers } from "../fc_time.js";

export function start() {
    if (FrozenCookies.autoHalloween) {
        FrozenCookies.autoHalloweenBot = setInterval(
            autoHalloweenAction,
            FrozenCookies.frequency
        );
    }
}

export function stop() {
    if (FrozenCookies.autoHalloweenBot) {
        clearInterval(FrozenCookies.autoHalloweenBot);
        FrozenCookies.autoHalloweenBot = 0;
    }
}

function autoHalloweenAction() {
    if (
        !FrozenCookies.autoHalloween ||
        Game.season == "valentines" ||
        Game.season == "easter" ||
        Game.season == "halloween" ||
        haveAll("halloween")
    ) {
        return;
    }

    const living = liveWrinklers();
    if (
        living.length > 0 &&
        Game.season != "easter" &&
        Game.season != "halloween" &&
        !haveAll("halloween")
    ) {
        Game.UpgradesById[183].buy();
        logEvent("autoHalloween", "Swapping to Halloween season to use wrinklers");
    }
}
