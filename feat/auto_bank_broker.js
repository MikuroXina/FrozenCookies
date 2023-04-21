import { Beautify } from "../fc_beautify.js";
import { nextPurchase } from "../fc_next_purchase.js";

export function start() {
    if (FrozenCookies.autoBroker) {
        FrozenCookies.autoBrokerBot = setInterval(
            autoBrokerAction,
            FrozenCookies.frequency
        );
    }
}

export function stop() {
    if (FrozenCookies.autoBrokerBot) {
        clearInterval(FrozenCookies.autoBrokerBot);
        FrozenCookies.autoBrokerBot = 0;
    }
}

function autoBrokerAction() {
    if (!BANK_GAME) {
        // Just leave if you don't have the stock market
        return;
     }

    // Hire brokers
    const delay = delayAmount(); // GC or harvest bank
    const recommendation = nextPurchase();
    if (
        recommendation.type == "building" && // Don't hire when saving for upgrade
        BANK_GAME.brokers < BANK_GAME.getMaxBrokers() &&
        Game.cookies >= delay + BANK_GAME.getBrokerPrice()
    ) {
        l("bankBrokersBuy").click();
        logEvent(
            "AutoBroker",
            "Hired a broker for " + Beautify(BANK_GAME.getBrokerPrice()) + " cookies"
        );
        Game.recalculateGains = 1;
        Game.upgradesToRebuild = 1;
    }
}
