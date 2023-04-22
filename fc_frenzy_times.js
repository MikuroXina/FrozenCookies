import { cpsBonus, hasClickBuff } from "../fc_time.js";
import { getNumber } from "./fc_store.js";

/** @type {Object.<number, number | undefined>} */
const frenzyTimes = {};
let heavenlyChipsGainTime = 0;

export function loadFromJson(json) {
    const parsed = JSON.parse(json);
    for (const key in parsed) {
        if (Object.hasOwn(parsed, key)) {
            frenzyTimes[key] = parsed[key];
        }
    }
}

export function saveAsJson() {
    return JSON.stringify(frenzyTimes);
}

/**
 * @returns {[gain: number, time: number][]} Recorded frenzy times by gain amounts.
 */
export function frenzyTimesByGain() {
    /** @type {number[]} */
    const gains = Object.keys(frenzyTimes);
    return gains
        .sort((a, b) => a - b)
        .map((gain) => [gain, frenzyTimes[gain]]);
}

export function updateFrenzyTimes() {
    const lastGoldenCookieState = getNumber("lastGoldenCookieState");
    const currentFrenzy = cpsBonus() * clickBuffBonus();
    const heavenlyChipsGain = getNumber("heavenlyChipsGain");
    if (currentFrenzy != lastGoldenCookieState) {
        if (lastGoldenCookieState != 1 && currentFrenzy == 1) {
            logEvent("GC", "Frenzy ended, cookie production x1");
            if (heavenlyChipsGain) {
                logEvent(
                    "HC",
                    "Won " +
                        heavenlyChipsGain +
                        " heavenly chips during Frenzy. Rate: " +
                        (heavenlyChipsGain * 1000) /
                            (Date.now() - heavenlyChipsGainTime) +
                        " HC/s."
                );
                heavenlyChipsGainTime = Date.now();
                set("heavenlyChipsGain", 0);
            }
        } else {
            if (lastGoldenCookieState != 1) {
                logEvent(
                    "GC",
                    "Previous Frenzy x" + lastGoldenCookieState + "interrupted."
                );
            } else if (heavenlyChipsGain) {
                logEvent(
                    "HC",
                    "Won " +
                        heavenlyChipsGain +
                        " heavenly chips outside of Frenzy. Rate: " +
                        (heavenlyChipsGain * 1000) /
                            (Date.now() - heavenlyChipsGainTime) +
                        " HC/s."
                );
                heavenlyChipsGainTime = Date.now();
                set("heavenlyChipsGain", 0);
            }
            logEvent(
                "GC",
                "Starting " +
                    (hasClickBuff() ? "Clicking " : "") +
                    "Frenzy x" +
                    currentFrenzy
            );
        }
        if (frenzyTimes[lastGoldenCookieState] == null) {
            frenzyTimes[lastGoldenCookieState] = 0;
        }
        frenzyTimes[lastGoldenCookieState] +=
            Date.now() - getNumber("lastGoldenCookieTime");
        set("lastGoldenCookieState", currentFrenzy);
        set("lastGoldenCookieTime", Date.now());
    }
}
