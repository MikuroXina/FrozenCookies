import { cpsBonus } from "../fc_time.js";

export function start() {
    if (FrozenCookies.autoSugarFrenzy) {
        FrozenCookies.autoSugarFrenzyBot = setInterval(
            autoSugarFrenzyAction,
            FrozenCookies.frequency * 2
        );
    }
}

export function stop() {
    if (FrozenCookies.autoSugarFrenzyBot) {
        clearInterval(FrozenCookies.autoSugarFrenzyBot);
        FrozenCookies.autoSugarFrenzyBot = 0;
    }
}

function autoSugarFrenzyAction() {
    if (
        FrozenCookies.autoSugarFrenzy == 1 &&
        ((!FrozenCookies.sugarBakingGuard && Game.lumps > 0) || Game.lumps > 100) &&
        cpsBonus() >= FrozenCookies.minASFMult &&
        Game.UpgradesById["450"].unlocked == 1 && // Check to see if Sugar craving prestige upgrade has been purchased
        Game.UpgradesById["452"].bought == 0 && // Check to see if sugar frenzy has already been bought this ascension
        auto100ConsistencyComboAction.state == 2 &&
        ((!Game.hasBuff("Loan 1 (interest)") &&
            !Game.hasBuff("Loan 2 (interest)") &&
            !Game.hasBuff("Loan 3 (interest)")) ||
            !FrozenCookies.minLoanMult)
    ) {
        Game.UpgradesById["452"].buy();
        Game.ConfirmPrompt();
        logEvent("autoSugarFrenzy", "Started a Sugar Frenzy this ascension");
    }

    if (
        FrozenCookies.autoSugarFrenzy == 2 &&
        ((!FrozenCookies.sugarBakingGuard && Game.lumps > 0) || Game.lumps > 100) &&
        cpsBonus() >= FrozenCookies.minASFMult &&
        Game.UpgradesById["450"].unlocked == 1 && // Check to see if Sugar craving prestige upgrade has been purchased
        Game.UpgradesById["452"].bought == 0 && // Check to see if sugar frenzy has already been bought this ascension
        (autoFTHOFComboAction.state == 3 || auto100ConsistencyComboAction.state == 2) &&
        ((!Game.hasBuff("Loan 1 (interest)") &&
            !Game.hasBuff("Loan 2 (interest)") &&
            !Game.hasBuff("Loan 3 (interest)")) ||
            !FrozenCookies.minLoanMult)
    ) {
        Game.UpgradesById["452"].buy();
        Game.ConfirmPrompt();
        logEvent("autoSugarFrenzy", "Started a Sugar Frenzy this ascension");
    }
}
