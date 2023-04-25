import { getNumber } from "./fc_store.js";

/**
 * Calculates an evaluation value of saved cookies.
 *
 * @param {number} bankAmount - Saved cookies.
 * @param {number | undefined} wrathValue - Wrath level of grandmas.
 * @param {number | undefined} wrinklerCount - Numbers of Wrinklers.
 * @returns {number} An evaluation value of the cookies.
 */
export function cookieValue(bankAmount, wrathValue, wrinklerCount) {
    const cps = baseCps();
    const clickCps = baseClickingCps(
        getNumber("autoClick") * getNumber("cookieClickSpeed")
    );
    const autoFrenzy = getNumber("autoFrenzy");
    const frenzyCps = autoFrenzy
        ? baseClickingCps(autoFrenzy * getNumber("frenzyClickSpeed"))
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

function baseCps() {
    let buffMod = 1;
    for (const i in Game.buffs) {
        if (typeof Game.buffs[i].multCpS != "undefined") {
            buffMod *= Game.buffs[i].multCpS;
        }
    }
    if (buffMod === 0) {
        return getNumber("lastBaseCps");
    }
    const baseCPS = Game.cookiesPs / buffMod;
    set("lastBaseCps", baseCPS);
    return baseCPS;
}

function baseClickingCps(clickSpeed) {
    const clickFrenzyMod = clickBuffBonus();
    const frenzyMod = Game.hasBuff("Frenzy") ? Game.buffs["Frenzy"].multCpS : 1;
    const cpc = Game.mouseCps() / (clickFrenzyMod * frenzyMod);
    return clickSpeed * cpc;
}

function wrinklerMod(num) {
    return (
        1.1 * num * num * 0.05 * (Game.Has("Wrinklerspawn") ? 1.05 : 1) + (1 - 0.05 * num)
    );
}

function calculateChainValue(bankAmount, cps, digit) {
    const x = Math.min(bankAmount, cps * 60 * 60 * 6 * 4);
    const n = Math.floor(Math.log((9 * x) / (4 * digit)) / Math.LN10);
    return 125 * Math.pow(9, n - 3) * digit;
}

/**
 * Calculates a number of effective cookies per second.
 *
 * @param {number | undefined} delay - The delayed cost of bank.
 * @param {number | undefined} wrathValue - Wrath level of grandmas.
 * @param {number | undefined} wrinklerCount - Numbers of Wrinklers.
 * @returns {number} Effective cookies per second.
 */
export function effectiveCps(delay, wrathValue, wrinklerCount) {
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

function reindeerCps(wrathValue) {
    const averageTime = probabilitySpan("reindeer", 0, 0.5) / Game.fps;
    return (reindeerValue(wrathValue) / averageTime) * FrozenCookies.simulatedGCPercent;
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

function frenzyProbability(wrathValue) {
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    return COOKIE_SPEC.frenzy.odds[wrathValue]; // + COOKIE_SPEC.frenzyRuin.odds[wrathValue] + COOKIE_SPEC.frenzyLucky.odds[wrathValue] + COOKIE_SPEC.frenzyClick.odds[wrathValue];
}

function clotProbability(wrathValue) {
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    return COOKIE_SPEC.clot.odds[wrathValue]; // + COOKIE_SPEC.clotRuin.odds[wrathValue] + COOKIE_SPEC.clotLucky.odds[wrathValue] + COOKIE_SPEC.clotClick.odds[wrathValue];
}

/**
 * @param {number | undefined} wrathValue - Wrath level of grandmas.
 * @returns {number}
 */
function bloodProbability(wrathValue) {
    wrathValue = wrathValue != null ? wrathValue : Game.elderWrath;
    return COOKIE_SPEC.blood.odds[wrathValue];
}

/**
 * @returns {number}
 */
function gcPs(gcValue) {
    const averageGCTime = probabilitySpan("golden", 0, 0.5) / Game.fps;
    gcValue /= averageGCTime;
    gcValue *= FrozenCookies.simulatedGCPercent;
    return gcValue;
}

/**
 * @returns {number} Delayed cookies for purchasing the next chained building.
 */
export function delayAmount() {
    return bestBank(nextChainedPurchase().efficiency).cost;
}
