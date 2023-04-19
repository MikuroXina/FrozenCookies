import { hasClickBuff } from "../fc_time.js";

export function start() {
    if (FrozenCookies.autoDragon) {
        FrozenCookies.autoDragonBot = setInterval(
            autoDragonAction,
            FrozenCookies.frequency
        );
    }
}

export function stop() {
    if (FrozenCookies.autoDragonBot) {
        clearInterval(FrozenCookies.autoDragonBot);
        FrozenCookies.autoDragonBot = 0;
    }
}

function autoDragonAction() {
    if (!Game.HasUnlocked("A crumbly egg") || Game.dragonLevel > 25 || hasClickBuff()) {
        return;
    }

    if (Game.HasUnlocked("A crumbly egg") && !Game.Has("A crumbly egg")) {
        Game.Upgrades["A crumbly egg"].buy();
        logEvent("autoDragon", "Bought an egg");
    }

    if (
        Game.dragonLevel < Game.dragonLevels.length - 1 &&
        Game.dragonLevels[Game.dragonLevel].cost()
    ) {
        Game.specialTab = "dragon";
        Game.UpgradeDragon();
        if (Game.dragonLevel + 1 >= Game.dragonLevels.length) {
            Game.ToggleSpecialMenu();
        }
        logEvent("autoDragon", "Upgraded the dragon to level " + Game.dragonLevel);
    }
}
