export function start() {
    if (FrozenCookies.autoCyclius) {
        FrozenCookies.autoCycliusBot = setInterval(
            autoCycliusAction,
            FrozenCookies.frequency
        );
    }
}

export function stop() {
    if (FrozenCookies.autoCycliusBot) {
        clearInterval(FrozenCookies.autoCycliusBot);
        FrozenCookies.autoCycliusBot = 0;
    }
}

function autoCycliusAction() {
    const AUTO_OFF = 0;
    const AUTO_RUBY_JADE = 1;
    const AUTO_ALL = 2;

    if (
        !TEMPLE_GAME ||
        TEMPLE_GAME.swaps < 1 ||
        FrozenCookies.autoCyclius == AUTO_OFF
    ) {
        return;
    }

    if (FrozenCookies.autoWorshipToggle == 1) {
        FrozenCookies.autoWorshipToggle = 0;
        logEvent("autoCyclius", "Turning off Auto-Pantheon");
    }

    if (FrozenCookies.autoCyclius == AUTO_ALL && Game.hasAura("Supreme Intellect")) {
        FrozenCookies.autoCyclius = AUTO_RUBY_JADE;
        logevent(
            "autoCyclius",
            "Supreme Intellect detected! Swapping Cyclius to two slot mode"
        );
    }

    const Diamond1 = 0;
    const Ruby1 = 1 * 60 + 12;
    const Jade1 = 4 * 60;
    const Diamond2 = 9 * 60 + 19;
    const Jade2 = 10 * 60 + 20;
    const Diamond3 = 12 * 60;
    const Ruby2 = 13 * 60 + 12;
    const Diamond4 = 18 * 60;
    const CycNone1 = 19 * 60 + 30;
    const Diamond5 = 21 * 60;
    const CycNone2 = 22 * 60 + 30;
    const SI6 = 6 * 60;
    const SI730 = 7 * 60 + 30;

    const DIAMOND = 0;
    const RUBY = 1;
    const JADE = 2;
    const ALL_SLOTS = [DIAMOND, RUBY, JADE];
    function otherSlots(slot) {
        switch (slot) {
            case DIAMOND:
                return [RUBY, JADE];
            case RUBY:
                return [DIAMOND, JADE];
            case JADE:
                return [DIAMOND, RUBY];
        }
        throw new Error("unreachable");
    }
    function slotToString(slot) {
        switch (slot) {
            case DIAMOND:
                return "DIAOMND";
            case RUBY:
                return "RUBY";
            case JADE:
                return "JADE";
        }
        throw new Error("unreachable");
    }

    const CYCLIUS = 3;
    const NO_GOD = 11;

    const DIAMOND_WANT_TO_CYCLIUS = FrozenCookies.autoWorship0 == CYCLIUS;
    const WANT_TO_EMPTY = [
        FrozenCookies.autoWorship0 == NO_GOD,
        FrozenCookies.autoWorship1 == NO_GOD,
        FrozenCookies.autoWorship2 == NO_GOD,
    ];

    const now = new Date();
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes(); // Time in UTC

    function runSchedule(schedule) {
        for (const { target, from, to } of schedule) {
            if (
                TEMPLE_GAME.slot[target] != CYCLIUS &&
                from <= currentMinutes &&
                currentMinutes < to
            ) {
                swapIn(CYCLIUS, target);
                logEvent(`autoCyclius", "Putting Cyclius in ${slotToString(target)}`);
                for (const other of otherSlots(target)) {
                    if (!WANT_TO_EMPTY[other] && !DIAMOND_WANT_TO_CYCLIUS) {
                        swapIn(FrozenCookies[`autoWorship${other}`], other);
                        logEvent(`autoCyclius", "set desired god to ${slotToString(other)}`);
                    }
                }
            }
        }
    }

    function resetGods() {
        for (const slot of ALL_SLOTS) {
            if (!WANT_TO_EMPTY[slot] && !DIAMOND_WANT_TO_CYCLIUS) {
                swapIn(FrozenCookies[`autoWorship${slot}`], slot);
                logEvent(`autoCyclius", "set desired god to ${slotToString(slot)}`);
            }
        }
    }

    if (FrozenCookies.autoCyclius == AUTO_RUBY_JADE && !Game.hasAura("Supreme Intellect")) {
        const SCHEDULE = [
            {
                target: RUBY,
                from: Diamond1,
                to: Jade1,
            },
            {
                target: JADE,
                from: Jade1,
                to: Diamond3,
            },
            {
                target: RUBY,
                from: Diamond3,
                to: Diamond4,
            },
        ];
        runSchedule(SCHEDULE);
        if (Game.hasGod("ages") && currentMinutes >= Diamond4) {
            // 18:00 - 0:00
            resetGods();
            Game.forceUnslotGod("ages");
            logEvent("autoCyclius", "Removing Cyclius");
        }
    }

    if (FrozenCookies.autoCyclius == AUTO_ALL) {
        const SCHEDULE = [
            {
                target: DIAMOND,
                from: Diamond1,
                to: Ruby1,
            },
            {
                target: RUBY,
                from: Ruby1,
                to: Jade1,
            },
            {
                target: JADE,
                from: Jade1,
                to: Diamond2,
            },
            {
                target: DIAMOND,
                from: Diamond2,
                to: Jade2,
            },
            {
                target: JADE,
                from: Jade2,
                to: Diamond3,
            },
            {
                target: DIAMOND,
                from: Diamond3,
                to: Ruby2,
            },
            {
                target: RUBY,
                from: Ruby2,
                to: Diamond4,
            },
            {
                target: DIAMOND,
                from: Diamond4,
                to: CycNone1,
            },
            {
                target: DIAMOND,
                from: Diamond5,
                to: CycNone2,
            },
        ];
        runSchedule(SCHEDULE);
        if (
            Game.hasGod("ages") &&
            (
                (currentMinutes >= CycNone1 && currentMinutes < Diamond5)
                || currentMinutes >= CycNone2
             )
        ) {
            // 19:30 - 21:00
            // 22:30 - 0:00
            resetGods();
            Game.forceUnslotGod("ages");
            logEvent("autoCyclius", "Removed Cyclius");
        }
    }

    // Supreme Intellect turns RUBY to DIAMOND and JADE to RUBY
    if (FrozenCookies.autoCyclius == AUTO_RUBY_JADE && Game.hasAura("Supreme Intellect")) {
        const SCHEDULE = [
            {
                target: RUBY,
                from: Diamond1,
                to: Ruby1,
            },
            {
                target: JADE,
                from: Ruby1,
                to: SI6,
            },
            {
                target: RUBY,
                from: SI6,
                to: SI730,
            },
            {
                target: RUBY,
                from: Diamond2,
                to: Jade2,
            },
            {
                target: RUBY,
                from: Diamond3,
                to: Ruby2,
            },
            {
                target: JADE,
                from: Ruby2,
                to: Diamond4,
            },
            {
                target: RUBY,
                from: Diamond4,
                to: CycNone1,
            },
            {
                target: RUBY,
                from: Diamond5,
                to: CycNone2,
            },
        ];
        runSchedule(SCHEDULE);
        if (
            Game.hasGod("ages") &&
            (
                (currentMinutes >= SI730 && currentMinutes < Diamond2)
                || (currentMinutes >= Jade2 && currentMinutes < Diamond3)
                || (currentMinutes >= CycNone1 && currentMinutes < Diamond5)
                || (currentMinutes >= CycNone2)
            )
        ) {
            // 7:30 - 9:19
            // 10:20 - 12:00
            // 19:30 - 21:00
            // 22:30 - 0:00
            resetGods();
            Game.forceUnslotGod("ages");
            logEvent("autoCyclius", "Removing Cyclius");
        }
    }
}
