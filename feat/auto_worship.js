export function start() {
    if (FrozenCookies.autoWorship0) {
        FrozenCookies.autoWorship0Bot = setInterval(
            autoWorship0Action,
            FrozenCookies.frequency
        );
    }

    if (FrozenCookies.autoWorship1) {
        FrozenCookies.autoWorship1Bot = setInterval(
            autoWorship1Action,
            FrozenCookies.frequency
        );
    }

    if (FrozenCookies.autoWorship2) {
        FrozenCookies.autoWorship2Bot = setInterval(
            autoWorship2Action,
            FrozenCookies.frequency
        );
    }
}

export function stop() {
    if (FrozenCookies.autoWorship0Bot) {
        clearInterval(FrozenCookies.autoWorship0Bot);
        FrozenCookies.autoWorship0Bot = 0;
    }

    if (FrozenCookies.autoWorship1Bot) {
        clearInterval(FrozenCookies.autoWorship1Bot);
        FrozenCookies.autoWorship1Bot = 0;
    }

    if (FrozenCookies.autoWorship2Bot) {
        clearInterval(FrozenCookies.autoWorship2Bot);
        FrozenCookies.autoWorship2Bot = 0;
    }
}

function autoWorship0Action() {
    if (
        !TEMPLE_GAME ||
        TEMPLE_GAME.swaps < 1 ||
        !FrozenCookies.autoWorshipToggle ||
        FrozenCookies.autoWorship0 == 11 ||
        FrozenCookies.autoCyclius ||
        TEMPLE_GAME.slot[0] == FrozenCookies.autoWorship0
    ) {
        return;
    }

    if (TEMPLE_GAME.swaps > 0) {
        swapIn(FrozenCookies.autoWorship0, 0);
    }
}

function autoWorship1Action() {
    if (
        !TEMPLE_GAME ||
        TEMPLE_GAME.swaps < 1 ||
        !FrozenCookies.autoWorshipToggle ||
        FrozenCookies.autoWorship1 == 11 ||
        FrozenCookies.autoCyclius ||
        TEMPLE_GAME.slot[1] == FrozenCookies.autoWorship1
    ) {
        return;
    }

    if (TEMPLE_GAME.slot[0] == FrozenCookies.autoWorship1) {
        FrozenCookies.autoworship1 = 11;
        logEvent("autoWorship", "Can't worship the same god in Diamond and Ruby slots!");
        return;
    }

    if (TEMPLE_GAME.swaps > 0) {
        swapIn(FrozenCookies.autoWorship1, 1);
    }
}

function autoWorship2Action() {
    if (
        !TEMPLE_GAME ||
        TEMPLE_GAME.swaps < 1 ||
        !FrozenCookies.autoWorshipToggle ||
        FrozenCookies.autoWorship2 == 11 ||
        FrozenCookies.autoCyclius ||
        TEMPLE_GAME.slot[2] == FrozenCookies.autoWorship2
    ) {
        return;
    }

    if (TEMPLE_GAME.slot[0] == FrozenCookies.autoWorship2) {
        FrozenCookies.autoworship2 = 11;
        logEvent("autoWorship", "Can't worship the same god in Diamond and Jade slots!");
        return;
    }
    if (TEMPLE_GAME.slot[1] == FrozenCookies.autoWorship2) {
        FrozenCookies.autoworship2 = 11;
        logEvent("autoWorship", "Can't worship the same god in Ruby and Jade slots!");
        return;
    }

    if (TEMPLE_GAME.swaps > 0) {
        swapIn(FrozenCookies.autoWorship2, 2);
    }
}
