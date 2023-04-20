import {
    BLACKLIST,
    COOKIE_SPEC,
    HOLIDAY_COOKIES,
    RECOMMENDATION_BLACKLIST,
    SEASONS,
    UPGRADE_PREREQUISITES,
} from "./cc_upgrade_prerequisites.js";
import { Beautify } from "./fc_beautify.js";
import { FCMenu } from "./fc_button.js";
import { divCps } from "./fc_time.js";
import { timeDisplay } from "./fc_format.js";
import { updateTimers } from "./fc_infobox.js";
import { getNumber, getString, has, loadFromStorage, set } from "./fc_store.js";
import { loadFromJson, saveAsJson } from "./fc_frenzy_times.js";

export function registerMod(mod_id = "frozen_cookies", Game) {
    // register with the modding API
    Game.registerMod(mod_id, {
        init: function () {
            Game.registerHook("reincarnate", function () {
                // called when the player has reincarnated after an ascension
                if (!FrozenCookies.autoBulk) {
                    return;
                }
                if (FrozenCookies.autoBulk == 1) {
                    document.getElementById("storeBulk10").click();
                }
                if (FrozenCookies.autoBulk == 2) {
                    document.getElementById("storeBulk100").click();
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
    FrozenCookies.recalculateCaches = true;
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
    saveString.maxSpecials = FrozenCookies.maxSpecials;
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
        baseClickingCps(getNumber("cookieClickSpeed") * FrozenCookies.autoClick) +
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
        FrozenCookies.autoClick * getNumber("cookieClickSpeed")
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

function canCastSE() {
    if (TOWER_GAME.magicM >= 80 && Game.Objects["Cortex baker"].amount > 0) {
        return 1;
    }
    return 0;
}

function edificeBank() {
    if (!canCastSE) {
        return 0;
    }
    const cmCost = Game.Objects["Cortex baker"].price;
    return Game.hasBuff("everything must go") ? (cmCost * (100 / 95)) / 2 : cmCost / 2;
}

function luckyBank() {
    return baseCps() * 60 * 100;
}

function luckyFrenzyBank() {
    let bank = baseCps() * 60 * 100 * 7;
    // Adds the price of Get Lucky (with discounts) since that would need to be
    // purchased in order for this bank to make sense.
    bank += Game.Has("Get lucky") ? 0 : Game.UpgradesById[86].getPrice();
    return bank;
}

const NONE = 0;
const BAKEBERRY = 1;
const CHOCOROOT = 2;
const WHITE_CHOCOROOT = 3;
const QUEENBEET = 4;
const DUKETATER = 5;
const CRUMBSPORE = 6;
const DOUGHSHROOM = 7;

function harvestBank() {
    const setHarvestBankPlant = getNumber("setHarvestBankPlant");
    if (setHarvestBankPlant == null || setHarvestBankPlant == NONE) {
        return 0;
    }

    FrozenCookies.harvestMinutes = 0;
    FrozenCookies.harvestMaxPercent = 0;
    FrozenCookies.harvestFrenzy = 1;
    FrozenCookies.harvestBuilding = 1;
    set("harvestPlant", "");

    if (FrozenCookies.setHarvestBankType == 1 || FrozenCookies.setHarvestBankType == 3) {
        FrozenCookies.harvestFrenzy = 7;
    }

    if (FrozenCookies.setHarvestBankType == 2 || FrozenCookies.setHarvestBankType == 3) {
        const harvestBuildingArray = [
            Game.Objects["Cursor"].amount,
            Game.Objects["Grandma"].amount,
            Game.Objects["Farm"].amount,
            Game.Objects["Mine"].amount,
            Game.Objects["Factory"].amount,
            Game.Objects["Bank"].amount,
            Game.Objects["Temple"].amount,
            Game.Objects["Wizard tower"].amount,
            Game.Objects["Shipment"].amount,
            Game.Objects["Alchemy lab"].amount,
            Game.Objects["Portal"].amount,
            Game.Objects["Time machine"].amount,
            Game.Objects["Antimatter condenser"].amount,
            Game.Objects["Prism"].amount,
            Game.Objects["Chancemaker"].amount,
            Game.Objects["Fractal engine"].amount,
            Game.Objects["Javascript console"].amount,
            Game.Objects["Idleverse"].amount,
            Game.Objects["Cortex baker"].amount,
        ];
        harvestBuildingArray.sort(function (a, b) {
            return b - a;
        });

        for (
            let buildingLoop = 0;
            buildingLoop < FrozenCookies.maxSpecials;
            buildingLoop++
        ) {
            FrozenCookies.harvestBuilding *= harvestBuildingArray[buildingLoop];
        }
    }

    switch (setHarvestBankPlant) {
        case BAKEBERRY:
            set("harvestPlant", "Bakeberry");
            FrozenCookies.harvestMinutes = 30;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case CHOCOROOT:
            set("harvestPlant", "Chocoroot");
            FrozenCookies.harvestMinutes = 3;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case WHITE_CHOCOROOT:
            set("harvestPlant", "White Chocoroot");
            FrozenCookies.harvestMinutes = 3;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case QUEENBEET:
            set("harvestPlant", "Queenbeet");
            FrozenCookies.harvestMinutes = 60;
            FrozenCookies.harvestMaxPercent = 0.04;
            break;

        case DUKETATER:
            set("harvestPlant", "Duketater");
            FrozenCookies.harvestMinutes = 120;
            FrozenCookies.harvestMaxPercent = 0.08;
            break;

        case CRUMBSPORE:
            set("harvestPlant", "Crumbspore");
            FrozenCookies.harvestMinutes = 1;
            FrozenCookies.harvestMaxPercent = 0.01;
            break;

        case DOUGHSHROOM:
            set("harvestPlant", "Doughshroom");
            FrozenCookies.harvestMinutes = 5;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;
    }

    if (!FrozenCookies.maxSpecials) {
        FrozenCookies.maxSpecials = 1;
    }

    return (
        (baseCps() *
            60 *
            FrozenCookies.harvestMinutes *
            FrozenCookies.harvestFrenzy *
            FrozenCookies.harvestBuilding) /
        Math.pow(10, FrozenCookies.maxSpecials) /
        FrozenCookies.harvestMaxPercent
    );
}

function cookieEfficiency(startingPoint, bankAmount) {
    const currentValue = cookieValue(startingPoint);
    const bankValue = cookieValue(bankAmount);
    const bankCps = gcPs(bankValue);
    if (bankAmount <= startingPoint) {
        return 0;
    }
    if (bankCps > 0) {
        const cost = Math.max(0, bankAmount - startingPoint);
        const deltaCps = gcPs(bankValue - currentValue);
        return divCps(cost, deltaCps);
    }
    return Number.MAX_VALUE;
}

function bestBank(minEfficiency) {
    const edifice =
        FrozenCookies.autoSpell == 3 || FrozenCookies.holdSEBank ? edificeBank() : 0;
    const bankLevel = [0, luckyBank(), luckyFrenzyBank(), harvestBank()]
        .sort(function (a, b) {
            return b - a;
        })
        .map(function (bank) {
            return {
                cost: bank,
                efficiency: cookieEfficiency(Game.cookies, bank),
            };
        })
        .find(function (bank) {
            return (bank.efficiency >= 0 && bank.efficiency <= minEfficiency) ||
                setHarvestBankPlant != NONE;
        });
    if (bankLevel.cost > edifice || setHarvestBankPlant != NONE) {
        return bankLevel;
    }
    return {
        cost: edifice,
        efficiency: 1,
    };
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

function haveAll(holiday) {
    return _.every(HOLIDAY_COOKIES[holiday], function (id) {
        return Game.UpgradesById[id].unlocked;
    });
}

function checkPrices(currentUpgrade) {
    if (FrozenCookies.caches.recommendationList.length == 0) {
        return 0;
    }
    let nextRec = FrozenCookies.caches.recommendationList.filter(function (i) {
        return i.id != currentUpgrade.id;
    })[0];
    const nextPrereq =
        nextRec.type == "upgrade" ? unfinishedUpgradePrereqs(nextRec.purchase) : null;
    if (nextPrereq == null) {
        return 0;
    }
    const havingCosts = nextPrereq.filter(function (u) {
        return u.cost != null;
    });
    if (havingCosts.length > 0) {
        nextRec = FrozenCookies.caches.recommendationList.find(function (a) {
            return nextPrereq.some(function (b) {
                return b.id == a.id && b.type == a.type;
            });
        });
    }
    if (nextRec.cost == null) {
        return 0;
    }
    return nextRec.cost / totalDiscount(nextRec.type == "building") - nextRec.cost;
}

// Use this for changes to future efficiency calcs
function purchaseEfficiency(price, deltaCps, _baseDeltaCps, currentCps) {
    if (deltaCps > 0) {
        return FrozenCookies.efficiencyWeight * divCps(price, currentCps) +
            divCps(price, deltaCps);
    }
    return Number.POSITIVE_INFINITY;
}

function recommendationList(recalculate) {
    if (recalculate) {
        FrozenCookies.showAchievements = false;
        FrozenCookies.caches.recommendationList = addScores(
            upgradeStats(recalculate)
                .concat(buildingStats(recalculate))
                .concat(santaStats())
                .sort(function (a, b) {
                    return a.efficiency != b.efficiency
                        ? a.efficiency - b.efficiency
                        : a.delta_cps != b.delta_cps
                        ? b.delta_cps - a.delta_cps
                        : a.cost - b.cost;
                })
        );
        if (FrozenCookies.pastemode) {
            FrozenCookies.caches.recommendationList.reverse();
        }
        FrozenCookies.showAchievements = true;
    }
    return FrozenCookies.caches.recommendationList;
}

function addScores(recommendations) {
    const filteredList = recommendations.filter(function (a) {
        return (
            a.efficiency < Number.POSITIVE_INFINITY &&
            a.efficiency > Number.NEGATIVE_INFINITY
        );
    });
    if (filteredList.length == 0) {
        for (let i = 0; recommendations.length; ++i) {
            recommendations[i].efficiencyScore = 0;
        }
        return recommendations;
    }
    const minValue = Math.log(recommendations[0].efficiency);
    const maxValue = Math.log(recommendations[filteredList.length - 1].efficiency);
    const spread = maxValue - minValue;
    return recommendations.map(function (purchaseRec) {
        if (
            purchaseRec.efficiency < Number.POSITIVE_INFINITY &&
            purchaseRec.efficiency > Number.NEGATIVE_INFINITY
        ) {
            const purchaseValue = Math.log(purchaseRec.efficiency);
            const purchaseSpread = purchaseValue - minValue;
            return {
                ...purchaseRec,
                efficiencyScore: 1 - purchaseSpread / spread,
            };
        }
        return {
            ...purchaseRec,
            efficiencyScore: 0,
        };
    });
}

function nextPurchase(recalculate) {
    if (recalculate) {
        FrozenCookies.showAchievements = false;
        const recList = recommendationList(recalculate);
        let purchase = null;
        let target = null;
        for (let i = 0; i < recList.length; i++) {
            target = recList[i];
            const unfinished = unfinishedUpgradePrereqs(Game.UpgradesById[target.id]);
            if (
                target.type == "upgrade" &&
                unfinished
            ) {
                const unfinishedTypes = new Set(unfinished.map(({ type }) => type));
                const unfinishedIds = new Set(unfinished.map(({ id }) => id));
                purchase = recList.find(function (a) {
                    return unfinishedTypes.has(a.type) && unfinishedIds.has(a.id);
                });
            } else {
                purchase = target;
            }
            if (purchase) {
                FrozenCookies.caches.nextPurchase = purchase;
                FrozenCookies.caches.nextChainedPurchase = target;
                break;
            }
        }
        if (purchase == null) {
            FrozenCookies.caches.nextPurchase = defaultPurchase();
            FrozenCookies.caches.nextChainedPurchase = defaultPurchase();
        }
        FrozenCookies.showAchievements = true;
    }
    return FrozenCookies.caches.nextPurchase;
    //  return purchase;
}

function nextChainedPurchase(recalculate) {
    nextPurchase(recalculate);
    return FrozenCookies.caches.nextChainedPurchase;
}

function buildingStats(recalculate) {
    if (recalculate) {
        if (BLACKLIST[FrozenCookies.blacklist].buildings === true) {
            FrozenCookies.caches.buildings = [];
        } else {
            const buildingBlacklist = Array.from(
                BLACKLIST[FrozenCookies.blacklist].buildings
            );
            // If autocasting Spontaneous Edifice, don't buy any Cortex baker after 399
            if (
                TOWER_GAME &&
                FrozenCookies.autoSpell == 3 &&
                Game.Objects["Cortex baker"].amount >= 399
            )
                buildingBlacklist.push(18);
            // Stop buying wizard towers at max Mana if enabled
            if (
                TOWER_GAME &&
                FrozenCookies.towerLimit &&
                TOWER_GAME.magicM >= FrozenCookies.manaMax
            ) {
                buildingBlacklist.push(7);
            }
            // Stop buying Mines if at set limit
            if (
                FrozenCookies.mineLimit &&
                Game.Objects["Mine"].amount >= FrozenCookies.mineMax
            )
                buildingBlacklist.push(3);
            // Stop buying Factories if at set limit
            if (
                FrozenCookies.factoryLimit &&
                Game.Objects["Factory"].amount >= FrozenCookies.factoryMax
            )
                buildingBlacklist.push(4);
            // Stop buying Cortex bakers if at set limit
            if (
                FrozenCookies.autoDragonOrbs &&
                FrozenCookies.cortexLimit &&
                Game.Objects["Cortex baker"].amount >= FrozenCookies.cortexMax
            )
                buildingBlacklist.push(18);
            FrozenCookies.caches.buildings = Game.ObjectsById.map(function (
                current
            ) {
                if (_.contains(buildingBlacklist, current.id)) {
                    return null;
                }
                const currentBank = bestBank(0).cost;
                const baseCpsOrig = baseCps();
                const cpsOrig = effectiveCps(Math.min(Game.cookies, currentBank));
                const existingAchievements = Object.values(Game.AchievementsById).map(
                    function (item) {
                        return item.won;
                    }
                );
                buildingToggle(current);
                const baseCpsNew = baseCps();
                const cpsNew = effectiveCps(currentBank);
                buildingToggle(current, existingAchievements);
                const deltaCps = cpsNew - cpsOrig;
                const baseDeltaCps = baseCpsNew - baseCpsOrig;
                const efficiency = purchaseEfficiency(
                    current.getPrice(),
                    deltaCps,
                    baseDeltaCps,
                    cpsOrig
                );
                return {
                    id: current.id,
                    efficiency: efficiency,
                    base_delta_cps: baseDeltaCps,
                    delta_cps: deltaCps,
                    cost: current.getPrice(),
                    purchase: current,
                    type: "building",
                };
            }).filter(function (a) {
                return a;
            });
        }
    }
    return FrozenCookies.caches.buildings;
}

function upgradeStats(recalculate) {
    if (recalculate) {
        if (BLACKLIST[FrozenCookies.blacklist].upgrades === true) {
            FrozenCookies.caches.upgrades = [];
        } else {
            const upgradeBlacklist = BLACKLIST[FrozenCookies.blacklist].upgrades;
            const existingAchievements = Object.values(
                Game.AchievementsById
            ).map(function (item) {
                return item.won;
            });

            const needToCalculate = new Set(Object.values(Game.UpgradesById).map(({ id }) => id));
            for (const { id: cachedId } of FrozenCookies.caches.upgrades) {
                if (needToCalculate.has(cachedId)) {
                    needToCalculate.delete(cachedId);
                } else {
                    needToCalculate.add(cachedId);
                }
            }

            FrozenCookies.caches.upgrades = Object.values(Game.UpgradesById)
                .filter(function (current) {
                    return (
                        !current.bought
                        && isAvailable(current, upgradeBlacklist)
                        && needToCalculate.has(current.id)
                    );
                })
                .map(function (current) {
                    const currentBank = bestBank(0).cost;
                    const cost = upgradePrereqCost(current);
                    const baseCpsOrig = baseCps();
                    const cpsOrig = effectiveCps(Math.min(Game.cookies, currentBank));
                    const existingWrath = Game.elderWrath;
                    const discounts = totalDiscount() + totalDiscount(true);

                    const reverseFunctions = upgradeToggle(current);
                    Game.recalculateGains = 1;
                    Game.CalculateGains();
                    const baseCpsNew = baseCps();
                    const cpsNew = effectiveCps(currentBank);
                    const priceReduction =
                        discounts == totalDiscount() + totalDiscount(true)
                            ? 0
                            : checkPrices(current);
                    upgradeToggleReverse(current, reverseFunctions);
                    Game.recalculateGains = 1;
                    Game.CalculateGains();

                    Game.elderWrath = existingWrath;
                    const deltaCps = cpsNew - cpsOrig;
                    const baseDeltaCps = baseCpsNew - baseCpsOrig;
                    const efficiency =
                        current.season &&
                        current.season == SEASONS[FrozenCookies.defaultSeason]
                            ? cost / baseCpsOrig
                            : priceReduction > cost
                            ? 1
                            : purchaseEfficiency(
                                    cost,
                                    deltaCps,
                                    baseDeltaCps,
                                    cpsOrig
                                );
                    return {
                        id: current.id,
                        efficiency: efficiency,
                        base_delta_cps: baseDeltaCps,
                        delta_cps: deltaCps,
                        cost: cost,
                        purchase: current,
                        type: "upgrade",
                    };
                });

                const achievementsLen = existingAchievements.length;
                for (let index = 0; index < achievementsLen; ++index) {
                    Game.AchievementsById[index].won = existingAchievements[index];
                }
                Game.AchievementsOwned = existingAchievements.filter(function (won, index) {
                    return won && Game.AchievementsById[index].pool != "shadow";
                }).length;
        }
    }
    return FrozenCookies.caches.upgrades;
}

function isAvailable(upgrade, upgradeBlacklist) {
    // should we even recommend upgrades at all?
    if (upgradeBlacklist === true) {
        return false;
    }

    // check if the upgrade is in the selected blacklist, or is an upgrade that shouldn't be recommended
    if (upgradeBlacklist.concat(RECOMMENDATION_BLACKLIST).includes(upgrade.id)) {
        return false;
    }

    // Is it vaulted?
    if (Game.Has("Inspired checklist") && Game.vault.includes(upgrade.id)) {
        return false;
    }

    // Don't pledge if Easter or Halloween not complete
    if (
        upgrade.id == 74 &&
        (Game.season == "halloween" || Game.season == "easter") &&
        !haveAll(Game.season)
    ) {
        return false;
    }

    // Don't pledge if we want to protect Shiny Wrinklers
    if (upgrade.id == 74 && FrozenCookies.shinyPop == 1) {
        return false;
    }

    // Web cookies are only on Browser
    if (App && upgrade.id == 816) {
        return false;
    }

    // Steamed cookies are only on Steam
    if (!App && upgrade.id == 817) {
        return false;
    }

    // Don't leave base season if it's desired
    if (
        (upgrade.id == 182 ||
            upgrade.id == 183 ||
            upgrade.id == 184 ||
            upgrade.id == 185 ||
            upgrade.id == 209) &&
        Game.baseSeason &&
        Game.UpgradesById[181].unlocked &&
        upgrade.id == 182 &&
        haveAll("christmas") &&
        upgrade.id == 183 &&
        haveAll("halloween") &&
        upgrade.id == 184 &&
        haveAll("valentines") &&
        upgrade.id == 209 &&
        haveAll("easter") &&
        (FrozenCookies.freeSeason == 2 ||
            (FrozenCookies.freeSeason == 1 &&
                ((Game.baseSeason == "christmas" && upgrade.id == 182) ||
                    (Game.baseSeason == "fools" && upgrade.id == 185))))
    ) {
        return false;
    }

    const needed = unfinishedUpgradePrereqs(upgrade);
    if (!upgrade.unlocked && !needed) {
        return false;
    }
    if (
        _.find(needed, function (a) {
            return a.type == "wrinklers";
        }) != null &&
        needed
    ) {
        return false;
    }
    if (
        _.find(needed, function (a) {
            return a.type == "santa";
        }) != null &&
        "christmas" != Game.season &&
        !Game.UpgradesById[181].unlocked &&
        !Game.prestige
    ) {
        return false;
    }
    if (
        (upgrade.season && !haveAll(Game.season)) ||
        (
            upgrade.season &&
            upgrade.season != SEASONS[FrozenCookies.defaultSeason] &&
            haveAll(upgrade.season)
        )
    ) {
        return false;
    }
    return true;
}

function santaStats() {
    return Game.Has("A festive hat") && Game.santaLevel + 1 < Game.santaLevels.length
        ? {
              id: 0,
              efficiency: Infinity,
              base_delta_cps: 0,
              delta_cps: 0,
              cost: cumulativeSantaCost(1),
              type: "santa",
              purchase: {
                  id: 0,
                  name:
                      "Santa Stage Upgrade (" +
                      Game.santaLevels[(Game.santaLevel + 1) % Game.santaLevels.length] +
                      ")",
                  buy: buySanta,
                  getCost: function () {
                      return cumulativeSantaCost(1);
                  },
              },
          }
        : [];
}

function defaultPurchase() {
    return {
        id: 0,
        efficiency: Infinity,
        delta_cps: 0,
        base_delta_cps: 0,
        cost: Infinity,
        type: "other",
        purchase: {
            id: 0,
            name: "No valid purchases!",
            buy: function () {},
            getCost: function () {
                return Infinity;
            },
        },
    };
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

function upgradePrereqCost(upgrade, full) {
    let cost = upgrade.getPrice();
    if (upgrade.unlocked) {
        return cost;
    }
    const prereqs = UPGRADE_PREREQUISITES[upgrade.id];
    if (!prereqs) {
        return cost;
    }
    cost += prereqs.buildings.reduce(function (sum, item, index) {
        const building = Game.ObjectsById[index];
        if (item && full) {
            sum += cumulativeBuildingCost(building.basePrice, 0, item);
        } else if (item && building.amount < item) {
            sum += cumulativeBuildingCost(building.basePrice, building.amount, item);
        }
        return sum;
    }, 0);
    cost += prereqs.upgrades.reduce(function (sum, item) {
        const reqUpgrade = Game.UpgradesById[item];
        if (!upgrade.bought || full) {
            sum += upgradePrereqCost(reqUpgrade, full);
        }
        return sum;
    }, 0);
    cost += cumulativeSantaCost(prereqs.santa);
    return cost;
}

function unfinishedUpgradePrereqs(upgrade) {
    if (upgrade.unlocked) {
        return null;
    }
    const prereqs = UPGRADE_PREREQUISITES[upgrade.id];
    if (!prereqs) {
        return null;
    }
    const needed = [];
    prereqs.buildings.forEach(function (a, b) {
        if (a && Game.ObjectsById[b].amount < a) {
            needed.push({
                type: "building",
                id: b,
            });
        }
    });
    prereqs.upgrades.forEach(function (a) {
        if (!Game.UpgradesById[a].bought) {
            const recursiveUpgrade = Game.UpgradesById[a];
            const recursivePrereqs = unfinishedUpgradePrereqs(recursiveUpgrade);
            if (recursiveUpgrade.unlocked) {
                needed.push({
                    type: "upgrade",
                    id: a,
                });
            } else if (!recursivePrereqs) {
                // Research is being done.
            } else {
                recursivePrereqs.forEach(function (a) {
                    if (
                        !needed.some(function (b) {
                            return b.id == a.id && b.type == a.type;
                        })
                    ) {
                        needed.push(a);
                    }
                });
            }
        }
    });
    if (prereqs.santa) {
        needed.push({
            type: "santa",
            id: 0,
        });
    }
    if (prereqs.wrinklers && !Game.elderWrath) {
        needed.push({
            type: "wrinklers",
            id: 0,
        });
    }
    return needed.length ? needed : null;
}

function upgradeToggle(upgrade) {
    const reverseFunctions = {};
    if (!upgrade.unlocked) {
        const prereqs = UPGRADE_PREREQUISITES[upgrade.id];
        if (prereqs) {
            reverseFunctions.prereqBuildings = [];
            prereqs.buildings.forEach(function (requiredBuildings, buildingId) {
                const building = Game.ObjectsById[buildingId];
                if (requiredBuildings && building.amount < requiredBuildings) {
                    const difference = requiredBuildings - building.amount;
                    reverseFunctions.prereqBuildings.push({
                        id: buildingId,
                        amount: difference,
                    });
                    building.amount += difference;
                    building.bought += difference;
                    Game.BuildingsOwned += difference;
                }
            });
            reverseFunctions.prereqUpgrades = [];
            if (prereqs.upgrades.length > 0) {
                prereqs.upgrades.forEach(function (id) {
                    const upgrade = Game.UpgradesById[id];
                    if (!upgrade.bought) {
                        reverseFunctions.prereqUpgrades.push({
                            id: id,
                            reverseFunctions: upgradeToggle(upgrade),
                        });
                    }
                });
            }
        }
    }
    upgrade.bought = 1;
    Game.UpgradesOwned += 1;
    reverseFunctions.current = buyFunctionToggle(upgrade);
    return reverseFunctions;
}
function upgradeToggleReverse(upgrade, reverseFunctions) {
    if (reverseFunctions.prereqBuildings) {
        reverseFunctions.prereqBuildings.forEach(function (b) {
            const building = Game.ObjectsById[b.id];
            building.amount -= b.amount;
            building.bought -= b.amount;
            Game.BuildingsOwned -= b.amount;
        });
    }
    if (reverseFunctions.prereqUpgrades) {
        reverseFunctions.prereqUpgrades.forEach(function (u) {
            const upgrade = Game.UpgradesById[u.id];
            upgradeToggleReverse(upgrade, u.reverseFunctions);
        });
    }
    upgrade.bought = 0;
    Game.UpgradesOwned -= 1;
    buyFunctionToggle(reverseFunctions.current);
}

function buildingToggle(building, achievements) {
    if (!achievements) {
        building.amount += 1;
        building.bought += 1;
        Game.BuildingsOwned += 1;
    } else {
        building.amount -= 1;
        building.bought -= 1;
        Game.BuildingsOwned -= 1;
        Game.AchievementsOwned = 0;
        achievements.forEach(function (won, index) {
            const achievement = Game.AchievementsById[index];
            achievement.won = won;
            if (won && achievement.pool != "shadow") {
                Game.AchievementsOwned += 1;
            }
        });
    }
}

function buyFunctionToggle(upgrade) {
    if (!upgrade) {
        return null;
    }
    if (upgrade.id == 452) {
        return null;
    }
    if (!upgrade.length) {
        if (!upgrade.buyFunction) {
            return null;
        }

        const IGNORE_FUNCTIONS = [
            /Game\.Earn\('.*\)/,
            /Game\.Lock\('.*'\)/,
            /Game\.Unlock\(.*\)/,
            /Game\.Objects\['.*'\]\.drawFunction\(\)/,
            /Game\.Objects\['.*'\]\.redraw\(\)/,
            /Game\.SetResearch\('.*'\)/,
            /Game\.Upgrades\['.*'\]\.basePrice=.*/,
            "Game.CollectWrinklers()",
            "Game.RefreshBuildings()",
            "Game.storeToRefresh=1",
            "Game.upgradesToRebuild=1",
            /Game\.Popup\(.*\)/,
            /Game\.Notify\(.*\)/,
            /var\s+.+\s*=.+/,
            "Game.computeSeasonPrices()",
            "Game.seasonPopup.reset()",
            /\S/,
        ];
        const buyFunctions = upgrade.buyFunction
            .toString()
            .replace(/[\n\r\s]+/g, " ")
            .replace(/function\s*\(\)\s*{(.+)\s*}/, "$1")
            .replace(/for\s*\(.+\)\s*\{.+\}/, "")
            .replace(
                /if\s*\(this\.season\)\s*Game\.season=this\.season\;/,
                'Game.season="' + upgrade.season + '";'
            )
            .replace(/if\s*\(.+\)\s*[^{}]*?\;/, "")
            .replace(/if\s*\(.+\)\s*\{.+\}/, "")
            .replace(/else\s+\(.+\)\s*\;/, "")
            .replace("++", "+=1")
            .replace("--", "-=1")
            .split(";")
            .map(function (a) {
                return a.trim();
            })
            .filter(function (a) {
                for (const ignoreFunction of IGNORE_FUNCTIONS) {
                    if (a === "") {
                        break;
                    }
                    a = a.replace(ignoreFunction, "");
                }
                return a != "";
            });

        if (buyFunctions.length == 0) {
            return null;
        }

        const reversedFunctions = buyFunctions.map(function (a) {
            const achievementMatch = /Game\.Win\('(.*)'\)/.exec(a);
            if (a.indexOf("+=") > -1) {
                return a.replace("+=", "-=");
            }
            if (a.indexOf("-=") > -1) {
                return a.replace("-=", "+=");
            }
            if (
                achievementMatch &&
                Game.Achievements[achievementMatch[1]].won == 0
            ) {
                return "Game.Achievements['" + achievementMatch[1] + "'].won=0";
            }
            if (a.indexOf("=") < 0) {
                return "";
            }
            const expression = a.split("=");
            const expressionResult = eval(expression[0]);
            const isString = _.isString(expressionResult);
            return (
                expression[0] +
                "=" +
                (isString ? "'" : "") +
                expressionResult +
                (isString ? "'" : "")
            );
        });
        buyFunctions.forEach(function (f) {
            eval(f);
        });
        return reversedFunctions;
    }
    if (upgrade.length) {
        upgrade.forEach(function (f) {
            eval(f);
        });
    }
    return null;
}

function buySanta() {
    Game.specialTab = "santa";
    Game.UpgradeSanta();
    if (Game.santaLevel + 1 >= Game.santaLevels.length) {
        Game.ToggleSpecialMenu();
    }
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
