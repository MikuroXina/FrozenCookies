import { Beautify } from "./fc_beautify.js";
import { getNumber, set } from "./fc_store.js";

export const PREFERENCES = Object.freeze({
    // clicking options
    clickingOptions: {
        hint: "Auto clicking options:",
    },
    autoClick: {
        hint: "Click the large cookie",
        display: ["Autoclick OFF", "Autoclick ON"],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "cookieClickSpeed";
            aElem.addEventListener('click', updateSpeed);
            aElem.innerText = "{} clicks";
            return aElem;
        },
    },
    autoFrenzy: {
        hint: "Click the large cookie during Clicking Frenzies",
        display: ["Autofrenzy OFF", "Autofrenzy ON"],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "frenzyClickSpeed";
            aElem.addEventListener('click', updateSpeed);
            aElem.innerText = "{} clicks/sec";
            return aElem;
        },
    },
    autoGC: {
        hint: "Automatically click Golden Cookies when they appear",
        display: ["Autoclick GC OFF", "Autoclick GC ON"],
        default: 0,
    },
    autoReindeer: {
        hint: "Automatically click reindeer",
        display: ["Autoclick Reindeer OFF", "Autoclick Reindeer ON"],
        default: 0,
    },
    autoFortune: {
        hint: "Automatically click the news ticker when Fortune News appears",
        display: ["Auto Fortune OFF", "Auto Fortune ON"],
        default: 0,
    },

    // autobuy options
    buyingOptions: {
        hint: "Auto buying options:",
    },
    autoBuy: {
        hint: "Automatically buy the most efficient building when you've met its cost",
        display: ["AutoBuy OFF", "AutoBuy ON"],
        default: 0,
    },
    otherUpgrades: {
        hint: "Automatically buy upgrades that don't provide a direct CpS boost. This includes eggs and idle upgrades",
        display: ["Other Upgrades OFF", "Other Upgrades ON"],
        default: 1,
    },
    autoBlacklistOff: {
        hint: "Automatically turn off a blacklist once the goal for that blacklist is achieved",
        display: ["Auto Blacklist OFF", "Auto Blacklist ON"],
        default: 0,
    },
    blacklist: {
        hint: "Blacklist purchases from the efficiency calculations",
        display: [
            "Blacklist OFF",
            "Blacklist Mode SPEEDRUN",
            "Blacklist Mode HARDCORE",
            "Blacklist Mode GRANDMAPOCALYPSE",
            "Blacklist Mode NO BUILDINGS",
        ],
        default: 0,
    },
    mineLimit: {
        hint: "Limit max number of mines to keep Godzamok useful",
        display: ["Mine Limit OFF", "Mine Limit ON"],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "mineMax";
            aElem.addEventListener('click', updateMineMax);
            aElem.innerText = "{} clicks/sec";
            return aElem;
        },
    },
    factoryLimit: {
        hint: "Limit max number of factories to keep Godzamok useful",
        display: ["Factory Limit OFF", "Factory Limit ON"],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "factoryMax";
            aElem.addEventListener('click', updateFactoryMax);
            aElem.innerText = "{} Factories";
            return aElem;
        },
    },
    pastemode: {
        hint: "Always autobuy the least efficient purchase. This is a stupid idea, you should never turn this on",
        display: ["Pastemode OFF", "Pastemode ON"],
        default: 0,
    },

    // other auto options
    autoOtherOptions: {
        hint: "Other automatic actions:",
    },
    autoBulk: {
        hint: "Automatically set buildings to be bought in bulk after reincarnation",
        display: ["Auto Bulkbuy OFF", "Auto Bulkbuy x10", "Auto Bulkbuy x100"],
        default: 0,
    },
    autoBuyAll: {
        hint: "Automatically hit the 'buy all upgrades button' until a heavenly chip is earned",
        display: ["Auto Buy All Upgrades OFF", "Auto Buy All Upgrades ON"],
        default: 0,
    },
    autoAscend: {
        hint: "Automatically ascend when your heavenly chip count hits a certain number. Note: this will skip the upgrade screen",
        display: ["Autoascend OFF", "Autoascend ON"],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "chipsToAscend";
            aElem.addEventListener('click', updateAscendAmount);
            aElem.innerText = "{} heavenly chips";
            return aElem;
        },
    },
    autoWrinkler: {
        hint: "Automatically pop wrinklers efficiently (calculated timing to balance cookies vs. upgrades) or instantly",
        display: [
            "Autopop Wrinklers OFF",
            "Autopop Wrinklers EFFICIENTLY",
            "Autopop Wrinklers INSTANTLY",
        ],
        default: 0,
    },
    shinyPop: {
        hint: "Protect the endangered Shiny Wrinkler from being automatically popped. Note: this disables buying the Elder Pledge",
        display: ["Save Shiny Wrinklers OFF", "Save Shiny Wrinklers ON"],
        default: 0,
    },
    autoSL: {
        hint: "Automatically harvest sugar lumps when ripe, with option to automatically swap in Rigidel",
        display: [
            "Autoharvest SL OFF",
            "Autoharvest SL ON",
            "Autoharvest SL ON + AUTO RIGIDEL",
        ],
        default: 0,
    },
    dragonsCurve: {
        hint: "Automatically swap in Dragon's Curve aura when sugar lumps are harvested, with option to also apply Reality Bending",
        display: [
            "Auto-Dragon's Curve OFF",
            "Auto-Dragon's Curve ON",
            "Auto-Dragon's Curve ON + REALITY BENDING",
        ],
        default: 0,
    },
    sugarBakingGuard: {
        hint: "Ignore options that spend a sugar lump until you have 101 stored, to keep max Sugar Baking boost",
        display: ["Sugar Baking Guard OFF", "Sugar Baking Guard ON"],
        default: 0,
    },
    autoGS: {
        hint: "Automatically turn on the Golden Switch during Dragonflight and Click Frenzy (and turn back off at the end)",
        display: ["Auto-Golden Switch OFF", "Auto-Golden Switch ON"],
        default: 0,
    },
    autoGodzamok: {
        hint: "Automatically sell mines and factories during Dragonflight and Click Frenzy if you worship Godzamok",
        display: ["Auto-Godzamok OFF", "Auto-Godzamok ON"],
        default: 0,
    },
    autoBank: {
        hint: "Automatically upgrade the bank office level to unlock loans and more storage",
        display: ["Auto-Banking OFF", "Auto-Banking ON"],
        default: 0,
    },
    autoBroker: {
        hint: "Automatically hire stock brokers",
        display: ["Auto-Broker OFF", "Auto-Broker ON"],
        default: 0,
    },
    autoLoan: {
        hint: "Automatically take loans during click buffs with frenzies",
        display: ["Auto-Loans OFF", "Take loans 1 and 2", "Take all 3 loans"],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "minLoanMult";
            aElem.addEventListener('click', updateLoanMultMin);
            aElem.innerText = "{} minimum Frenzy";
            return aElem;
        },
    },

    // Pantheon options
    worshipOptions: {
        hint: "Pantheon options:",
    },
    autoWorshipToggle: {
        hint: "Automatically slot selected gods (Cannot slot the same god in multiple slots)",
        display: ["Auto Pantheon OFF", "Auto Pantheon ON"],
        default: 0,
    },
    autoWorship0: {
        hint: "Automatically slots desired god in DIAMOND slot",
        display: [
            "Holobore",
            "Vomitrax",
            "Godzamok",
            "Cyclius",
            "Selebrak",
            "Dotjeiess",
            "Muridal",
            "Jeremy",
            "Mokalsium",
            "Skruuia",
            "Rigidel",
            "No god",
        ],
        default: 11,
    },
    autoWorship1: {
        hint: "Automatically slots desired god in RUBY slot",
        display: [
            "Holobore",
            "Vomitrax",
            "Godzamok",
            "Cyclius",
            "Selebrak",
            "Dotjeiess",
            "Muridal",
            "Jeremy",
            "Mokalsium",
            "Skruuia",
            "Rigidel",
            "No god",
        ],
        default: 11,
    },
    autoWorship2: {
        hint: "Automatically slots desired god in JADE slot",
        display: [
            "Holobore",
            "Vomitrax",
            "Godzamok",
            "Cyclius",
            "Selebrak",
            "Dotjeiess",
            "Muridal",
            "Jeremy",
            "Mokalsium",
            "Skruuia",
            "Rigidel",
            "No God",
        ],
        default: 11,
    },
    autoCyclius: {
        hint: "Continually swap Cyclius throughout the day for max CpS bonus. Works best if all gods for the auto-Pantheon are set, with Cyclius not set to any slot. If Supreme Intellect is active, only two slots are used",
        display: [
            "Auto-Cyclius OFF",
            "Auto-Cyclius in RUBY and JADE",
            "Auto-Cyclius in all slots",
        ],
        default: 0,
    },

    // Spell options
    spellOptions: {
        hint: "Grimoire options:",
    },
    towerLimit: {
        hint: "Stop autobuying Wizard Towers at selected Max Mana. 37 for optimal single casting FTHOF. Not recommended to set over 100",
        display: ["Wizard Tower Cap OFF", "Wizard Tower Cap ON"],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "manaMax";
            aElem.addEventListener('click', updateManaMax);
            aElem.innerText = "{} max Mana";
            return aElem;
        },
    },
    autoSpell: {
        hint: "Automatically cast selected spell when your mana is full",
        display: [
            "Auto Cast OFF",
            "Auto Cast CONJURE BAKED GOODS",
            "Auto Cast FORCE THE HAND OF FATE",
            "Auto Cast SPONTANEOUS EDIFICE",
            "Auto Cast HAGGLER'S CHARM (cheapest)",
            "Auto Cast FTHOF (Click and Building Specials only)",
        ],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "minCpSMult";
            aElem.addEventListener('click', updateCpSMultMin);
            aElem.innerText = "{} minimum Frenzy";
            return aElem;
        },
    },
    spellNotes: {
        hint: "(Only one combo is active at the same time, with the last one winning. See the readme for more info)",
    },
    autoFTHOFCombo: {
        hint: "Perform FTHOF double cast combos - needs enough mana! Replaces Auto Cast",
        display: ["Double Cast FTHOF OFF", "Double Cast FTHOF ON"],
        default: 0,
    },
    auto100ConsistencyCombo: {
        hint: "EXPERIMENTAL: Does the 100% Consistency Combo. Replaces Auto Cast and FTHOF Double Casting",
        display: [
            "Auto Cast 100% Consistency Combo OFF",
            "Auto Cast 100% Consistency Combo ON",
        ],
        default: 0,
    },
    autoSugarFrenzy: {
        hint: "Buy Sugar Frenzy during the first 100% Consistency and/or Double Cast combo",
        display: [
            "Auto Sugar Frenzy OFF",
            "ASF for 100% Consistency Combo",
            "ASF also for Double Cast Combo",
        ],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "minASFMult";
            aElem.addEventListener('click', updateASFMultMin);
            aElem.innerText = "{} minimum Frenzy";
            return aElem;
        },
    },
    autoSweet: {
        hint: "EXPERIMENTAL: Automatically ascend until 'Sweet' is in the next ten spells. Disables other combos. No manual shutdown!",
        display: ["Auto Sweet OFF", "Auto Sweet ON"],
        default: 0,
    },

    //Dragon options
    dragonOptions: {
        hint: "Dragon options:",
    },
    autoDragon: {
        hint: "Automatically upgrade the dragon",
        display: ["Dragon Upgrading OFF", "Dragon Upgrading ON"],
        default: 0,
    },
    petDragon: {
        hint: "Automatically pet the dragon",
        display: ["Dragon Petting OFF", "Dragon Petting ON"],
        default: 0,
    },
    autoDragonToggle: {
        hint: "Automatically set dragon aura(s)",
        display: ["Dragon Auras OFF", "Dragon Auras ON"],
        default: 0,
    },
    dragonNotes: {
        hint: "(Select your desired aura from the list. Cannot set the same aura to both slots)",
    },
    autoDragonAura0: {
        hint: "Automatically set FIRST dragon aura",
        display: [
            "No Aura",
            "Breath of Milk",
            "Dragon Cursor",
            "Elder Battalion",
            "Reaper of Fields",
            "Earth Shatterer",
            "Master of the Armory",
            "Fierce Hoarder",
            "Dragon God",
            "Arcane Aura",
            "Dragonflight",
            "Ancestral Metamorphosis",
            "Unholy Dominion",
            "Epoch Manipulator",
            "Mind Over Matter",
            "Radiant Appetite",
            "Dragon's Fortune",
            "Dragon's Curve",
            "Reality Bending",
            "Dragon Orbs",
            "Supreme Intellect",
        ],
        default: 0,
    },
    autoDragonAura1: {
        hint: "Automatically set SECOND dragon aura",
        display: [
            "No Aura",
            "Breath of Milk",
            "Dragon Cursor",
            "Elder Battalion",
            "Reaper of Fields",
            "Earth Shatterer",
            "Master of the Armory",
            "Fierce Hoarder",
            "Dragon God",
            "Arcane Aura",
            "Dragonflight",
            "Ancestral Metamorphosis",
            "Unholy Dominion",
            "Epoch Manipulator",
            "Mind Over Matter",
            "Radiant Appetite",
            "Dragon's Fortune",
            "Dragon's Curve",
            "Reality Bending",
            "Dragon Orbs",
            "Supreme Intellect",
        ],
        default: 0,
    },
    autoDragonOrbs: {
        hint: "Automatically sell Cortex bakers to summon a Golden Cookie, if Dragon Orbs is an aura and Godzamok is not slotted",
        display: ["Auto-Dragon Orbs OFF", "Auto-Dragon Orbs ON"],
        default: 0,
    },
    cortexLimit: {
        hint: "Limit max number of Cortex bakers to keep Dragon Orbs useful",
        display: ["Cortex bakers Limit OFF", "Cortex bakers Limit ON"],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "cortexMax";
            aElem.addEventListener('click', updateCortexMax);
            aElem.innerText = "{} Cortex bakers";
            return aElem;
        },
    },

    // Season options
    seasonOptions: {
        hint: "Season options:",
    },
    defaultSeason: {
        hint: "Autobuy a selected season when no others have needed upgrades. Turn off autobuy while selecting to prevent buy spam",
        display: [
            "Default Season OFF",
            "Default Season BUSINESS DAY",
            "Default Season CHRISTMAS",
            "Default Season EASTER",
            "Default Season HALLOWEEN",
            "Default Season VALENTINE'S DAY",
        ],
        default: 0,
    },
    freeSeason: {
        hint: "Stay in the current base (free) season as long as no others have upgrades. Overrides the Default Season option",
        display: [
            "Free Season OFF",
            "Free Season for CHRISTMAS and BUSINESS DAY",
            "Free Season for ALL",
        ],
        default: 1,
    },
    autoEaster: {
        hint: "Switch to Easter season if Cookie Storm is active and you do not have all eggs yet",
        display: ["Auto-Easter Switch OFF", "Auto-Easter Switch ON"],
        default: 0,
    },
    autoHalloween: {
        hint: "Switch to Halloween season if you have wrinklers and you do not have all spooky biscuits yet",
        display: ["Auto-Halloween Switch OFF", "Auto-Halloween Switch ON"],
        default: 0,
    },

    //Bank options
    bankOptions: {
        hint: "Bank options: (Setting a bank delays autobuy until the bank is complete)",
    },
    holdSEBank: {
        hint: "Maintain a bank for Spontaneous Edifice (already enabled if Auto Casting SE)",
        display: ["SE Bank OFF", "SE Bank ON"],
        default: 0,
    },
    setHarvestBankPlant: {
        hint: "Maintain a bank for a specific plant you are going to harvest/let explode",
        display: [
            "Harvesting Bank OFF",
            "Harvesting Bank BAKEBERRY",
            "Harvesting Bank CHOCOROOT",
            "Harvesting Bank WHITE CHOCOROOT",
            "Harvesting Bank QUEENBEET",
            "Harvesting Bank DUKETATER",
            "Harvesting Bank CRUMBSPORE",
            "Harvesting Bank DOUGHSHROOM",
        ],
        default: 0,
    },
    setHarvestBankType: {
        hint: "Increase the harvesting bank for the above plant, based on whether a CpS multiplier is in effect during harvest",
        display: [
            "Harvesting during NO CpS MULTIPLIER",
            "Harvesting during FRENZY",
            "Harvesting during BUILDING SPECIAL",
            "Harvesting during FRENZY + BUILDING SPECIAL",
        ],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "maxSpecials";
            aElem.addEventListener('click', updateMaxSpecials);
            aElem.innerText = "{} Building specials";
            return aElem;
        },
    },

    // Other options
    otherOptions: {
        hint: "Other options:",
    },
    FCshortcuts: {
        hint: "Use a variety of helpful keyboard shortcuts. See the readme for info",
        display: ["Shortcuts OFF", "Shortcuts ON"],
        default: 1,
    },
    simulatedGCPercent: {
        hint: 'Assume a percentage of Golden Cookies as "clicked" for GC efficiency calculations (100% recommended)',
        display: ["GC clicked 0%", "GC clicked 100%"],
        default: 1,
    },

    //Display options
    displayOptions: {
        hint: "Display options:",
    },
    showMissedCookies: {
        hint: "Display the number of missed Golden Cookie clicks under Golden Cookie Information",
        display: ["Show Missed GCs OFF", "Show Missed GCs ON"],
        default: 0,
    },
    numberDisplay: {
        hint: "Change how numbers are shortened",
        display: [
            "Number Display RAW",
            "Number Display FULL (million, billion)",
            "Number Display INITIALS (M, B)",
            "Number Display SI UNITS (M, G, T)",
            "Number Display SCIENTIFIC (6.3e12)",
        ],
        default: 1,
    },
    fancyui: {
        hint: "Infobox type (can be slow)",
        display: [
            "Infobox OFF",
            "Infobox TEXT ONLY",
            "Infobox WHEEL ONLY",
            "Infobox WHEEL & TEXT",
        ],
        default: 0,
    },
    logging: {
        hint: "Display detailed logs in the javascript console",
        display: ["Logging OFF", "Logging ON"],
        default: 1,
    },
    purchaseLog: {
        hint: "Log all automatic purchases as well",
        display: ["Purchase Log OFF", "Purchase Log ON"],
        default: 0,
    },

    slowOptions: {
        hint: "(The following options can drastically slow down the game. Do not touch unless you know what you're doing)",
    },
    fpsModifier: {
        hint: "Run the game at the selected frame rate (browser default is 30). 60 is twice as fast, 15 is half as fast, etc.",
        display: [
            "Frame Rate 15 fps",
            "Frame Rate 24 fps",
            "Frame Rate 30 fps",
            "Frame Rate 48 fps",
            "Frame Rate 60 fps",
            "Frame Rate 72 fps",
            "Frame Rate 88 fps",
            "Frame Rate 100 fps",
            "Frame Rate 120 fps",
            "Frame Rate 144 fps",
            "Frame Rate 200 fps",
            "Frame Rate 240 fps",
            "Frame Rate 300 fps",
            "Frame Rate 5 fps",
            "Frame Rate 10 fps",
        ],
        default: 2,
    },
    trackStats: {
        hint: "Track your CpS / HC earned over time during a single session to enable graphing",
        display: [
            "Tracking OFF",
            "Tracking EVERY 60s",
            "Tracking EVERY 30m",
            "Tracking EVERY 1h",
            "Tracking EVERY 24h",
            "Tracking ON UPGRADES",
            "Tracking SMART TIMING",
        ],
        default: 0,
        extras: () => {
            const aElem = document.createElement('a');
            aElem.class = "option";
            aElem.id = "viewStats";
            aElem.addEventListener('click', viewStatGraphs);
            aElem.innerText = "View Stat Graphs";
            return aElem;
        },
    },
    recommendedSettings: {
        hint: "Enable all recommended settings. WARNING: the game will save and reload, possibly unloading Frozen Cookies. This will override any current setting!",
        display: ["Recommended OFF", "Recommended ON"],
        default: 0,
    },
});

/**
 * Shows the input prompt and applies the inputted value to the store.
 *
 * @param {string} title - Title of prompt.
 * @param {string} description - Description of input.
 * @param {Object} options - Options for validation.
 * @param {string} options.base - Key for the store.
 * @param {number | undefined} options.min - Allowed minimum value of input.
 * @param {number | undefined} options.max - Allowed maximum value of input.
 */
function userInputPrompt(title, description, { base, min, max }) {
    Game.Prompt(
        `<h3>${title}</h3><div class="block" style="text-align:center;">${description}</div><div class="block"><input type="text" style="text-align:center;width:100%;" id="fcGenericInput" value="${getNumber(base)}"/></div>`,
        ["Confirm", "Cancel"]
    );
    $("#promptOption0").click(() => {
        const result = l("fcGenericInput").value;

        if (validateNumber(result, min, max)) {
            set(base, Number(result));
        }
        loadFeatures();
    });
    l("fcGenericInput").focus();
    l("fcGenericInput").select();
}

function validateNumber(value, minValue = null, maxValue = null) {
    if (typeof value == "undefined" || value == null) {
        return false;
    }
    const numericValue = Number(value);
    return (
        !isNaN(numericValue) &&
        (minValue == null || numericValue >= minValue) &&
        (maxValue == null || numericValue <= maxValue)
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateSpeed(e) {
    const base = e.target.id;
    userInputPrompt(
        "Autoclicking!",
        "How many times per second do you want to click? (250 recommended, 1000 max)",
        { base, min: 0, max: 1000 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateCpSMultMin(e) {
    const base = e.target.id;
    userInputPrompt(
        "Autocasting!",
        'What CpS multiplier should trigger Auto Casting? (e.g. "7" will trigger during a Frenzy, "1" prevents triggering during a clot, etc.)',
        { base, min: 0 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateAscendAmount(e) {
    const base = e.target.id;
    userInputPrompt(
        "Autoascending!",
        "How many heavenly chips do you want to auto-ascend at?",
        { base, min: 1 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateManaMax(e) {
    const base = e.target.id;
    userInputPrompt(
        "Mana Cap!",
        "Choose a maximum mana amount (100 max recommended)",
        { base, min: 0 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateMaxSpecials(e) {
    const base = e.target.id;
    userInputPrompt(
        "Harvest Bank!",
        "Set amount of stacked Building specials for Harvest Bank",
        { base, min: 0 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateMineMax(e) {
    const base = e.target.id;
    userInputPrompt(
        "Mine Cap!",
        "How many Mines should autoBuy stop at?",
        { base, min: 0 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateFactoryMax(e) {
    const base = e.target.id;
    userInputPrompt(
        "Factory Cap!",
        "How many Factories should autoBuy stop at?",
        { base, min: 0 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateCortexMax(e) {
    const base = e.target.id;
    userInputPrompt(
        "Cortex baker Cap!",
        "How many Cortex bakers should autoBuy stop at?",
        { base, min: 0 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateLoanMultMin(e) {
    const base = e.target.id;
    userInputPrompt(
        "Loans!",
        'What CpS multiplier should trigger taking loans (e.g. "7" will trigger for a normal Frenzy, "500" will require a huge building buff combo, etc.)?',
        { base, min: 0 },
    );
}

/**
 * @param {MouseEvent} e - Event on click.
 */
function updateASFMultMin(e) {
    const base = e.target.id;
    userInputPrompt(
        "Sugar Frenzy!",
        'What CpS multiplier should trigger buying the sugar frenzy (e.g. "100" will trigger for a decent early combo, "1000" will require a huge building buff combo, etc.)?',
        { base, min: 0 },
    );
}

let lastGraphDraw = 0;
const trackedStats = [];

export function pushStats(...entry) {
    trackedStats.push(...entry);
}

export function viewStatGraphs() {
    saveStats(true);
    const containerDiv = $("#statGraphContainer").length
        ? $("#statGraphContainer")
        : $("<div>")
              .attr("id", "statGraphContainer")
              .html($("<div>").attr("id", "statGraphs"))
              .appendTo("body")
              .dialog({
                  modal: true,
                  title: "Frozen Cookies Tracked Stats",
                  width: $(window).width() * 0.8,
                  height: $(window).height() * 0.8,
              });
    if (containerDiv.is(":hidden")) {
        containerDiv.dialog();
    }
    if (
        trackedStats.length > 0 &&
        Date.now() - lastGraphDraw > 1000
    ) {
        lastGraphDraw = Date.now();
        $("#statGraphs").empty();
        $.jqplot(
            "statGraphs",
            transpose(
                trackedStats.map(({ time, baseCps, effectiveCps, hc }) =>
                    [
                        [time / 1000, baseCps],
                        [time / 1000, effectiveCps],
                        [time / 1000, hc],
                    ]
                )
            ), //
            {
                legend: {
                    show: true,
                },
                height: containerDiv.height() - 50,
                axes: {
                    xaxis: {
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                        tickOptions: {
                            angle: -30,
                            fontSize: "10pt",
                            showGridline: false,
                            formatter(_ah, ai) {
                                return timeDisplay(ai);
                            },
                        },
                    },
                    yaxis: {
                        padMin: 0,
                        renderer: $.jqplot.LogAxisRenderer,
                        tickDistribution: "even",
                        tickOptions: {
                            formatter(_ah, ai) {
                                return Beautify(ai);
                            },
                        },
                    },
                    y2axis: {
                        padMin: 0,
                        tickOptions: {
                            showGridline: false,
                            formatter(_ah, ai) {
                                return Beautify(ai);
                            },
                        },
                    },
                },
                highlighter: {
                    show: true,
                    sizeAdjust: 15,
                },
                series: [
                    {
                        label: "Base CPS",
                    },
                    {
                        label: "Effective CPS",
                    },
                    {
                        label: "Earned HC",
                        yaxis: "y2axis",
                    },
                ],
            }
        );
    }
}

function transpose(matrix) {
    return Object.keys(matrix[0]).map((column) =>
        matrix.map((row) => row[column])
    );
}
