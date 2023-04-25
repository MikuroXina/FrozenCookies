import { getNumber } from "../fc_store.js";

export function start() {
    if (getNumber("otherUpgrades")) {
        FrozenCookies.otherUpgradesBot = setInterval(
            buyOtherUpgrades,
            getNumber("frequency"),
        );
    }
}

export function stop() {
    if (FrozenCookies.otherUpgradesBot) {
        clearInterval(FrozenCookies.otherUpgradesBot);
        FrozenCookies.otherUpgradesBot = 0;
    }
}

function buyOtherUpgrades() {
    // I'm sure there's a better way to do this
    // Buy eggs
    if (
        Game.Upgrades["Faberge egg"].unlocked == 1 &&
        !Game.Upgrades["Faberge egg"].bought &&
        Game.cookies > Game.Upgrades["Faberge egg"].getPrice()
    ) {
        Game.Upgrades["Faberge egg"].buy();
    }
    if (
        Game.Upgrades["Wrinklerspawn"].unlocked == 1 &&
        !Game.Upgrades["Wrinklerspawn"].bought &&
        Game.cookies > Game.Upgrades["Wrinklerspawn"].getPrice()
    ) {
        Game.Upgrades["Wrinklerspawn"].buy();
    }
    if (
        Game.Upgrades["Omelette"].unlocked == 1 &&
        !Game.Upgrades["Omelette"].bought &&
        Game.cookies > Game.Upgrades["Omelette"].getPrice()
    ) {
        Game.Upgrades["Omelette"].buy();
    }
    if (
        Game.Upgrades['"egg"'].unlocked == 1 &&
        !Game.Upgrades['"egg"'].bought &&
        Game.cookies > Game.Upgrades['"egg"'].getPrice()
    ) {
        Game.Upgrades['"egg"'].buy();
    }

    // Buy Santa stuff
    if (
        Game.season == "christmas" &&
        Game.Upgrades["Weighted sleighs"].unlocked == 1 &&
        !Game.Upgrades["Weighted sleighs"].bought &&
        Game.cookies > Game.Upgrades["Weighted sleighs"].getPrice()
    ) {
        Game.Upgrades["Weighted sleighs"].buy();
    }
    if (
        Game.season == "christmas" &&
        Game.Upgrades["Santa's bottomless bag"].unlocked == 1 &&
        !Game.Upgrades["Santa's bottomless bag"].bought &&
        Game.cookies > Game.Upgrades["Santa's bottomless bag"].getPrice()
    ) {
        Game.Upgrades["Santa's bottomless bag"].buy();
    }

    // Buy dragon drops
    if (
        Game.dragonLevel > 25 &&
        Game.Upgrades["Dragon fang"].unlocked == 1 &&
        !Game.Upgrades["Dragon fang"].bought &&
        Game.cookies > Game.Upgrades["Dragon fang"].getPrice()
    ) {
        Game.Upgrades["Dragon fang"].buy();
    }
    if (
        Game.dragonLevel > 25 &&
        Game.Upgrades["Dragon teddy bear"].unlocked == 1 &&
        !Game.Upgrades["Dragon teddy bear"].bought &&
        Game.cookies > Game.Upgrades["Dragon teddy bear"].getPrice()
    ) {
        Game.Upgrades["Dragon teddy bear"].buy();
    }

    // Buy other essential upgrades
    if (
        Game.Upgrades["Elder Pact"].bought == 1 &&
        Game.Upgrades["Sacrificial rolling pins"].unlocked == 1 &&
        !Game.Upgrades["Sacrificial rolling pins"].bought &&
        Game.cookies > Game.Upgrades["Sacrificial rolling pins"].getPrice()
    ) {
        Game.Upgrades["Sacrificial rolling pins"].buy();
    }
    if (
        Game.Upgrades["Green yeast digestives"].unlocked == 1 &&
        !Game.Upgrades["Green yeast digestives"].bought &&
        Game.cookies > Game.Upgrades["Green yeast digestives"].getPrice()
    ) {
        Game.Upgrades["Green yeast digestives"].buy();
    }
    if (
        Game.Upgrades["Fern tea"].unlocked == 1 &&
        !Game.Upgrades["Fern tea"].bought &&
        Game.cookies > Game.Upgrades["Fern tea"].getPrice()
    ) {
        Game.Upgrades["Fern tea"].buy();
    }
    if (
        Game.Upgrades["Ichor syrup"].unlocked == 1 &&
        !Game.Upgrades["Ichor syrup"].bought &&
        Game.cookies > Game.Upgrades["Ichor syrup"].getPrice()
    ) {
        Game.Upgrades["Ichor syrup"].buy();
    }
    if (
        Game.Upgrades["Fortune #102"].unlocked == 1 &&
        !Game.Upgrades["Fortune #102"].bought &&
        Game.cookies > Game.Upgrades["Fortune #102"].getPrice()
    ) {
        Game.Upgrades["Fortune #102"].buy();
    }
}
