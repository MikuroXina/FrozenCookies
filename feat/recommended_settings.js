import { getNumber, set } from "../fc_store.js";

export function start() {
    if (FrozenCookies.recommendedSettings) {
        FrozenCookies.recommendedSettingsBot = setInterval(
            recommendedSettingsAction,
            getNumber("frequency"),
        );
    }
}

export function stop() {
    if (FrozenCookies.recommendedSettingsBot) {
        clearInterval(FrozenCookies.recommendedSettingsBot);
        FrozenCookies.recommendedSettingsBot = 0;
    }
}

function recommendedSettingsAction() {
    if (FrozenCookies.recommendedSettings == 1) {
        // clicking options
        set("autoClick", 1);
        set("cookieClickSpeed", 250);
        set("autoFrenzy", 1);
        set("frenzyClickSpeed", 1000);
        set("autoGC", 1);
        set("autoReindeer", 1);
        set("autoFortune", 1);
        // autobuy options
        set("autoBuy", 1);
        set("otherUpgrades", 1);
        set("autoBlacklistOff", 0);
        set("blacklist", 0);
        set("mineLimit", 1);
        set("mineMax", 500);
        set("factoryLimit", 1);
        set("factoryMax", 500);
        set("pastemode", 0);
        // other auto options
        set("autoAscend", 0);
        set("HCAscendAmount", 0);
        set("autoBulk", 2);
        set("autoBuyAll", 1);
        set("autoWrinkler", 1);
        set("shinyPop", 0);
        set("autoSL", 2);
        set("dragonsCurve", 2);
        FrozenCookies.sugarBakingGuard = 1;
        FrozenCookies.autoGS = 1;
        FrozenCookies.autoGodzamok = 1;
        FrozenCookies.autoBank = 1;
        FrozenCookies.autoBroker = 1;
        FrozenCookies.autoLoan = 1;
        set("minLoanMult", 777);
        // Pantheon options
        FrozenCookies.autoWorshipToggle = 1;
        FrozenCookies.autoWorship0 = 2; // Godzamok
        FrozenCookies.autoWorship1 = 8; // Mokalsium
        FrozenCookies.autoWorship2 = 6; // Muridal
        FrozenCookies.autoCyclius = 0;
        // Spell options
        FrozenCookies.towerLimit = 1;
        set("manaMax", 37);
        set("autoSpell", 2);
        set("minCpSMult", 7);
        FrozenCookies.autoFTHOFCombo = 0;
        FrozenCookies.auto100ConsistencyCombo = 0;
        FrozenCookies.autoSugarFrenzy = 0;
        set("minASFMult", 7777);
        FrozenCookies.autoSweet = 0;
        // Dragon options
        FrozenCookies.autoDragon = 1;
        FrozenCookies.petDragon = 1;
        FrozenCookies.autoDragonToggle = 1;
        FrozenCookies.autoDragonAura0 = 3; // Elder Batallion
        FrozenCookies.autoDragonAura1 = 15; // Radiant Appetite
        FrozenCookies.autoDragonOrbs = 0;
        FrozenCookies.cortexLimit = 0;
        set("cortexMax", 200);
        // Season options
        FrozenCookies.defaultSeason = 1;
        FrozenCookies.freeSeason = 1;
        FrozenCookies.autoEaster = 1;
        FrozenCookies.autoHalloween = 1;
        // Bank options
        set("holdSEBank", 0);
        set("setHarvestBankPlant", 0);
        set("setHarvestBankType", 3);
        set("maxSpecials", 1);
        // Other options
        set("FCshortcuts", 1);
        FrozenCookies.simulatedGCPercent = 1;
        // Display options
        set("showMissedCookies", 0);
        set("numberDisplay", 1);
        set("fancyui", 1);
        FrozenCookies.logging = 1;
        FrozenCookies.purchaseLog = 0;
        FrozenCookies.fpsModifier = 2;
        setNumber("trackStats", 0);
        logEvent("recommendedSettings", "Set all options to recommended values");
        FrozenCookies.recommendedSettings = 0;
        Game.toSave = true;
        Game.toReload = true;
    }
}
