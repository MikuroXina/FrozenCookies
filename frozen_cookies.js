// Global Variables
const lastCompatibleVersion = 2.048;
if (Game.version > lastCompatibleVersion) {
    console.log(
        "WARNING: The Cookie Clicker version is newer than this version of Frozen Cookies."
    );
    console.log(
        "This version of Frozen Cookies has only been tested through Cookie Clicker version " +
            lastCompatibleVersion
    );
    console.log(
        "There may be incompatibilities, undesirable effects, bugs, shifts in reality, immoral behavior, and who knows what else."
    );
}

const scriptElement =
    document.getElementById("frozenCookieScript") ?? document.getElementById("modscript_frozen_cookies");
const baseUrl =
    scriptElement?.getAttribute("src").replace(/\/frozen_cookies\.js$/, "") ??
    "https://mikuroxina.github.io/FrozenCookies/";
const FrozenCookies = {
    baseUrl: baseUrl,
    branch: "Main-",
    version: "2.0.0",
};

// Load external libraries
const SCRIPTS = [
    "https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js",
    "https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css",
    "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jcanvas/20.1.1/min/jcanvas.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/jquery.jqplot.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/jquery.jqplot.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.canvasTextRenderer.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.canvasAxisLabelRenderer.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.canvasAxisTickRenderer.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.trendline.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.highlighter.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.logAxisRenderer.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqPlot/1.0.9/plugins/jqplot.cursor.min.js",
    baseUrl + "/fc_preferences.js",
    baseUrl + "/fc_spellpredict.js",
];

FrozenCookies.loadInterval = setInterval(function () {
    if (Game && Game.ready) {
        clearInterval(FrozenCookies.loadInterval);
        FrozenCookies.loadInterval = 0;
        fcInit();
    }
}, 1000);

async function loadScript(url) {
    const url = SCRIPTS[id];
    if (/\.js$/.exec(url)) {
        return new Promise((resolve) => $.getScript(url, resolve));
    }
    if (/\.css$/.exec(url)) {
        $("<link>")
            .attr({
                rel: "stylesheet",
                type: "text/css",
                href: url,
            })
            .appendTo($("head"));
        return;
    }
    console.log("Error loading script: " + url);
}

async function loadScripts() {
    for (const url of SCRIPTS) {
        await loadScript(url);
    }
    const { registerMod } = await import("./fc_main.js");
    registerMod("frozen_cookies"); // when the mod is registered, the save data is passed in the load function
}

function fcInit() {
    const jquery = document.createElement("script");
    jquery.setAttribute("type", "text/javascript");
    jquery.setAttribute("src", "https://code.jquery.com/jquery-3.6.0.min.js");
    jquery.setAttribute(
        "integrity",
        "sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
    );
    jquery.setAttribute("crossorigin", "anonymous");
    jquery.onload = function () {
        void loadScripts();
    };
    document.head.appendChild(jquery);
}
