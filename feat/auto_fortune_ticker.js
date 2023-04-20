export function start() {
    if (FrozenCookies.autoFortune) {
        FrozenCookies.autoFortuneBot = setInterval(
            autoTicker,
            FrozenCookies.frequency * 10
        );
    }
}

export function stop() {
    if (FrozenCookies.autoFortuneBot) {
        clearInterval(FrozenCookies.autoFortuneBot);
        FrozenCookies.autoFortuneBot = 0;
    }
}

function autoTicker() {
    if (Game.TickerEffect && Game.TickerEffect.type == "fortune") {
        Game.tickerL.click();
    }
}