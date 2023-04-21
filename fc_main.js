import {
    BLACKLIST,
    COOKIE_SPEC,
    UPGRADE_PREREQUISITES,
} from "./cc_upgrade_prerequisites.js";
import { Beautify } from "./fc_beautify.js";
import { FCMenu } from "./fc_button.js";
import { bestBank } from "./fc_best_bank.js";
import { timeDisplay } from "./fc_format.js";
import { updateTimers } from "./fc_infobox.js";
import { getNumber, getString, loadFromStorage, set } from "./fc_store.js";
import { loadFromJson, saveAsJson } from "./fc_frenzy_times.js";
import { nextPurchase, recommendationList } from "./fc_next_purchase.js";

export function registerMod(mod_id = "frozen_cookies", Game) {
    // register with the modding API
    Game.registerMod(mod_id, {
        init: function () {
            Game.registerHook("reincarnate", function () {
                // called when the player has reincarnated after an ascension
                switch (getNumber("autoBulk")) {
                    case 1:
                        document.getElementById("storeBulk10").click();
                        break;
                    case 2:
                        document.getElementById("storeBulk100").click();
                        break;
                }
            });
            Game.registerHook("draw", updateTimers); // called every draw tick
            Game.registerHook("ticker", function () {
                // called when determining news ticker text (about every ten seconds); should return an array of possible choices to add
                if (
                    Game.cookiesEarned >= 1000 &&
                    Math.random() < 0.3 &&
                    Game.season != "fools"
                ) {
                    return [
                        "News : debate about whether using Frozen Cookies constitutes cheating continues to rage. Violence escalating.",
                        "News : Supreme Court rules Frozen Cookies not unauthorized cheating after all.",
                        "News : Frozen Cookies considered 'cool'. Pun-haters heard groaning.",
                    ];
                }
                if (
                    bestBank(nextChainedPurchase().efficiency).cost > 0 &&
                    Math.random() < 0.3 &&
                    Game.season != "fools"
                ) {
                    return [
                        "You wonder if those " +
                            Beautify(bestBank(nextChainedPurchase().efficiency).cost) +
                            " banked cookies are still fresh.",
                    ];
                }
                if (
                    nextPurchase().cost > 0 &&
                    Math.random() < 0.3 &&
                    Game.season != "fools"
                ) {
                    return ["You should buy " + nextPurchase().purchase.name + " next."];
                }
                if (Math.random() < 0.3 && Game.season == "fools") {
                    return [
                        "Investigation into potential cheating with Frozen Cookies is blocked by your lawyers.",
                        "Your Frozen Cookies are now available in stores everywhere.",
                        "Movie studio suit against your use of 'Frozen' dismissed with prejudice.",
                    ];
                }
                if (
                    bestBank(nextChainedPurchase().efficiency).cost > 0 &&
                    Math.random() < 0.3 &&
                    Game.season == "fools"
                ) {
                    return [
                        "You have " +
                            Beautify(
                                bestBank(nextChainedPurchase().efficiency).cost * 0.08
                            ) +
                            " cookie dollars just sitting in your wallet.",
                    ];
                }
                if (
                    nextPurchase().cost > 0 &&
                    nextPurchase().type != "building" &&
                    Math.random() < 0.3 &&
                    Game.season == "fools"
                ) {
                    return [
                        "Your next investment: " + nextPurchase().purchase.name + ".",
                    ];
                }
                if (
                    nextPurchase().cost > 0 &&
                    nextPurchase().type == "building" &&
                    Math.random() < 0.3 &&
                    Game.season == "fools"
                ) {
                    return [
                        "Your next investment: " +
                            Game.foolObjects[nextPurchase().purchase.name].name +
                            ".",
                    ];
                }
            });
            Game.registerHook("reset", function (hard) {
                // the parameter will be true if it's a hard reset, and false (not passed) if it's just an ascension
                if (hard) {
                    emptyCaches();
                }
                // if the user is starting fresh, code will likely need to be called to reinitialize some historical data here as well
            });
            /*  other hooks that can be used
                  Game.registerHook('logic', function () {   // called every logic tick. seems to correspond with fps
                  });
                  Game.registerHook('reincarnate', function () {
                  });
                  Game.registerHook('check', function () {   // called every few seconds when we check for upgrade/achieve unlock conditions; you can also use this for other checks that you don't need happening every logic frame. called about every five seconds?
                  });
                  Game.registerHook('cps', function (cps) { // called when determining the CpS; parameter is the current CpS; should return the modified CpS. called on change or about every ten seconds
                      return cps;
                  });
                  Game.registerHook('cookiesPerClick', function (cookiesPerClick) { // called when determining the cookies per click; parameter is the current value; should return the modified value. called on change or about every ten seconds
                      return cookiesPerClick;
                  });
                  Game.registerHook('click', function () {    // called when the big cookie is clicked
                  });
                  Game.registerHook('create', function () {   // called after the game declares all buildings, upgrades and achievs; use this to declare your own - note that saving/loading functionality for custom content is not explicitly implemented and may be unpredictable and broken
                  });
                  */
        },
        save: saveFCData,
        load: () => {
            setOverrides(Game);
        },
        // called whenever a game save is loaded. If the mod has data in the game save when the mod is initially registered, this hook is also called at that time as well.
    });

    // If Frozen Cookies was loaded and there was previous Frozen Cookies data in the game save, the "load" hook ran so the setOverrides function was called and things got initialized.
    // However, if there wasn't previous Frozen Cookies data in the game save, the "load" hook wouldn't have been called. So, we have to manually call setOverrides here to start Frozen Cookies.
    if (!FrozenCookies.loadedData) {
        setOverrides(Game);
    }
    logEvent(
        "Load",
        "Initial Load of Frozen Cookies v " +
            FrozenCookies.branch +
            "." +
            FrozenCookies.version +
            ". (You should only ever see this once.)"
    );
}

const GARDEN_GAME = Game.Objects["Farm"].minigame;
const BANK_GAME = Game.Objects["Bank"].minigame;
const TEMPLE_GAME = Game.Objects["Temple"].minigame;
const TOWER_GAME = Game.Objects["Wizard tower"].minigame;

function setOverrides(Game) {
    // load settings and initialize variables
    // If gameSaveData wasn't passed to this function, it means that there was nothing for this mod in the game save when the mod was loaded
    // In that case, set the "loadedData" var to an empty object. When the loadFCData() function runs and finds no data from the game save,
    // it pulls data from local storage or sets default values

    FrozenCookies.loadedData = {};
    loadFCData();
    FrozenCookies.frequency = 100;
    FrozenCookies.efficiencyWeight = 1.0;

    // Becomes 0 almost immediately after user input, so default to 0
    FrozenCookies.timeTravelAmount = 0;

    // Force redraw every 10 purchases
    FrozenCookies.autobuyCount = 0;

    // Set default values for calculations
    FrozenCookies.hc_gain = 0;
    FrozenCookies.hc_gain_time = Date.now();
    FrozenCookies.last_gc_state =
        (Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1) * clickBuffBonus();
    FrozenCookies.last_gc_time = Date.now();
    FrozenCookies.lastCPS = Game.cookiesPs;
    FrozenCookies.lastBaseCPS = Game.cookiesPs;
    FrozenCookies.lastCookieCPS = 0;
    FrozenCookies.lastUpgradeCount = 0;
    FrozenCookies.currentBank = {
        cost: 0,
        efficiency: 0,
    };
    FrozenCookies.targetBank = {
        cost: 0,
        efficiency: 0,
    };
    FrozenCookies.disabledPopups = true;
    FrozenCookies.lastGraphDraw = 0;
    FrozenCookies.calculatedCpsByType = {};

    // Allow autoCookie to run
    FrozenCookies.processing = false;
    FrozenCookies.priceReductionTest = false;

    FrozenCookies.cookieBot = 0;
    FrozenCookies.autoclickBot = 0;
    FrozenCookies.autoFrenzyBot = 0;
    FrozenCookies.frenzyClickBot = 0;

    // Smart tracking details
    FrozenCookies.smartTrackingBot = 0;
    FrozenCookies.minDelay = 1000 * 10; // 10s minimum reporting between purchases with "smart tracking" on
    FrozenCookies.delayPurchaseCount = 0;

    // Caching
    emptyCaches();

    // Whether to currently display achievement popups
    FrozenCookies.showAchievements = true;

    if (!BLACKLIST[FrozenCookies.blacklist]) {
        FrozenCookies.blacklist = 0;
    }

    // Set `App`, on older version of CC it's not set to anything, so default it to `undefined`
    if (!window.App) {
        window.App = undefined;
    }

    Beautify = fcBeautify;
    Game.sayTime = function (time) {
        return timeDisplay(time / Game.fps);
    };
    if (typeof Game.tooltip.oldDraw != "function") {
        Game.tooltip.oldDraw = Game.tooltip.draw;
        Game.tooltip.draw = fcDraw;
    }
    if (typeof Game.oldReset != "function") {
        Game.oldReset = Game.Reset;
        Game.Reset = fcReset;
    }
    Game.Win = fcWin;
    // Remove the following when turning on tooltip code
    nextPurchase(true);
    Game.RefreshStore();
    Game.RebuildUpgrades();
    beautifyUpgradesAndAchievements();
    // Replace Game.Popup references with event logging
    eval(
        "Game.shimmerTypes.golden.popFunc = " +
            Game.shimmerTypes.golden.popFunc
                .toString()
                .replace(/Game\.Popup\((.+)\)\;/g, 'logEvent("GC", $1, true);')
    );
    eval(
        "Game.UpdateWrinklers = " +
            Game.UpdateWrinklers.toString().replace(
                /Game\.Popup\((.+)\)\;/g,
                'logEvent("Wrinkler", $1, true);'
            )
    );
    eval(
        "FrozenCookies.safeGainsCalc = " +
            Game.CalculateGains.toString()
                .replace(/eggMult\+=\(1.+/, "eggMult++; // CENTURY EGGS SUCK")
                .replace(/Game\.cookiesPs/g, "FrozenCookies.calculatedCps")
                .replace(/Game\.globalCpsMult/g, "mult")
    );

    // Give free achievements!
    if (!Game.HasAchiev("Third-party")) {
        Game.Win("Third-party");
    }
    loadFeatures();
}

function loadFCData() {
    const loadFromLocalStorage = loadFromStorage(localStorage);
    // Set all cycleable preferences
    for (const preference in PREFERENCES) {
        loadFromLocalStorage(preference, PREFERENCES[preference].default);
    }
    // Separate because these are user-input values
    loadFromLocalStorage("cookieClickSpeed", 0);
    loadFromLocalStorage("frenzyClickSpeed", 0);
    loadFromLocalStorage("HCAscendAmount", 0);
    loadFromLocalStorage("minCpSMult", 1);
    loadFromLocalStorage("maxSpecials", 1);
    loadFromLocalStorage("minLoanMult", 1);
    loadFromLocalStorage("minASFMult", 1);

    // building max values
    loadFromLocalStorage("mineMax", 0);
    loadFromLocalStorage("factoryMax", 0);
    loadFromLocalStorage("manaMax", 0);
    loadFromLocalStorage("cortexMax", 0);

    // Get historical data
    loadFromJson(localStorage.getItem("frenzyTimes") || "{}");
    loadFromLocalStorage("lastHCAmount", 0);
    loadFromLocalStorage("lastHCTime", 0);
    loadFromLocalStorage("prevLastHCTime", 0);
    loadFromLocalStorage("maxHCPercent", 0);
    if (Object.keys(FrozenCookies.loadedData).length > 0) {
        logEvent("Load", "Restored Frozen Cookies settings from previous save");
    }
}

function emptyCaches() {
    setNumber("recalculateCaches", 1);
    FrozenCookies.caches = {};
    FrozenCookies.caches.nextPurchase = {};
    FrozenCookies.caches.recommendationList = [];
    FrozenCookies.caches.buildings = [];
    FrozenCookies.caches.upgrades = [];
}

function scientificNotation(value) {
    if (
        value === 0 ||
        !Number.isFinite(value) ||
        (Math.abs(value) >= 1 && Math.abs(value) <= 1000)
    ) {
        return rawFormatter(value);
    }
    value = parseFloat(value);
    value = value.toExponential(2);
    value = value.replace("+", "");
    return value;
}

const NUMBER_FORMATTERS = Object.freeze([
    rawFormatter,
    formatEveryThirdPower([
        "",
        " million",
        " billion",
        " trillion",
        " quadrillion",
        " quintillion",
        " sextillion",
        " septillion",
        " octillion",
        " nonillion",
        " decillion",
        " undecillion",
        " duodecillion",
        " tredecillion",
        " quattuordecillion",
        " quindecillion",
        " sexdecillion",
        " septendecillion",
        " octodecillion",
        " novemdecillion",
        " vigintillion",
        " unvigintillion",
        " duovigintillion",
        " trevigintillion",
        " quattuorvigintillion",
        " quinvigintillion",
        " sexvigintillion",
        " septenvigintillion",
        " octovigintillion",
        " novemvigintillion",
        " trigintillion",
        " untrigintillion",
        " duotrigintillion",
        " tretrigintillion",
        " quattuortrigintillion",
        " quintrigintillion",
        " sextrigintillion",
        " septentrigintillion",
        " octotrigintillion",
        " novemtrigintillion",
    ]),

    formatEveryThirdPower([
        "",
        " M",
        " B",
        " T",
        " Qa",
        " Qi",
        " Sx",
        " Sp",
        " Oc",
        " No",
        " De",
        " UnD",
        " DoD",
        " TrD",
        " QaD",
        " QiD",
        " SxD",
        " SpD",
        " OcD",
        " NoD",
        " Vg",
        " UnV",
        " DoV",
        " TrV",
        " QaV",
        " QiV",
        " SxV",
        " SpV",
        " OcV",
        " NoV",
        " Tg",
        " UnT",
        " DoT",
        " TrT",
        " QaT",
        " QiT",
        " SxT",
        " SpT",
        " OcT",
        " NoT",
    ]),

    formatEveryThirdPower(["", " M", " G", " T", " P", " E", " Z", " Y", " R", " Q"]),
    scientificNotation,
]);

// Runs numbers in upgrades and achievements through our beautify function
function beautifyUpgradesAndAchievements() {
    function beautifyFn(str) {
        return Beautify(parseInt(str.replace(/,/, ""), 10));
    }

    const numre = /\d\d?\d?(?:,\d\d\d)*/;
    Object.values(Game.AchievementsById).forEach(function (ach) {
        ach.desc = ach.desc.replace(numre, beautifyFn);
    });

    // These might not have any numbers in them, but just in case...
    Object.values(Game.UpgradesById).forEach(function (upg) {
        upg.desc = upg.desc.replace(numre, beautifyFn);
    });
}

function fcDraw(from, text, origin) {
    if (typeof text == "string") {
        if (text.includes("Devastation")) {
            text = text.replace(
                /\+\d+\%/,
                "+" + Math.round((Game.hasBuff("Devastation").multClick - 1) * 100) + "%"
            );
        }
    }
    Game.tooltip.oldDraw(from, text, origin);
}

function fcReset() {
    Game.CollectWrinklers();
    if (BANK_GAME) {
        for (let i = 0; i < BANK_GAME.goodsById.length; i++) {
            BANK_GAME.sellGood(i, 10000);
        } // sell all stock
    }
    if (GARDEN_GAME) {
        GARDEN_GAME.harvestAll();
        // harvest all plants
    }
    if (
        Game.dragonLevel > 5 &&
        !Game.hasAura("Earth Shatterer") &&
        Game.HasUnlocked("Chocolate egg") &&
        !Game.Has("Chocolate egg")
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(5, 0);
        Game.ConfirmPrompt();
        Game.ObjectsById.forEach(function (b) {
            b.sell(-1);
        });
        Game.Upgrades["Chocolate egg"].buy();
    } else if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
        Game.ObjectsById.forEach(function (b) {
            b.sell(-1);
        });
        Game.Upgrades["Chocolate egg"].buy();
    }
    Game.oldReset();
    FrozenCookies.last_gc_state =
        (Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1) * clickBuffBonus();
    FrozenCookies.last_gc_time = Date.now();
    set("lastHCAmount", Game.HowMuchPrestige(
        Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
    ));
    set("lastHCTime", Date.now());
    set("maxHCPercent", 0);
    set("prevLastHCTime", Date.now());
    FrozenCookies.lastCps = 0;
    FrozenCookies.lastBaseCps = 0;
    recommendationList(true);
}

function saveFCData() {
    const saveString = {};
    _.keys(PREFERENCES).forEach(function (preference) {
        saveString[preference] = FrozenCookies[preference];
    });
    saveString.frenzyClickSpeed = FrozenCookies.frenzyClickSpeed;
    saveString.cookieClickSpeed = getNumber("cookieClickSpeed");
    saveString.HCAscendAmount = FrozenCookies.HCAscendAmount;
    saveString.mineMax = FrozenCookies.mineMax;
    saveString.factoryMax = FrozenCookies.factoryMax;
    saveString.minCpSMult = FrozenCookies.minCpSMult;
    saveString.minLoanMult = FrozenCookies.minLoanMult;
    saveString.minASFMult = FrozenCookies.minASFMult;
    saveString.frenzyTimes = saveAsJson();
    //  saveString.nonFrenzyTime = FrozenCookies.non_gc_time;
    //  saveString.frenzyTime = FrozenCookies.gc_time;
    saveString.lastHCAmount = getString("lastHCAmount");
    saveString.maxHCPercent = getString("maxHCPercent");
    saveString.lastHCTime = getString("lastHCTime");
    saveString.manaMax = FrozenCookies.manaMax;
    saveString.maxSpecials = getString("maxSpecials");
    saveString.cortexMax = FrozenCookies.cortexMax;
    saveString.prevLastHCTime = getString("prevLastHCTime");
    saveString.saveVersion = FrozenCookies.version;
    return JSON.stringify(saveString);
}

function copyToClipboard(text) {
    Game.promptOn = 1;
    window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    Game.promptOn = 0;
}

function getBuildingSpread() {
    return Game.ObjectsById.map(function (a) {
        return a.amount;
    }).join("/");
}

// todo: add bind for autoascend
// Press 'a' to toggle autoBuy.
// Press 'b' to pop up a copyable window with building spread.
// Press 'c' to toggle auto-GC
// Press 'e' to pop up a copyable window with your export string
// Press 'r' to pop up the reset window
// Press 's' to do a manual save
// Press 'w' to display a wrinkler-info window
document.addEventListener("keydown", function (event) {
    if (!Game.promptOn && FrozenCookies.FCshortcuts) {
        if (event.key == "a") {
            Game.Toggle("autoBuy", "autobuyButton", "Autobuy OFF", "Autobuy ON");
            toggleFrozen("autoBuy");
        }
        if (event.key == "b") {
            copyToClipboard(getBuildingSpread());
        }
        if (event.key == "c") {
            Game.Toggle("autoGC", "autogcButton", "Autoclick GC OFF", "Autoclick GC ON");
            toggleFrozen("autoGC");
        }
        if (event.key == "e") {
            copyToClipboard(Game.WriteSave(true));
        }
        if (event.key == "r") {
            Game.Reset();
        }
        if (event.key == "s") {
            Game.WriteSave();
        }
        if (event.key == "w") {
            Game.Notify(
                "Wrinkler Info",
                "Popping all wrinklers will give you " +
                    Beautify(wrinklerValue()) +
                    ' cookies. <input type="button" value="Click here to pop all wrinklers" onclick="Game.CollectWrinklers()"></input>',
                [19, 8],
                7
            );
        }
    }
});

function toggleFrozen(setting) {
    if (!FrozenCookies[setting]) {
        FrozenCookies[setting] = 1;
    } else {
        FrozenCookies[setting] = 0;
    }
    loadFeatures();
}

function clickBuffBonus() {
    let ret = 1;
    for (const i in Game.buffs) {
        // Devastation, Godzamok's buff, is too variable
        if (
            typeof Game.buffs[i].multClick != "undefined" &&
            Game.buffs[i].name != "Devastation"
        ) {
            ret *= Game.buffs[i].multClick;
        }
    }
    return ret;
}

function baseCps() {
    let buffMod = 1;
    for (const i in Game.buffs) {
        if (typeof Game.buffs[i].multCpS != "undefined") {
            buffMod *= Game.buffs[i].multCpS;
        }
    }
    if (buffMod === 0) {
        return FrozenCookies.lastBaseCPS;
    }
    const baseCPS = Game.cookiesPs / buffMod;
    FrozenCookies.lastBaseCPS = baseCPS;
    return baseCPS;
}

function baseClickingCps(clickSpeed) {
    const clickFrenzyMod = clickBuffBonus();
    const frenzyMod = Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1;
    const cpc = Game.mouseCps() / (clickFrenzyMod * frenzyMod);
    return clickSpeed * cpc;
}

function effectiveCps(delay, wrathValue, wrinklerCount) {
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    wrinklerCount = wrinklerCount != null ? wrinklerCount : wrathValue ? 10 : 0;
    const wrinkler = wrinklerMod(wrinklerCount);
    if (delay == null) {
        delay = delayAmount();
    }
    return (
        baseCps() * wrinkler +
        gcPs(cookieValue(delay, wrathValue, wrinklerCount)) +
        baseClickingCps(getNumber("cookieClickSpeed") * getNumber("autoClick")) +
        reindeerCps(wrathValue)
    );
}

function frenzyProbability(wrathValue) {
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    return COOKIE_SPEC.frenzy.odds[wrathValue]; // + COOKIE_SPEC.frenzyRuin.odds[wrathValue] + COOKIE_SPEC.frenzyLucky.odds[wrathValue] + COOKIE_SPEC.frenzyClick.odds[wrathValue];
}

function clotProbability(wrathValue) {
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    return COOKIE_SPEC.clot.odds[wrathValue]; // + COOKIE_SPEC.clotRuin.odds[wrathValue] + COOKIE_SPEC.clotLucky.odds[wrathValue] + COOKIE_SPEC.clotClick.odds[wrathValue];
}

function bloodProbability(wrathValue) {
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    return COOKIE_SPEC.blood.odds[wrathValue];
}

function cookieValue(bankAmount, wrathValue, wrinklerCount) {
    const cps = baseCps();
    const clickCps = baseClickingCps(
        getNumber("autoClick") * getNumber("cookieClickSpeed")
    );
    const frenzyCps = FrozenCookies.autoFrenzy
        ? baseClickingCps(FrozenCookies.autoFrenzy * FrozenCookies.frenzyClickSpeed)
        : clickCps;
    const luckyMod = Game.Has("Get lucky") ? 2 : 1;
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    wrinklerCount = wrinklerCount != null ? wrinklerCount : wrathValue ? 10 : 0;
    const wrinkler = wrinklerMod(wrinklerCount);

    let value = 0;
    // Clot
    value -=
        COOKIE_SPEC.clot.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        66 *
        0.5;
    // Frenzy
    value +=
        COOKIE_SPEC.frenzy.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        77 *
        6;
    // Blood
    value +=
        COOKIE_SPEC.blood.odds[wrathValue] *
        (wrinkler * cps + clickCps) *
        luckyMod *
        6 *
        665;
    // Chain
    value +=
        COOKIE_SPEC.chain.odds[wrathValue] *
        calculateChainValue(bankAmount, cps, 7 - wrathValue / 3);
    // Ruin
    value -=
        COOKIE_SPEC.ruin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10) + 13);
    // Frenzy + Ruin
    value -=
        COOKIE_SPEC.frenzyRuin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10 * 7) + 13);
    // Clot + Ruin
    value -=
        COOKIE_SPEC.clotRuin.odds[wrathValue] *
        (Math.min(bankAmount * 0.05, cps * 60 * 10 * 0.5) + 13);
    // Lucky
    value +=
        COOKIE_SPEC.lucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15) + 13);
    // Frenzy + Lucky
    value +=
        COOKIE_SPEC.frenzyLucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15 * 7) + 13);
    // Clot + Lucky
    value +=
        COOKIE_SPEC.clotLucky.odds[wrathValue] *
        (Math.min(bankAmount * 0.15, cps * 60 * 15 * 0.5) + 13);
    // Click
    value += COOKIE_SPEC.click.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777;
    // Frenzy + Click
    value +=
        COOKIE_SPEC.frenzyClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 7;
    // Clot + Click
    value +=
        COOKIE_SPEC.clotClick.odds[wrathValue] * frenzyCps * luckyMod * 13 * 777 * 0.5;
    // Blah
    value += 0;
    return value;
}

function reindeerValue(wrathValue) {
    if (Game.season != "christmas") {
        return 0;
    }
    let value = 0;
    const remaining =
        1 -
        (frenzyProbability(wrathValue) +
            clotProbability(wrathValue) +
            bloodProbability(wrathValue));
    const outputMod = Game.Has("Ho ho ho-flavored frosting") ? 2 : 1;

    value +=
        Math.max(25, baseCps() * outputMod * 60 * 7) * frenzyProbability(wrathValue);
    value +=
        Math.max(25, baseCps() * outputMod * 60 * 0.5) * clotProbability(wrathValue);
    value +=
        Math.max(25, baseCps() * outputMod * 60 * 666) * bloodProbability(wrathValue);
    value += Math.max(25, baseCps() * outputMod * 60) * remaining;
    return value;
}

function reindeerCps(wrathValue) {
    const averageTime = probabilitySpan("reindeer", 0, 0.5) / Game.fps;
    return (reindeerValue(wrathValue) / averageTime) * FrozenCookies.simulatedGCPercent;
}

function calculateChainValue(bankAmount, cps, digit) {
    const x = Math.min(bankAmount, cps * 60 * 60 * 6 * 4);
    const n = Math.floor(Math.log((9 * x) / (4 * digit)) / Math.LN10);
    return 125 * Math.pow(9, n - 3) * digit;
}

function wrinklerValue() {
    return Game.wrinklers.reduce(function (s, w) {
        return s + popValue(w);
    }, 0);
}

function gcPs(gcValue) {
    const averageGCTime = probabilitySpan("golden", 0, 0.5) / Game.fps;
    gcValue /= averageGCTime;
    gcValue *= FrozenCookies.simulatedGCPercent;
    return gcValue;
}

function delayAmount() {
    return bestBank(nextChainedPurchase().efficiency).cost;
}

function nextChainedPurchase(recalculate) {
    nextPurchase(recalculate);
    return FrozenCookies.caches.nextChainedPurchase;
}

function totalDiscount(building) {
    let price = 1;
    if (building) {
        if (Game.Has("Season savings")) {
            price *= 0.99;
        }
        if (Game.Has("Santa's dominion")) {
            price *= 0.99;
        }
        if (Game.Has("Faberge egg")) {
            price *= 0.99;
        }
        if (Game.Has("Divine discount")) {
            price *= 0.99;
        }
        if (Game.hasAura("Fierce Hoarder")) {
            price *= 0.98;
        }
        if (Game.hasBuff("Everything must go")) {
            price *= 0.95;
        }
    } else {
        if (Game.Has("Toy workshop")) {
            price *= 0.95;
        }
        if (Game.Has("Five-finger discount")) {
            price *= Math.pow(0.99, Game.Objects["Cursor"].amount / 100);
        }
        if (Game.Has("Santa's dominion")) {
            price *= 0.98;
        }
        if (Game.Has("Faberge egg")) {
            price *= 0.99;
        }
        if (Game.Has("Divine sales")) {
            price *= 0.99;
        }
        if (Game.hasAura("Master of the Armory")) {
            price *= 0.98;
        }
    }
    return price;
}

function cumulativeBuildingCost(basePrice, startingNumber, endingNumber) {
    return (
        (basePrice *
            totalDiscount(true) *
            (Math.pow(Game.priceIncrease, endingNumber) -
                Math.pow(Game.priceIncrease, startingNumber))) /
        (Game.priceIncrease - 1)
    );
}

function cumulativeSantaCost(amount) {
    let total = 0;
    if (!amount) {
    } else if (Game.santaLevel + amount < Game.santaLevels.length) {
        for (let i = Game.santaLevel + 1; i <= Game.santaLevel + amount; i++) {
            total += Math.pow(i, i);
        }
    } else if (amount < Game.santaLevels.length) {
        for (let i = Game.santaLevel + 1; i <= amount; i++) {
            total += Math.pow(i, i);
        }
    } else {
        total = Infinity;
    }
    return total;
}

// Why the hell is fcWin being called so often? It seems to be getting called repeatedly on the CPS achievements,
// which should only happen when you actually win them?
function fcWin(what) {
    if (typeof what === "string") {
        if (Game.Achievements[what]) {
            if (Game.Achievements[what].won == 0) {
                const achname = Game.Achievements[what].shortName
                    ? Game.Achievements[what].shortName
                    : Game.Achievements[what].name;
                Game.Achievements[what].won = 1;
                // This happens a ton of times on CPS achievements; it seems like they would be CHECKED for, but a debug message placed
                // here gets repeatedly called seeming to indicate that the achievements.won value is 1, even though the achievement isn't
                // being unlocked. This also means that placing a function to log the achievement spams out messages. Are the Achievement.won
                // values being turned off before the game checks again? There must be some reason Game.Win is replaced with fcWin
                if (!FrozenCookies.disabledPopups) {
                    logEvent(
                        "Achievement",
                        "Achievement unlocked :<br>" +
                            Game.Achievements[what].name +
                            "<br> ",
                        true
                    );
                }
                if (FrozenCookies.showAchievements) {
                    Game.Notify(
                        "Achievement unlocked",
                        '<div class="title" style="font-size:18px;margin-top:-2px;">' +
                            achname +
                            "</div>",
                        Game.Achievements[what].icon
                    );
                    if (App && Game.Achievements[what].vanilla) {
                        App.gotAchiev(Game.Achievements[what].id);
                    }
                }
                if (Game.Achievements[what].pool != "shadow") {
                    Game.AchievementsOwned++;
                }
                Game.recalculateGains = 1;
            }
        }
    } else {
        logEvent("fcWin Else condition");
        for (const i in what) {
            Game.Win(what[i]);
        }
    }
}

function logEvent(event, text, popup) {
    const time = "[" + timeDisplay((Date.now() - Game.startDate) / 1000) + "]";
    const output = time + " " + event + ": " + text;
    if (FrozenCookies.logging) {
        console.log(output);
    }
    if (popup) {
        Game.Popup(text);
    }
}

function wrinklerMod(num) {
    return (
        1.1 * num * num * 0.05 * (Game.Has("Wrinklerspawn") ? 1.05 : 1) + (1 - 0.05 * num)
    );
}

function popValue(w) {
    let toSuck = 1.1;
    if (Game.Has("Sacrilegious corruption")) {
        toSuck *= 1.05;
    }
    if (w.type == 1) {
        toSuck *= 3; // shiny wrinklers are an elusive, profitable breed
    }
    let sucked = w.sucked * toSuck; // cookie dough does weird things inside wrinkler digestive tracts
    if (Game.Has("Wrinklerspawn")) {
        sucked *= 1.05;
    }
    return sucked;
}


async function loadFeatures() {
    /** @type {{ start: () => void; stop: () => void }[]} */
    const features = [
        await import("./feat/auto_100_consist_combo.js"),
        await import("./feat/auto_bank_broker.js"),
        await import("./feat/auto_bank_loan.js"),
        await import("./feat/auto_bank_office.js"),
        await import("./feat/auto_click.js"),
        await import("./feat/auto_cookie.js"),
        await import("./feat/auto_cyclius.js"),
        await import("./feat/auto_dragon_aura.js"),
        await import("./feat/auto_dragon_orbs.js"),
        await import("./feat/auto_dragon_pet.js"),
        await import("./feat/auto_dragon_upgrade.js"),
        await import("./feat/auto_easter.js"),
        await import("./feat/auto_fortune_ticker.js"),
        await import("./feat/auto_frenzy_click.js"),
        await import("./feat/auto_godzamok.js"),
        await import("./feat/auto_golden_switch.js"),
        await import("./feat/auto_halloween.js"),
        await import("./feat/auto_spell_combo.js"),
        await import("./feat/auto_spell.js"),
        await import("./feat/auto_sugar_frenzy.js"),
        await import("./feat/auto_sweet.js"),
        await import("./feat/auto_worship.js"),
        await import("./feat/recommended_settings.js"),
        await import("./feat/track_stats.js"),
    ];

    //  To allow polling frequency to change, clear intervals before setting new ones.
    for (const { stop } of features) {
        stop();
    }

    // Remove until timing issues are fixed
    //  if (FrozenCookies.goldenCookieBot) {
    //    clearInterval(FrozenCookies.goldenCookieBot);
    //    FrozenCookies.goldenCookieBot = 0;
    //  }

    // Now create new intervals with their specified frequencies.

    for (const { start } of features) {
        start();
    }

    /*if (FrozenCookies.autoGC) {
          FrozenCookies.goldenCookieBot = setInterval(
            autoGoldenCookie,
            FrozenCookies.frequency
          );
      }*/

    FCMenu();
}
