import { getNumber } from "../fc_store.js";

export function start() {
    if (FrozenCookies.autoDragonAura0) {
        FrozenCookies.autoDragonAura0Bot = setInterval(
            autoDragonAura0Action,
            getNumber("frequency"),
        );
    }

    if (FrozenCookies.autoDragonAura1) {
        FrozenCookies.autoDragonAura1Bot = setInterval(
            autoDragonAura1Action,
            getNumber("frequency"),
        );
    }
}

export function stop() {
    if (FrozenCookies.autoDragonAura0Bot) {
        clearInterval(FrozenCookies.autoDragonAura0Bot);
        FrozenCookies.autoDragonAura0Bot = 0;
    }

    if (FrozenCookies.autoDragonAura1Bot) {
        clearInterval(FrozenCookies.autoDragonAura1Bot);
        FrozenCookies.autoDragonAura1Bot = 0;
    }
}

function autoDragonAura0Action() {
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 5 ||
        !FrozenCookies.autoDragonAura0 ||
        !FrozenCookies.autoDragonToggle ||
        Game.dragonAura == FrozenCookies.autoDragonAura0 ||
        Game.dragonAura2 == FrozenCookies.autoDragonAura0
    ) {
        return;
    }

    if (FrozenCookies.autoDragonAura0 == FrozenCookies.autoDragonAura1) {
        FrozenCookies.autoDragonAura1 = 0;
        logEvent("autoDragon", "Can't set both auras to the same one!");
        return;
    }

    if (
        Game.dragonLevel > 25 &&
        Game.dragonAura == FrozenCookies.autoDragonAura1 &&
        Game.dragonAura2 != FrozenCookies.autoDragonAura0
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura0, 1);
        Game.ConfirmPrompt();
        logEvent("autoDragon", "Set first dragon aura");
        return;
    } else if (Game.dragonLevel >= FrozenCookies.autoDragonAura0 + 4) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura0, 0);
        Game.ConfirmPrompt();
        Game.ToggleSpecialMenu();
        logEvent("autoDragon", "Set first dragon aura");
        return;
    }
}

function autoDragonAura1Action() {
    if (
        !Game.Has("A crumbly egg") ||
        Game.dragonLevel < 26 ||
        !FrozenCookies.autoDragonAura0 ||
        !FrozenCookies.autoDragonAura1 ||
        !FrozenCookies.autoDragonToggle ||
        Game.dragonAura == FrozenCookies.autoDragonAura1 ||
        Game.dragonAura2 == FrozenCookies.autoDragonAura1
    ) {
        return;
    }

    if (
        Game.dragonAura2 == FrozenCookies.autoDragonAura0 &&
        Game.dragonAura != FrozenCookies.autoDragonAura1
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura1, 0);
        Game.ConfirmPrompt();
        logEvent("autoDragon", "Set second dragon aura");
        return;
    } else if (
        Game.dragonAura == FrozenCookies.autoDragonAura0 &&
        Game.dragonAura2 != FrozenCookies.autoDragonAura1
    ) {
        Game.specialTab = "dragon";
        Game.SetDragonAura(FrozenCookies.autoDragonAura1, 1);
        Game.ConfirmPrompt();
        Game.ToggleSpecialMenu();
        logEvent("autoDragon", "Set second dragon aura");
        return;
    }
}
