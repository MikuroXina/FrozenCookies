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
    const buildingCosts = Game.ObjectsById.reduce((sum, { basePrice, amount, free }) =>
        (
            sum +
            cumulativeBuildingCost(
                basePrice,
                1,
                (b == highestBuilding ? amount : amount + 1) - free
            ) *
            sellRatio
        )
    , 0);
    return 0.05 * (wrinklerValue() + bankAmount + buildingCosts);
}


function totalDiscount(building) {
    let price = 1;
    if (building) {
        if (Game.Has("Season savings")) {
            price *= 0.99;
        }
        if (Game.Has("Santa's dominion")) {
            price *= 0.99;
        }
        if (Game.Has("Faberge egg")) {
            price *= 0.99;
        }
        if (Game.Has("Divine discount")) {
            price *= 0.99;
        }
        if (Game.hasAura("Fierce Hoarder")) {
            price *= 0.98;
        }
        if (Game.hasBuff("Everything must go")) {
            price *= 0.95;
        }
    } else {
        if (Game.Has("Toy workshop")) {
            price *= 0.95;
        }
        if (Game.Has("Five-finger discount")) {
            price *= Math.pow(0.99, Game.Objects["Cursor"].amount / 100);
        }
        if (Game.Has("Santa's dominion")) {
            price *= 0.98;
        }
        if (Game.Has("Faberge egg")) {
            price *= 0.99;
        }
        if (Game.Has("Divine sales")) {
            price *= 0.99;
        }
        if (Game.hasAura("Master of the Armory")) {
            price *= 0.98;
        }
    }
    return price;
}

function cumulativeBuildingCost(basePrice, startingNumber, endingNumber) {
    return (
        (basePrice *
            totalDiscount(true) *
            (Math.pow(Game.priceIncrease, endingNumber) -
                Math.pow(Game.priceIncrease, startingNumber))) /
        (Game.priceIncrease - 1)
    );
}

export function cumulativeSantaCost(amount) {
    let total = 0;
    if (!amount) {
    } else if (Game.santaLevel + amount < Game.santaLevels.length) {
        for (let i = Game.santaLevel + 1; i <= Game.santaLevel + amount; i++) {
            total += Math.pow(i, i);
        }
    } else if (amount < Game.santaLevels.length) {
        for (let i = Game.santaLevel + 1; i <= amount; i++) {
            total += Math.pow(i, i);
        }
    } else {
        total = Infinity;
    }
    return total;
}
