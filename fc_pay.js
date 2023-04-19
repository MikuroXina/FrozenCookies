export function safeBuy(bldg, count) {
    // If store is in Sell mode, Game.Objects[].buy will sell the building!
    if (Game.buyMode == -1) {
        Game.buyMode = 1;
        bldg.buy(count);
        Game.buyMode = -1;
    } else {
        bldg.buy(count);
    }
}

export function chocolateValue(bankAmount, earthShatter) {
    if (!Game.HasUnlocked("Chocolate egg") || Game.Has("Chocolate egg")) {
        return 0;
    }
    bankAmount = bankAmount != null && bankAmount !== 0 ? bankAmount : Game.cookies;
    let sellRatio = 0.25;
    let highestBuilding = 0;
    if (earthShatter == null && Game.hasAura("Earth Shatterer")) {
        sellRatio = 0.5;
    } else if (earthShatter) {
        sellRatio = 0.5;
        if (!Game.hasAura("Earth Shatterer")) {
            for (const i in Game.Objects) {
                if (Game.Objects[i].amount > 0) {
                    highestBuilding = Game.Objects[i];
                }
            }
        }
    }
    const buildingCosts = Game.ObjectsById.reduce(function (s, b) {
        return (
            s +
            cumulativeBuildingCost(
                b.basePrice,
                1,
                (b == highestBuilding ? b.amount : b.amount + 1) - b.free
            ) *
            sellRatio
        );
    }, 0);
    return 0.05 * (wrinklerValue() + bankAmount + buildingCosts);
}
