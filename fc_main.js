import { BLACKLIST } from "./cc_upgrade_prerequisites.js";
import { Beautify } from "./fc_beautify.js";
import { FCMenu } from "./fc_button.js";
import { bestBank } from "./fc_best_bank.js";
import { timeDisplay } from "./fc_format.js";
import { updateTimers } from "./fc_infobox.js";
import { getNumber, getString, loadFromStorage, set, toggle } from "./fc_store.js";
import { loadFromJson, saveAsJson } from "./fc_frenzy_times.js";
import { nextPurchase, recommendationList } from "./fc_next_purchase.js";
import { META } from "./fc_meta.js";
import { PREFERENCES } from "./fc_preferences.js";

export function registerMod(mod_id = "frozen_cookies", Game) {
    // register with the modding API
    Game.registerMod(mod_id, {
        init() {
            Game.registerHook("reincarnate", () => {
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
            Game.registerHook("ticker", () => {
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
            Game.registerHook("reset", (hard) => {
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
    setOverrides(Game);
    logEvent(
        "Load",
        "Initial Load of Frozen Cookies v " +
            META.branch +
            "." +
            META.version +
            ". (You should only ever see this once.)"
    );
}

const GARDEN_GAME = Game.Objects["Farm"].minigame;
const BANK_GAME = Game.Objects["Bank"].minigame;
const TEMPLE_GAME = Game.Objects["Temple"].minigame;
const TOWER_GAME = Game.Objects["Wizard tower"].minigame;

/**
 * Loads settings and initializes variables
 *
 * @param {any} Game
 */
function setOverrides(Game) {
    loadFCData();
    set("frequency", 100);

    // Force redraw every 10 purchases
    set("autobuyCount", 0);

    // Set default values for calculations
    set("heavenlyChipsGain", 0);
    set("lastGoldenCookieState",
        (Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1) * clickBuffBonus()
    );
    set("lastGoldenCookieTime", Date.now());
    set("lastCps", Game.cookiesPs);
    set("lastBaseCps", Game.cookiesPs);
    set("lastCookieCPS", 0);
    set("lastUpgradeCount", 0);
    set("currentBank.cost", 0);
    set("currentBank.efficiency", 0);
    set("targetBank.cost", 0);
    set("targetBank.efficiency", 0);
    set("enabledPopups", 0);

    // Smart tracking details
    set("delayPurchaseCount", 0);

    // Caching
    emptyCaches();

    // Whether to currently display achievement popups
    set("showAchievements", 1);

    if (!BLACKLIST[getNumber("blacklist")]) {
        set("blacklist", 0);
    }

    // Set `App`, on older version of CC it's not set to anything, so default it to `undefined`
    if (!window.App) {
        window.App = undefined;
    }

    Game.sayTime = (time) => {
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

    logEvent("Load", "Restored Frozen Cookies settings from previous save");
}

function emptyCaches() {
    set("recalculateCaches", 1);
    FrozenCookies.caches = {};
    FrozenCookies.caches.nextPurchase = {};
    FrozenCookies.caches.recommendationList = [];
    FrozenCookies.caches.buildings = [];
    FrozenCookies.caches.upgrades = [];
}

// Runs numbers in upgrades and achievements through our beautify function
function beautifyUpgradesAndAchievements() {
    function beautifyFn(str) {
        return Beautify(parseInt(str.replace(/,/, ""), 10));
    }

    const numre = /\d\d?\d?(?:,\d\d\d)*/;
    Object.values(Game.AchievementsById).forEach((ach) => {
        ach.desc = ach.desc.replace(numre, beautifyFn);
    });

    // These might not have any numbers in them, but just in case...
    Object.values(Game.UpgradesById).forEach((upg) => {
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
        for (const building of Game.ObjectsById) {
            building.sell(-1);
        }
        Game.Upgrades["Chocolate egg"].buy();
    } else if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
        for (const building of Game.ObjectsById) {
            building.sell(-1);
        }
        Game.Upgrades["Chocolate egg"].buy();
    }
    Game.oldReset();
    set(
        "lastGoldenCookieState",
        (Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1) * clickBuffBonus(),
    );
    set("lastGoldenCookieTime", Date.now());
    set("lastHCAmount", Game.HowMuchPrestige(
        Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
    ));
    set("lastHCTime", Date.now());
    set("maxHCPercent", 0);
    set("prevLastHCTime", Date.now());
    set("lastCps", 0);
    set("lastBaseCps", 0);
    recommendationList(true);
}

function saveFCData() {
    const saveString = {};
    for (const preference of Object.keys(PREFERENCES)) {
        saveString[preference] = FrozenCookies[preference];
    }
    saveString.frenzyClickSpeed = getString("frenzyClickSpeed");
    saveString.cookieClickSpeed = getString("cookieClickSpeed");
    saveString.HCAscendAmount = getString("HCAscendAmount");
    saveString.mineMax = getString("mineMax");
    saveString.factoryMax = getString("factoryMax");
    saveString.minCpSMult = getString("minCpSMult");
    saveString.minLoanMult = getString("minLoanMult");
    saveString.minASFMult = getString("minASFMult");
    saveString.frenzyTimes = saveAsJson();
    //  saveString.nonFrenzyTime = FrozenCookies.non_gc_time;
    //  saveString.frenzyTime = FrozenCookies.gc_time;
    saveString.lastHCAmount = getString("lastHCAmount");
    saveString.maxHCPercent = getString("maxHCPercent");
    saveString.lastHCTime = getString("lastHCTime");
    saveString.manaMax = getString("manaMax");
    saveString.maxSpecials = getString("maxSpecials");
    saveString.cortexMax = getString("cortexMax");
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
    return Game.ObjectsById.map((building) => building.amount).join("/");
}

// todo: add bind for autoascend
// Press 'a' to toggle autoBuy.
// Press 'b' to pop up a copyable window with building spread.
// Press 'c' to toggle auto-GC
// Press 'e' to pop up a copyable window with your export string
// Press 'r' to pop up the reset window
// Press 's' to do a manual save
// Press 'w' to display a wrinkler-info window
document.addEventListener("keydown", (event) => {
    if (Game.promptOn || !FrozenCookies.FCshortcuts) {
        return;
    }
    switch (event.key) {
        case "a":
            Game.Toggle("autoBuy", "autobuyButton", "Autobuy OFF", "Autobuy ON");
            toggle("autoBuy");
            break;
        case "b":
            copyToClipboard(getBuildingSpread());
            break;
        case "c":
            Game.Toggle("autoGC", "autogcButton", "Autoclick GC OFF", "Autoclick GC ON");
            toggle("autoGC");
            break;
        case "e":
            copyToClipboard(Game.WriteSave(true));
            break;
        case "r":
            Game.Reset();
            break;
        case "s":
            Game.WriteSave();
            break;
        case "w":
            Game.Notify(
                "Wrinkler Info",
                "Popping all wrinklers will give you " +
                    Beautify(wrinklerValue()) +
                    ' cookies. <input type="button" value="Click here to pop all wrinklers" onclick="Game.CollectWrinklers()"></input>',
                [19, 8],
                7,
            );
            break;
    }
});

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

function wrinklerValue() {
    return Game.wrinklers.reduce(
        (sum, wrinkler) => sum + popValue(wrinkler),
        0,
    );
}

function nextChainedPurchase(recalculate) {
    nextPurchase(recalculate);
    return FrozenCookies.caches.nextChainedPurchase;
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
                if (!!getNumber("enabledPopups")) {
                    logEvent(
                        "Achievement",
                        "Achievement unlocked :<br>" +
                            Game.Achievements[what].name +
                            "<br> ",
                        true
                    );
                }
                if (!!getNumber("showAchievements")) {
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
