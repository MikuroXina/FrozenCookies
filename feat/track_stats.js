export function start() {
    if (statSpeed(FrozenCookies.trackStats) > 0) {
        FrozenCookies.statBot = setInterval(
            saveStats,
            statSpeed(FrozenCookies.trackStats)
        );
    } else if (FrozenCookies.trackStats == 6 && !FrozenCookies.smartTrackingBot) {
        FrozenCookies.smartTrackingBot = setTimeout(function () {
            smartTrackingStats(FrozenCookies.minDelay * 8);
        }, FrozenCookies.minDelay);
    }
}

export function stop() {
    if (FrozenCookies.statBot) {
        clearInterval(FrozenCookies.statBot);
        FrozenCookies.statBot = 0;
    }
}

function saveStats(fromGraph) {
    FrozenCookies.trackedStats.push({
        time: Date.now() - Game.startDate,
        baseCps: baseCps(),
        effectiveCps: effectiveCps(),
        hc: Game.HowMuchPrestige(
            Game.cookiesEarned + Game.cookiesReset + wrinklerValue()
        ),
        actualClicks: Game.cookieClicks,
    });
    if (
        $("#statGraphContainer").length > 0 &&
        !$("#statGraphContainer").is(":hidden") &&
        !fromGraph
    ) {
        viewStatGraphs();
    }
}

function viewStatGraphs() {
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
        FrozenCookies.trackedStats.length > 0 &&
        Date.now() - FrozenCookies.lastGraphDraw > 1000
    ) {
        FrozenCookies.lastGraphDraw = Date.now();
        $("#statGraphs").empty();
        $.jqplot(
            "statGraphs",
            transpose(
                FrozenCookies.trackedStats.map(function (s) {
                    return [
                        [s.time / 1000, s.baseCps],
                        [s.time / 1000, s.effectiveCps],
                        [s.time / 1000, s.hc],
                    ];
                })
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
                            formatter: function (_ah, ai) {
                                return timeDisplay(ai);
                            },
                        },
                    },
                    yaxis: {
                        padMin: 0,
                        renderer: $.jqplot.LogAxisRenderer,
                        tickDistribution: "even",
                        tickOptions: {
                            formatter: function (_ah, ai) {
                                return Beautify(ai);
                            },
                        },
                    },
                    y2axis: {
                        padMin: 0,
                        tickOptions: {
                            showGridline: false,
                            formatter: function (_ah, ai) {
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

function smartTrackingStats(delay) {
    saveStats();
    if (FrozenCookies.trackStats == 6) {
        delay /=
            FrozenCookies.delayPurchaseCount == 0
                ? 1 / 1.5
                : delay > FrozenCookies.minDelay
                ? 2
                : 1;
        FrozenCookies.smartTrackingBot = setTimeout(function () {
            smartTrackingStats(delay);
        }, delay);
        FrozenCookies.delayPurchaseCount = 0;
    }
}

function transpose(a) {
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) {
            return r[c];
        });
    });
}
