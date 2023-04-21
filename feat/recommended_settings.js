import { set } from "../fc_store";

export function start() {
    if (FrozenCookies.recommendedSettings) {
        FrozenCookies.recommendedSettingsBot = setInterval(
            recommendedSettingsAction,
            FrozenCookies.frequency
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
        FrozenCookies.autoClick = 1;
        set("cookieClickSpeed", 250);
        FrozenCookies.autoFrenzy = 1;
        FrozenCookies.frenzyClickSpeed = 1000;
        FrozenCookies.autoGC = 1;
        FrozenCookies.autoReindeer = 1;
        FrozenCookies.autoFortune = 1;
        // autobuy options
        FrozenCookies.autoBuy = 1;
        FrozenCookies.otherUpgrades = 1;
        FrozenCookies.autoBlacklistOff = 0;
        FrozenCookies.blacklist = 0;
        FrozenCookies.mineLimit = 1;
        FrozenCookies.mineMax = 500;
        FrozenCookies.factoryLimit = 1;
        FrozenCookies.factoryMax = 500;
        FrozenCookies.pastemode = 0;
        // other auto options
        FrozenCookies.autoAscend = 0;
        FrozenCookies.HCAscendAmount = 0;
        FrozenCookies.autoBulk = 2;
        FrozenCookies.autoBuyAll = 1;
        FrozenCookies.autoWrinkler = 1;
        FrozenCookies.shinyPop = 0;
        FrozenCookies.autoSL = 2;
        FrozenCookies.dragonsCurve = 2;
        FrozenCookies.sugarBakingGuard = 1;
        FrozenCookies.autoGS = 1;
        FrozenCookies.autoGodzamok = 1;
        FrozenCookies.autoBank = 1;
        FrozenCookies.autoBroker = 1;
        FrozenCookies.autoLoan = 1;
        FrozenCookies.minLoanMult = 777;
        // Pantheon options
        FrozenCookies.autoWorshipToggle = 1;
        FrozenCookies.autoWorship0 = 2; // Godzamok
        FrozenCookies.autoWorship1 = 8; // Mokalsium
        FrozenCookies.autoWorship2 = 6; // Muridal
        FrozenCookies.autoCyclius = 0;
        // Spell options
        FrozenCookies.towerLimit = 1;
        FrozenCookies.manaMax = 37;
        FrozenCookies.autoSpell = 2;
        FrozenCookies.minCpSMult = 7;
        FrozenCookies.autoFTHOFCombo = 0;
        FrozenCookies.auto100ConsistencyCombo = 0;
        FrozenCookies.autoSugarFrenzy = 0;
        FrozenCookies.minASFMult = 7777;
        FrozenCookies.autoSweet = 0;
        // Dragon options
        FrozenCookies.autoDragon = 1;
        FrozenCookies.petDragon = 1;
        FrozenCookies.autoDragonToggle = 1;
        FrozenCookies.autoDragonAura0 = 3; // Elder Batallion
        FrozenCookies.autoDragonAura1 = 15; // Radiant Appetite
        FrozenCookies.autoDragonOrbs = 0;
        FrozenCookies.cortexLimit = 0;
        FrozenCookies.cortexMax = 200;
        // Season options
        FrozenCookies.defaultSeason = 1;
        FrozenCookies.freeSeason = 1;
        FrozenCookies.autoEaster = 1;
        FrozenCookies.autoHalloween = 1;
        // Bank options
        FrozenCookies.holdSEBank = 0;
        set("setHarvestBankPlant", 0);
        set("setHarvestBankType", 3);
        FrozenCookies.maxSpecials = 1;
        // Other options
        FrozenCookies.FCshortcuts = 1;
        FrozenCookies.simulatedGCPercent = 1;
        // Display options
        FrozenCookies.showMissedCookies = 0;
        set("numberDisplay", 1);
        FrozenCookies.fancyui = 1;
        FrozenCookies.logging = 1;
        FrozenCookies.purchaseLog = 0;
        FrozenCookies.fpsModifier = 2;
        FrozenCookies.trackStats = 0;
        logEvent("recommendedSettings", "Set all options to recommended values");
        FrozenCookies.recommendedSettings = 0;
        Game.toSave = true;
        Game.toReload = true;
    }
}
