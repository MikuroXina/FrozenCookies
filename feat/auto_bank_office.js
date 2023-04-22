import { hasClickBuff } from "../fc_time.js";
import { safeBuy } from "../fc_pay.js";
import { getNumber } from "../fc_store.js";

export function start() {
    if (FrozenCookies.autoBank) {
        FrozenCookies.autoBankBot = setInterval(autoBankAction, getNumber("frequency"));
    }
}

export function stop() {
    if (FrozenCookies.autoBankBot) {
        clearInterval(FrozenCookies.autoBankBot);
        FrozenCookies.autoBankBot = 0;
    }
}

function autoBankAction() {
    if (!BANK_GAME || hasClickBuff()) {
        return;
    }

    // Upgrade bank level
    const currentOffice = BANK_GAME.offices[BANK_GAME.officeLevel];
    if (
        currentOffice.cost &&
        Game.Objects["Cursor"].amount >= currentOffice.cost[0] &&
        Game.Objects["Cursor"].level >= currentOffice.cost[1]
    ) {
        const countBankCursor = currentOffice.cost[0];
        l("bankOfficeUpgrade").click();
        safeBuy(Game.Objects["Cursor"], countBankCursor);
        modify("autobuyCount", (count) => count + 1);
        logEvent("AutoBank", "Upgrade bank level for " + countBankCursor + " cursors");
        Game.recalculateGains = 1;
        Game.upgradesToRebuild = 1;
    }
}
