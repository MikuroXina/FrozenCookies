export function divCps(value, cps) {
    if (!value) {
        return 0;
    }
    if (cps) {
        return value / cps;
    }
    return Number.POSITIVE_INFINITY;
}

// Used in autoCast() for some maths in the smart Force The Hand of Fate subroutine
export function BuffTimeFactor() {
    let DurMod = 1;
    if (Game.Has("Get lucky")) {
        DurMod *= 2;
    }
    if (Game.Has("Lasting fortune")) {
        DurMod *= 1.1;
    }
    if (Game.Has("Lucky digit")) {
        DurMod *= 1.01;
    }
    if (Game.Has("Lucky number")) {
        DurMod *= 1.01;
    }
    if (Game.Has("Green yeast digestives")) {
        DurMod *= 1.01;
    }
    if (Game.Has("Lucky payout")) {
        DurMod *= 1.01;
    }
    DurMod *= 1 + Game.auraMult("Epoch Manipulator") * 0.05;

    if (Game.hasGod) {
        const godLvl = Game.hasGod("decadence");
        if (godLvl == 1) {
            DurMod *= 1.07;
        } else if (godLvl == 2) {
            DurMod *= 1.05;
        } else if (godLvl == 3) {
            DurMod *= 1.02;
        }
    }

    return DurMod;
}

export function remainsDragonHarvest(factor) {
    return Game.hasBuff("Dragon Harvest").time / 30 >= Math.ceil(factor * BuffTimeFactor()) - 1;
}
export function remainsDragonflight(factor) {
    return Game.hasBuff("Dragonflight").time / 30 >= Math.ceil(factor * BuffTimeFactor()) - 1;
}
export function remainsFrenzy(factor) {
    return Game.hasBuff("Frenzy").time / 30 >= Math.ceil(factor * BuffTimeFactor()) - 1;
}
export function remainsClickFrenzy(factor) {
    return Game.hasBuff("ClickFrenzy").time / 30 >= Math.ceil(factor * BuffTimeFactor()) - 1;
}

export function goldenCookieLife() {
    for (const i in Game.shimmers) {
        if (Game.shimmers[i].type == "golden") {
            return Game.shimmers[i].life;
        }
    }
    return null;
}

export function liveWrinklers() {
    return _.select(Game.wrinklers, ({ sucked, phase }) =>
        sucked > 0.5 && phase > 0
    ).sort((w1, w2) =>
        w1.sucked < w2.sucked
    );
}

export function hasClickBuff() {
    // return Game.hasBuff("Cursed finger") || clickBuffBonus() > 1;
    return clickBuffBonus() > 1;
}

export function cpsBonus() {
    let ret = 1;
    for (const i in Game.buffs) {
        if (typeof Game.buffs[i].multCpS != "undefined") {
            ret *= Game.buffs[i].multCpS;
        }
    }
    return ret;
}
