import { Beautify } from "./fc_beautify.js";
import { META } from "./fc_meta.js";
import { PREFERENCES } from "./fc_preferences.js";
import { chocolateValue } from "./fc_pay.js";
import { cpsBonus, liveWrinklers } from "./fc_time.js";
import { timeDisplay } from "./fc_format.js";
import { getNumber, getString, set } from "./fc_store.js";
import { frenzyTimesByGain } from "./fc_frenzy_times.js";
import { bestBank, harvestCps, isPlantingFungus, isPlantingSomething } from "./fc_best_bank.js";

$("#logButton").before(
    $("<div>")
        .attr("id", "fcButton")
        .addClass("button panelButton")
        .html("Frozen<br />Cookies")
        .click(function () {
            Game.ShowMenu("fc_menu");
        })
);

$("#logButton").hide();

$("<style>")
    .prop("type", "text/css")
    .text(
        "#fcEfficiencyTable {width: 100%;}" +
            "#fcButton {top: 0px; right: 0px; padding-top: 12px; font-size: 90%; background-position: -100px 0px;}" +
            ".worst {border-width:1px; border-style:solid; border-color:#330000;}" +
            ".bad {border-width:1px; border-style:solid; border-color:#660033;}" +
            ".average {border-width:1px; border-style:solid; border-color:#663399;}" +
            ".good {border-width:1px; border-style:solid; border-color:#3399FF;}" +
            ".best {border-width:1px; border-style:solid; border-color:#00FFFF;}" +
            ".ui-dialog {z-index:1000000;}"
    )
    .appendTo("head");

if (typeof Game.oldUpdateMenu != "function") {
    Game.oldUpdateMenu = Game.UpdateMenu;
}

function nextHC(tg) {
    const futureHC = Math.ceil(
        Game.HowMuchPrestige(Game.cookiesEarned + Game.cookiesReset)
    );
    const nextHC = Game.HowManyCookiesReset(futureHC);
    const toGo = nextHC - (Game.cookiesEarned + Game.cookiesReset);
    return tg ? toGo : timeDisplay(divCps(toGo, Game.cookiesPs));
}

function buildListing(label, name) {
    return $("<div>")
        .addClass("listing")
        .append($("<b>").text(label + ":"), " ", name);
}

/**
 * Builds a menu which displays stats and preferences.
 */
export function FCMenu() {
    Game.UpdateMenu = function () {
        if (Game.onMenu !== "fc_menu") {
            return Game.oldUpdateMenu();
        }
        if (!Game.callingMenu) {
            Game.callingMenu = true;
            setTimeout(() => {
                Game.callingMenu = false;
                Game.UpdateMenu();
            }, 1000);
        }
        const menu = $("#menu")
            .empty()
            .append(
                $("<div>")
                    .addClass("section")
                    .text(
                        "Frozen Cookies v " +
                            META.branch +
                            "." +
                            META.version
                    )
            );

        buildAutoBuyInfo(menu);
        buildReadme(menu);
        buildPreferences(menu);
        buildGoldenCookiesStats(menu);
        buildFrenzyTimesStats(menu);
        buildHeavenlyChipsInfo(menu);
        buildHarvestingInfo(menu);
        buildOtherStats(menu);
        buildInternalInfo(menu);
    };
}

function buildHeavenlyChipsInfo(menu) {
    const subsection = $("<div>").addClass("subsection");
    subsection.append(
        $("<div>").addClass("title").text("Heavenly Chips Information")
    );
    const currHC = Game.heavenlyChips;
    const resetHC = Game.HowMuchPrestige(
        Game.cookiesReset + Game.cookiesEarned + wrinklerValue() + chocolateValue()
    );

    // Show timing if it's been more than a minute since the last HC was gained
    const showTiming = Date.now() - getNumber("lastHCTime") > 1000 * 60;
    subsection.append(buildListing("HC Now", Beautify(Game.heavenlyChips)));
    subsection.append(buildListing("HC After Reset", Beautify(resetHC)));
    if (showTiming) {
        subsection.append(buildListing("Estimated time to next HC", nextHC()));
    }
    if (currHC < resetHC) {
        const lastHCAmount = getNumber("lastHCAmount");
        if (showTiming) {
            subsection.append(
                buildListing(
                    "Time since last HC",
                    timeDisplay((Date.now() - getNumber("lastHCTime")) / 1000)
                )
            );
            if (lastHCAmount - 1 >= currHC) {
                subsection.append(
                    buildListing(
                        "Time to get last HC",
                        timeDisplay(
                            (getNumber("lastHCTime") -
                                getNumber("prevLastHCTime")) /
                            1000
                        )
                    )
                );
            }
        }
        const maxHCPercent = getNumber("maxHCPercent");
        if (maxHCPercent > 0) {
            subsection.append(
                buildListing("Max HC Gain/hr", Beautify(maxHCPercent))
            );
        }
        subsection.append(
            buildListing(
                "Average HC Gain/hr",
                Beautify(
                    (60 * 60 * (lastHCAmount - currHC)) /
                    ((getNumber("lastHCTime") - Game.startDate) / 1000)
                )
            )
        );
        if (showTiming && lastHCAmount - 1 >= currHC) {
            subsection.append(
                buildListing(
                    "Previous Average HC Gain/hr",
                    Beautify(
                        (60 * 60 * (lastHCAmount - 1 - currHC)) /
                        ((getNumber("prevLastHCTime") - Game.startDate) / 1000)
                    )
                )
            );
        }
    }
    menu.append(subsection);
}

function buildAutoBuyInfo(menu) {
    const recommendation = nextPurchase();
    const chainRecommendation = nextChainedPurchase();
    const isChained = (
        recommendation.id != chainRecommendation.id ||
        recommendation.type != chainRecommendation.type
    );
    const bankLevel = bestBank(chainRecommendation.efficiency);
    const actualCps = Game.cookiesPs + Game.mouseCps() * getNumber("cookieClickSpeed");
    const chocolateRecoup =
        (recommendation.type == "upgrade"
            ? recommendation.cost
            : recommendation.cost * 0.425) /
        (recommendation.delta_cps * 21);

    const subsection = $("<div>")
        .addClass("subsection")
        .append($("<div>").addClass("title").text("Autobuy Information"));
    subsection.append(buildListing("Next Purchase", recommendation.purchase.name));
    if (isChained) {
        subsection.append(
            buildListing("Building Chain to", chainRecommendation.purchase.name)
        );
    }
    subsection.append(
        buildListing(
            "Time til completion",
            timeDisplay(
                divCps(recommendation.cost + bankLevel.cost - Game.cookies, actualCps)
            )
        )
    );
    if (isChained) {
        subsection.append(
            buildListing(
                "Time til Chain completion",
                timeDisplay(
                    divCps(
                        Math.max(
                            0,
                            chainRecommendation.cost + bankLevel.cost - Game.cookies
                        ),
                        actualCps
                    )
                )
            )
        );
    }
    if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
        subsection.append(
            buildListing(
                "Time to Recoup Chocolate",
                timeDisplay(
                    divCps(
                        recommendation.cost + bankLevel.cost - Game.cookies,
                        effectiveCps()
                    ) + chocolateRecoup
                )
            )
        );
    }
    subsection.append(buildListing("Cost", Beautify(recommendation.cost)));
    subsection.append(buildListing("Golden Cookie Bank", Beautify(bankLevel.cost)));
    subsection.append(
        buildListing("Base Δ CPS", Beautify(recommendation.base_delta_cps))
    );
    subsection.append(buildListing("Full Δ CPS", Beautify(recommendation.delta_cps)));
    subsection.append(
        buildListing("Purchase Efficiency", Beautify(recommendation.efficiency))
    );
    if (isChained) {
        subsection.append(
            buildListing("Chain Efficiency", Beautify(chainRecommendation.efficiency))
        );
    }
    if (bankLevel.efficiency > 0) {
        subsection.append(
            buildListing("Golden Cookie Efficiency", Beautify(bankLevel.efficiency))
        );
    }
    menu.append(subsection);
}

function buildReadme(menu) {
    const subsection = $("<div>")
        .addClass("subsection")
        .append(
            $(
                '<a href="https://github.com/MikuroXina/FrozenCookies#what-can-frozen-cookies-do" target="new">Online documentation</a>'
            )
        );
    menu.append(subsection);
}

function buildInternalInfo(menu) {
    const subsection = $("<div>").addClass("subsection");
    subsection.append($("<div>").addClass("title").text("Internal Information"));
    const buildTable = $("<table>")
        .prop("id", "fcEfficiencyTable")
        .append(
            $("<tr>").append(
                $("<th>").text("Building"),
                $("<th>").text("Eff%"),
                $("<th>").text("Efficiency"),
                $("<th>").text("Cost"),
                $("<th>").text("Δ CPS")
            )
        );
    for (const rec of recommendationList()) {
        const item = rec.purchase, chainStr = item.unlocked === 0 ? " (C)" : "";
        buildTable.append(
            $("<tr>").append(
                $("<td>").append($("<b>").text(item.name + chainStr)),
                $("<td>").text(
                    (Math.floor(rec.efficiencyScore * 10000) / 100).toString() + "%"
                ),
                $("<td>").text(Beautify(rec.efficiency)),
                $("<td>").text(Beautify(rec.cost)),
                $("<td>").text(Beautify(rec.delta_cps))
            )
        );
    }

    // Table Dividers
    const dividers = [
        $("<tr>").append($("<td>").attr("colspan", "5").html("&nbsp;")),
        $("<tr>")
            .css("border-top", "2px dashed #999")
            .append($("<td>").attr("colspan", "5").html("&nbsp;")),
    ];
    buildTable.append(dividers);

    const banks = [
        {
            name: "Lucky Bank",
            cost: luckyBank(),
            efficiency: cookieEfficiency(Game.cookies, luckyBank()),
        },
        {
            name: "Lucky Frenzy Bank",
            cost: luckyFrenzyBank(),
            efficiency: cookieEfficiency(Game.cookies, luckyFrenzyBank()),
        },
        {
            name: "Chain Bank",
            cost: chainBank(),
            efficiency: cookieEfficiency(Game.cookies, chainBank()),
        },
    ];

    const elderWrathLevels = [
        {
            name: "Pledging/Appeased",
            level: 0,
        },
        {
            name: "One Mind/Awoken",
            level: 1,
        },
        {
            name: "Displeased",
            level: 2,
        },
        {
            name: "Full Wrath/Angered",
            level: 3,
        },
    ];
    for (const bank of banks) {
        const deltaCps = effectiveCps(bank.cost) - effectiveCps();
        buildTable.append(
            $("<tr>").append(
                $("<td>")
                    .attr("colspan", "2")
                    .append(
                        $("<b>").text(bank.name + (bank.deltaCps === 0 ? " (*)" : ""))
                    ),
                $("<td>").text(Beautify(bank.efficiency)),
                $("<td>").text(Beautify(Math.max(0, bank.cost - Game.cookies))),
                $("<td>").text(Beautify(deltaCps))
            )
        );
    }

    buildTable.append(dividers);
    for (const wrath of elderWrathLevels) {
        buildTable.append(
            $("<tr>").append(
                $("<td>")
                    .attr("colspan", "2")
                    .append(
                        $("<b>").text(
                            wrath.name +
                            (Game.elderWrath === wrath.level ? " (*)" : "")
                        )
                    ),
                $("<td>")
                    .attr("colspan", "2")
                    .attr("title", "Ratio of Effective CPS vs Base CPS")
                    .text(
                        Beautify(effectiveCps(Game.cookies, wrath.level) / baseCps())
                    ),
                $("<td>").text(
                    Beautify(effectiveCps(Game.cookies, wrath.level) - effectiveCps())
                )
            )
        );
    }
    subsection.append($("<div>").addClass("listing").append(buildTable));
    menu.append(subsection);

    if (!Game.HasAchiev("Olden days")) {
        subsection.append(
            $(
                '<div id="oldenDays" style="text-align:right;width:100%;"><div ' +
                Game.clickStr +
                "=\"Game.SparkleAt(Game.mouseX,Game.mouseY);PlaySound('snd/tick.mp3');PlaySound('snd/shimmerClick.mp3');Game.Win('Olden days');Game.UpdateMenu();\" class=\"icon\" style=\"display:inline-block;transform:scale(0.5);cursor:pointer;width:48px;height:48px;background-position:" +
                -12 * 48 +
                "px " +
                -3 * 48 +
                'px;"></div></div>'
            )
        );
    }
}

function buildHarvestingInfo(menu) {
    if (isPlantingSomething()) {
        subsection = $("<div>").addClass("subsection");
        subsection.append(
            $("<div>").addClass("title").text("Harvesting Information")
        );
        subsection.append(buildListing("Base CPS", Beautify(baseCps())));
        subsection.append(
            buildListing("Plant to harvest", getString("harvestPlant"))
        );
        subsection.append(
            buildListing("Minutes of CpS", getString("harvestMinutes") + " min")
        );
        subsection.append(
            buildListing(
                "Max percent of Bank",
                getNumber("harvestMaxPercent") * 100 + " %"
            )
        );
        subsection.append(
            buildListing(
                "Single " +
                getString("harvestPlant") +
                (isPlantingFungus() ? " exploding" : " harvesting"),
                Beautify(
                    harvestCps() /
                    Math.pow(10, getNumber("maxSpecials"))
                )
            )
        );
        subsection.append(
            buildListing(
                "Full garden " +
                (isPlantingFungus()
                    ? " exploding"
                    : " harvesting") +
                " (36 plots)",
                Beautify(
                    (36 * harvestCps()) /
                    Math.pow(10, getNumber("maxSpecials"))
                )
            )
        );
        menu.append(subsection);
    }
}

function buildOtherStats(menu) {
    const subsection = $("<div>").addClass("subsection");
    subsection.append($("<div>").addClass("title").html("Other Information"));
    const cps = baseCps() +
        baseClickingCps(getNumber("cookieClickSpeed") * getNumber("autoClick"));
    const baseChosen = Game.hasBuff("Frenzy") ? "" : " (*)";
    const frenzyChosen = Game.hasBuff("Frenzy") ? " (*)" : "";
    const clickStr = !!getNumber("autoClick") ? " + Autoclick" : "";
    subsection.append(
        buildListing("Base CPS" + clickStr + baseChosen + "", Beautify(cps))
    );
    subsection.append(
        buildListing("Frenzy CPS" + clickStr + frenzyChosen + "", Beautify(cps * 7))
    );
    subsection.append(
        buildListing("Estimated Effective CPS", Beautify(effectiveCps()))
    );
    if (Game.HasUnlocked("Chocolate egg") && !Game.Has("Chocolate egg")) {
        subsection.append(
            buildListing("Chocolate Egg Value", Beautify(chocolateValue()))
        );
        if (!Game.hasAura("Earth Shatterer")) {
            subsection.append(
                buildListing(
                    "+ Earth Shatterer",
                    Beautify(chocolateValue(null, true))
                )
            );
        }
    }
    if (liveWrinklers().length > 0) {
        subsection.append(buildListing("Wrinkler Value", Beautify(wrinklerValue())));
    }
    subsection.append(buildListing("Game Seed", Game.seed));
    menu.append(subsection);
}

/**
 *
 * @param {string} preferenceName - Key of the preference.
 */
function cyclePreference(preferenceName) {
    const preference = PREFERENCES[preferenceName];
    if (!preference) {
        return;
    }
    const { display } = preference;
    const current = getNumber(preferenceName) ?? preference.default;
    const preferenceButton = $("#" + preferenceName + "Button");
    if (
        display &&
        display.length > 0 &&
        preferenceButton &&
        preferenceButton.length > 0
    ) {
        const newValue = (current + 1) % display.length;
        preferenceButton[0].innerText = display[newValue];
        set(preferenceName, newValue);
        FrozenCookies.recalculateCaches = true;
        Game.RefreshStore();
        Game.RebuildUpgrades();
        loadFeatures();
    }
}

function buildPreferences(menu) {
    const subsection = $("<div>").addClass("subsection");
    subsection.append(
        $("<div>").addClass("title").text("Frozen Cookie Controls")
    );
    for (const preferenceName in PREFERENCES) {
        /** @type {{ hint: string; display: string[] | undefined; extras: string | undefined }} */
        const { hint, display, extras } = PREFERENCES[preferenceName];
        const current = getNumber(preferenceName);
        const preferenceButtonId = preferenceName + "Button";
        if (display && display.length > 0 && display.length > current) {
            const listing = $("<div>").addClass("listing");
            listing.append(
                $("<a>")
                    .addClass("option")
                    .prop("id", preferenceButtonId)
                    .click(function () {
                        cyclePreference(preferenceName);
                    })
                    .text(display[current])
            );
            listing.append(
                $("<label>").text(
                    hint.replace(/\$\{(.+)\}/g, function (_s, id) {
                        return getString(id);
                    })
                )
            );
            if (extras) {
                const extraElem = extras();
                extraElem.innerText = extraElem.innerText.replace(/\{.*\}/g, getString(extraElem.id));
                listing.append(extraElem);
            }
            subsection.append(listing);
        }
        // if no options, still display the hint as a subsection head
        if (!display) {
            const listing = $("<div>").addClass("listing");
            listing.append(
                $("<br>"),
                $("<label>").text(
                    hint.replace(/\$\{(.+)\}/g, function (_s, id) {
                        return FrozenCookies[id];
                    })
                )
            );
            subsection.append(listing);
        }
    }
    menu.append(subsection);
    return subsection;
}

function buildGoldenCookiesStats(menu) {
    const currentFrenzy = cpsBonus() * clickBuffBonus();

    const subsection = $("<div>").addClass("subsection");
    subsection.append($("<div>").addClass("title").text("Golden Cookie Information"));
    const currentCookies = Math.min(Game.cookies, FrozenCookies.targetBank.cost);
    const maxCookies = bestBank(Number.POSITIVE_INFINITY).cost;
    const isTarget = FrozenCookies.targetBank.cost == FrozenCookies.currentBank.cost;
    const isMax = currentCookies == maxCookies;
    const targetTxt = isTarget ? "" : " (Building Bank)";
    const maxTxt = isMax ? " (Max)" : "";
    subsection.append(buildListing("Current Frenzy", Beautify(currentFrenzy)));
    subsection.append(
        buildListing(
            "Current Average Cookie Value" + targetTxt + maxTxt,
            Beautify(cookieValue(currentCookies))
        )
    );
    if (!isTarget) {
        subsection.append(
            buildListing(
                "Target Average Cookie Value",
                Beautify(cookieValue(FrozenCookies.targetBank.cost))
            )
        );
    }
    if (!isMax) {
        subsection.append(
            buildListing(
                "Max Average Cookie Value",
                Beautify(cookieValue(maxCookies))
            )
        );
    }
    subsection.append(
        buildListing("Max Lucky Cookie Value", Beautify(maxLuckyValue()))
    );
    subsection.append(
        buildListing(
            "Cookie Bank Required for Max Lucky",
            Beautify(maxLuckyValue() * 10)
        )
    );
    subsection.append(
        buildListing(
            "Max Chain Cookie Value",
            Beautify(
                calculateChainValue(
                    chainBank(),
                    Game.cookiesPs,
                    7 - Game.elderWrath / 3
                )
            )
        )
    );
    subsection.append(
        buildListing("Cookie Bank Required for Max Chain", Beautify(chainBank()))
    );
    subsection.append(
        buildListing(
            "Estimated Cookie CPS",
            Beautify(gcPs(cookieValue(currentCookies)))
        )
    );
    subsection.append(
        buildListing("Golden Cookie Clicks", Beautify(Game.goldenClicks))
    );
    if (FrozenCookies.showMissedCookies == 1) {
        subsection.append(
            buildListing(
                "Missed Golden Cookie Clicks",
                Beautify(Game.missedGoldenClicks)
            )
        );
    }
    subsection.append(
        buildListing("Last Golden Cookie Effect", Game.shimmerTypes.golden.last)
    );
    menu.append(subsection);
}

function buildFrenzyTimesStats(menu) {
    const subsection = $("<div>").addClass("subsection");
    subsection.append($("<div>").addClass("title").text("Frenzy Times"));
    for (const [gain, time] of frenzyTimesByGain()) {
        subsection.append(
            buildListing(
                "Total Recorded Time at x" + Beautify(gain),
                timeDisplay(time / 1000),
            ),
        );
    }
    menu.append(subsection);
}

function chainBank() {
    //  More exact
    const digit = 7 - Math.floor(Game.elderWrath / 3);
    return (
        4 *
        Math.floor(
            (digit / 9) *
                Math.pow(
                    10,
                    Math.floor(Math.log((194400 * baseCps()) / digit) / Math.LN10)
                )
        )
    );
    //  return baseCps() * 60 * 60 * 6 * 4;
}
