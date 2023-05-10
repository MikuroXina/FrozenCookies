const COMPAT_VERSION = 2.052;
if (Game.version > COMPAT_VERSION) {
    console.log(
        "WARNING: The Cookie Clicker version is newer than this version of Frozen Cookies."
    );
    console.log(
        "This version of Frozen Cookies has only been tested through Cookie Clicker version " +
            COMPAT_VERSION
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

let loadInterval = setInterval(() => {
    if (Game && Game.ready) {
        clearInterval(loadInterval);
        loadInterval = 0;
        void fcInit();
    }
}, 1000);

async function fcInit() {
    Game.registerMod("@mikuroxina/frozen_cookies", {
        load() {
            startBots();
        },
    });
}

let runningBots = [];

function startBots() {
    for (const bot of runningBots) {
        clearInterval(bot);
    }
    runningBots = [];
    runningBots.push(setInterval(() => {
        for (const shimmer of Game.shimmers) {
            if (shimmer.type == "reindeer" || shimmer.type == "golden") {
                shimmer.pop();
            }
        }
    }, 1000));
    runningBots.push(setInterval(() => {
        Game.ClickCookie();
    }, 100));
}
