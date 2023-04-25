import { pushStats, viewStatGraphs } from "../fc_preferences.js";
import { getNumber, set } from "../fc_store.js";

/**
 * 10s minimum reporting between purchases with "smart tracking" on
 */
const MIN_DELAY = 1000 * 10;

let smartTrackingBot = 0;

export function start() {
    const trackStats = getNumber("trackStats");
    if (statSpeed(trackStats) > 0) {
        FrozenCookies.statBot = setInterval(
            saveStats,
            statSpeed(trackStats)
        );
    } else if (trackStats == 6 && !smartTrackingBot) {
        smartTrackingBot = setTimeout(() => {
            smartTrackingStats(MIN_DELAY * 8);
        }, MIN_DELAY);
    }
}

function statSpeed() {
    switch (getNumber("trackStats")) {
        case 1: // 60s
            return 1000 * 60;
        case 2: // 30m
            return 1000 * 60 * 30;
        case 3: // 1h
            return 1000 * 60 * 60;
        case 4: // 24h
            return 1000 * 60 * 60 * 24;
    }
    return 0;
}

export function stop() {
    if (FrozenCookies.statBot) {
        clearInterval(FrozenCookies.statBot);
        FrozenCookies.statBot = 0;
    }
}

function saveStats(fromGraph) {
    pushStats({
        time: Date.now() - Game.startDate,
        baseCps: baseCps(),
        effectiveCps: effectiveCps(),
        hc: Game.HowMuchPrestige(
            Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
        ),
        actualClicks: Game.cookieClicks,
    });
    if (
        $("#statGraphContainer").length > 0 &&
        !$("#statGraphContainer").is(":hidden") &&
        !fromGraph
    ) {
        viewStatGraphs();
    }
}

function smartTrackingStats(delay) {
    saveStats();
    if (getNumber("trackStats") == 6) {
        if (getNumber("delayPurchaseCount") == 0) {
            delay *= 1.5;
        } else if (delay > MIN_DELAY) {
            delay /= 2;
        }
        smartTrackingBot = setTimeout(() => {
            smartTrackingStats(delay);
        }, delay);
        set("delayPurchaseCount", 0);
        return;
    }
    smartTrackingBot = 0;
}
