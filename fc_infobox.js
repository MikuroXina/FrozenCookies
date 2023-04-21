// functionality for the infobox

import { nextPurchase } from "./fc_next_purchase.js";
import { probabilitySpan } from "./fc_probability.js";
import { getNumber } from "./fc_store.js";

const OFF = 0;
const TEXT_ONLY = 1;
const WHEEL_ONLY = 2;
const WHEEL_AND_TEXT = 3;

function decodeHtml(html) {
    // used to convert text with an HTML entity (like "&eacute;") into readable text
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function drawCircles(t_d, x, y) {
    const bgCanvas = $("#backgroundLeftCanvas");
    if (typeof bgCanvas.measureText != "function") {
        return;
    }
    const maxRadius =
        10 +
        10 *
            t_d.reduce(function (sum, item) {
                return item.overlay ? sum : sum + 1;
            }, 0);
    const heightOffset = maxRadius + 5 - (15 * (t_d.length - 1)) / 2;
    let i_c = 0;
    let i_tc = 0;
    const t_b = Object.freeze([
        "rgba(170, 170, 170, 1)",
        "rgba(187, 187, 187, 1)",
        "rgba(204, 204, 204, 1)",
        "rgba(221, 221, 221, 1)",
        "rgba(238, 238, 238, 1)",
        "rgba(255, 255, 255, 1)",
    ]);
    const maxText = _.max(
        t_d.map(function (o) {
            return o.name ? o.name + (o.display ? ": " + o.display : "") : "";
        }),
        function (str) {
            return str.length;
        }
    );
    const maxMeasure = bgCanvas.measureText({
        fontSize: "12px",
        fontFamily: "Arial",
        maxWidth: bgCanvas.width,
        text: maxText,
    });
    const maxWidth = maxMeasure.width;
    const maxHeight = maxMeasure.height * t_d.length;
    const fancyui = getNumber("fancyui");
    const showText = fancyui == TEXT_ONLY || fancyui == WHEEL_AND_TEXT;
    if (showText)
        bgCanvas.drawRect({
            fillStyle: "rgba(153, 153, 153, 0.6)",
            x: x + maxRadius * 2 + maxWidth / 2 + 35,
            y: y + maxRadius + 5,
            width: maxWidth + 20,
            height: maxHeight + 20,
        });

    for (const o_draw of t_d) {
        if (o_draw.overlay) {
            i_c--;
        } else {
            if (fancyui > TEXT_ONLY) {
                bgCanvas.drawArc({
                    strokeStyle: t_b[i_c % t_b.length],
                    strokeWidth: 10,
                    x: x + (maxRadius + 5),
                    y: y + maxRadius + 5,
                    radius: maxRadius - i_c * 10,
                });
                bgCanvas.drawArc({
                    strokeStyle: t_b[(i_c + 2) % t_b.length],
                    strokeWidth: 1,
                    x: x + (maxRadius + 5),
                    y: y + maxRadius + 5,
                    radius: maxRadius - 5 - i_c * 10,
                });
            }
        }
        if (fancyui > TEXT_ONLY) {
            bgCanvas.drawArc({
                strokeStyle: o_draw.c1,
                x: x + (maxRadius + 5),
                y: y + maxRadius + 5,
                radius: maxRadius - i_c * 10,
                strokeWidth: 7,
                start: 0,
                end: 360 * o_draw.f_percent,
            });
        }
        if (showText && o_draw.name) {
            const s_t = o_draw.name + (o_draw.display ? ": " + o_draw.display : "");
            bgCanvas.drawText({
                fontSize: "12px",
                fontFamily: "Arial",
                fillStyle: o_draw.c1,
                x: x + maxRadius * 2 + maxWidth / 2 + 35,
                y: y + heightOffset + 15 * i_tc,
                text: s_t,
            });
            i_tc++;
        }
        i_c++;
    }
}

function hasBuildingSpecialBuff() {
    for (const i in Game.buffs) {
        if (
            Game.buffs[i].type &&
            (Game.buffs[i].type.name == "building buff" ||
                Game.buffs[i].type.name == "building debuff")
        ) {
            return Game.buffs[i].time;
        }
    }
    return 0;
}

function buildingSpecialBuffValue() {
    for (const i in Game.buffs) {
        if (
            Game.buffs[i].type &&
            (Game.buffs[i].type.name == "building buff" ||
                Game.buffs[i].type.name == "building debuff")
        ) {
            return Game.buffs[i].multCpS;
        }
    }
    return 0;
}

function buffDuration(buffName) {
    const buff = Game.hasBuff(buffName);
    return buff ? buff.time : 0;
}

export function updateTimers() {
    // update infobox calculations and assemble output -- called every draw tick
    // useless decimal_HC_complete = (Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset)%1),
    const bankTotal = delayAmount();
    const purchaseTotal = nextPurchase().cost;
    const chain = {
        purchase: null,
        total: 0,
        finished: 0,
        completion: 0,
    };
    if (nextChainedPurchase().cost > purchaseTotal) {
        chain.purchase = nextChainedPurchase().purchase;
        chain.total = upgradePrereqCost(chain.purchase, true) - chain.purchase.getPrice();
        chain.finished =
            chain.total - (upgradePrereqCost(chain.purchase) - chain.purchase.getPrice());
        chain.completion =
            (chain.finished + Math.max(Game.cookies - bankTotal, 0)) /
            (bankTotal + chain.total);
    }
    const bankPercent = Math.min(Game.cookies, bankTotal) / (bankTotal + purchaseTotal);
    const bankMax = bankTotal / (purchaseTotal + bankTotal);
    const actualCps = Game.cookiesPs + Game.mouseCps() * getNumber("cookieClickSpeed");

    const t_draw = [];

    if (chain.purchase) {
        t_draw.push({
            f_percent: chain.completion,
            c1: "rgba(51, 51, 51, 1)",
            name: "Chain to: " + decodeHtml(chain.purchase.name),
            display: timeDisplay(
                divCps(
                    Math.max(chain.total + bankTotal - Game.cookies - chain.finished, 0),
                    actualCps
                )
            ),
        });
    }
    const purchaseCompletion = Game.cookies / (bankTotal + purchaseTotal);
    if (
        purchaseTotal > 0 &&
        nextPurchase().type == "building" &&
        Game.season == "fools"
    ) {
        t_draw.push({
            f_percent: purchaseCompletion,
            c1: "rgba(17, 17, 17, 1)",
            name:
                "Next: " +
                decodeHtml(Game.foolObjects[nextPurchase().purchase.name].name),
            display: timeDisplay(
                divCps(Math.max(purchaseTotal + bankTotal - Game.cookies, 0), actualCps)
            ),
        });
    } else {
        t_draw.push({
            f_percent: purchaseCompletion,
            c1: "rgba(17, 17, 17, 1)",
            name: "Next: " + decodeHtml(nextPurchase().purchase.name),
            display: timeDisplay(
                divCps(Math.max(purchaseTotal + bankTotal - Game.cookies, 0), actualCps)
            ),
        });
    }
    if (bankMax > 0) {
        if (bankPercent > 0 && Game.cookies < bankTotal) {
            t_draw.push({
                f_percent: bankPercent,
                c1: "rgba(252, 212, 0, 1)",
                name: "Bank Completion",
                display: timeDisplay(
                    divCps(Math.max(bankTotal - Game.cookies, 0), actualCps)
                ),
                overlay: true,
            });
        }
    }
    const gc_delay =
            (probabilitySpan("golden", Game.shimmerTypes.golden.time, 0.5) -
                Game.shimmerTypes.golden.time) /
            maxCookieTime();
    if (gc_delay > 0) {
        const gc_max_delay =
                (probabilitySpan("golden", Game.shimmerTypes.golden.time, 0.99) -
                    Game.shimmerTypes.golden.time) /
                maxCookieTime();
        t_draw.push({
            f_percent: gc_max_delay,
            c1: "rgba(255, 155, 0, 1)",
            name: "GC Maximum (99%)",
            display: timeDisplay((gc_max_delay * maxCookieTime()) / Game.fps),
        });
        t_draw.push({
            f_percent: gc_delay,
            c1: "rgba(255, 222, 95, 1)",
            name: "GC Estimate (50%)",
            display: timeDisplay((gc_delay * maxCookieTime()) / Game.fps),
            overlay: true,
        });
        const gc_min_delay =
                (probabilitySpan("golden", Game.shimmerTypes.golden.time, 0.01) -
                    Game.shimmerTypes.golden.time) /
                maxCookieTime();
        t_draw.push({
            f_percent: gc_min_delay,
            c1: "rgba(255, 235, 0, 1)",
            name: "GC Minimum (1%)",
            display: timeDisplay((gc_min_delay * maxCookieTime()) / Game.fps),
            overlay: true,
        });
    }
    const clot_delay = buffDuration("Clot") / maxCookieTime();
    if (clot_delay > 0) {
        t_draw.push({
            f_percent: clot_delay,
            c1: "rgba(255, 54, 5, 1)",
            name: "Clot (x" + Game.buffs["Clot"].multCpS + ") Time",
            display: timeDisplay(buffDuration("Clot") / Game.fps),
        });
    }
    const elder_frenzy_delay = buffDuration("Elder frenzy") / maxCookieTime();
    if (elder_frenzy_delay > 0) {
        t_draw.push({
            f_percent: elder_frenzy_delay,
            c1: "rgba(79, 0, 7, 1)",
            name: "Elder Frenzy (x" + Game.buffs["Elder frenzy"].multCpS + ") Time",
            display: timeDisplay(buffDuration("Elder frenzy") / Game.fps),
        });
    }
    const frenzy_delay = buffDuration("Frenzy") / maxCookieTime();
    if (frenzy_delay > 0) {
        t_draw.push({
            f_percent: frenzy_delay,
            c1: "rgba(255, 222, 95, 1)",
            name: "Frenzy (x" + Game.buffs["Frenzy"].multCpS + ") Time",
            display: timeDisplay(buffDuration("Frenzy") / Game.fps),
        });
    }
    const dragon_harvest_delay = buffDuration("Dragon Harvest") / maxCookieTime();
    if (dragon_harvest_delay > 0) {
        t_draw.push({
            f_percent: dragon_harvest_delay,
            c1: "rgba(206, 180, 49, 1)",
            name: "Dragon Harvest (x" + Game.buffs["Dragon Harvest"].multCpS + ") Time",
            display: timeDisplay(buffDuration("Dragon Harvest") / Game.fps),
        });
    }
    const click_frenzy_delay = buffDuration("Click frenzy") / maxCookieTime();
    if (click_frenzy_delay > 0) {
        t_draw.push({
            f_percent: click_frenzy_delay,
            c1: "rgba(0, 196, 255, 1)",
            name: "Click Frenzy (x" + Game.buffs["Click frenzy"].multClick + ") Time",
            display: timeDisplay(buffDuration("Click frenzy") / Game.fps),
        });
    }
    const dragonflight_delay = buffDuration("Dragonflight") / maxCookieTime();
    if (dragonflight_delay > 0) {
        t_draw.push({
            f_percent: dragonflight_delay,
            c1: "rgba(183, 206, 49, 1)",
            name: "Dragonflight (x" + Game.buffs["Dragonflight"].multClick + ") Time",
            display: timeDisplay(buffDuration("Dragonflight") / Game.fps),
        });
    }
    const cursed_finger_delay = buffDuration("Cursed finger") / maxCookieTime();
    if (cursed_finger_delay > 0) {
        t_draw.push({
            f_percent: cursed_finger_delay,
            c1: "rgba(23, 79, 1, 1)",
            name: "Cursed Finger Time",
            display: timeDisplay(buffDuration("Cursed finger") / Game.fps),
        });
    }
    const building_special_delay = hasBuildingSpecialBuff() / maxCookieTime();
    if (building_special_delay > 0) {
        t_draw.push({
            f_percent: building_special_delay,
            c1: "rgba(218, 165, 32, 1)",
            name: "Building Special (x" + buildingSpecialBuffValue() + ") Time",
            display: timeDisplay(hasBuildingSpecialBuff() / Game.fps),
        });
    }
    const cookie_storm_delay = buffDuration("Cookie storm") / maxCookieTime();
    if (cookie_storm_delay > 0) {
        t_draw.push({
            f_percent: cookie_storm_delay,
            c1: "rgba(0, 196, 255, 1)",
            name: "Cookie Storm Time",
            display: timeDisplay(buffDuration("Cookie storm") / Game.fps),
        });
    }
    const height = $("#backgroundLeftCanvas").height() - 140;
    drawCircles(t_draw, 20, height);
}

function maxCookieTime() {
    return Game.shimmerTypes.golden.maxTime;
}
