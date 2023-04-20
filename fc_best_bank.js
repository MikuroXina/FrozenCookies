import { getNumber, set } from "./fc_store";

function canCastSE() {
    if (TOWER_GAME.magicM >= 80 && Game.Objects["Cortex baker"].amount > 0) {
        return 1;
    }
    return 0;
}

function edificeBank() {
    if (!canCastSE) {
        return 0;
    }
    const cmCost = Game.Objects["Cortex baker"].price;
    return Game.hasBuff("everything must go") ? (cmCost * (100 / 95)) / 2 : cmCost / 2;
}

function luckyBank() {
    return baseCps() * 60 * 100;
}

function luckyFrenzyBank() {
    let bank = baseCps() * 60 * 100 * 7;
    // Adds the price of Get Lucky (with discounts) since that would need to be
    // purchased in order for this bank to make sense.
    bank += Game.Has("Get lucky") ? 0 : Game.UpgradesById[86].getPrice();
    return bank;
}

const NONE = 0;
const BAKEBERRY = 1;
const CHOCOROOT = 2;
const WHITE_CHOCOROOT = 3;
const QUEENBEET = 4;
const DUKETATER = 5;
const CRUMBSPORE = 6;
const DOUGHSHROOM = 7;

function harvestBank() {
    const setHarvestBankPlant = getNumber("setHarvestBankPlant");
    if (setHarvestBankPlant == null || setHarvestBankPlant == NONE) {
        return 0;
    }

    FrozenCookies.harvestMinutes = 0;
    FrozenCookies.harvestMaxPercent = 0;
    FrozenCookies.harvestFrenzy = 1;
    FrozenCookies.harvestBuilding = 1;
    set("harvestPlant", "");

    if (FrozenCookies.setHarvestBankType == 1 || FrozenCookies.setHarvestBankType == 3) {
        FrozenCookies.harvestFrenzy = 7;
    }

    if (FrozenCookies.setHarvestBankType == 2 || FrozenCookies.setHarvestBankType == 3) {
        const harvestBuildingArray = [
            Game.Objects["Cursor"].amount,
            Game.Objects["Grandma"].amount,
            Game.Objects["Farm"].amount,
            Game.Objects["Mine"].amount,
            Game.Objects["Factory"].amount,
            Game.Objects["Bank"].amount,
            Game.Objects["Temple"].amount,
            Game.Objects["Wizard tower"].amount,
            Game.Objects["Shipment"].amount,
            Game.Objects["Alchemy lab"].amount,
            Game.Objects["Portal"].amount,
            Game.Objects["Time machine"].amount,
            Game.Objects["Antimatter condenser"].amount,
            Game.Objects["Prism"].amount,
            Game.Objects["Chancemaker"].amount,
            Game.Objects["Fractal engine"].amount,
            Game.Objects["Javascript console"].amount,
            Game.Objects["Idleverse"].amount,
            Game.Objects["Cortex baker"].amount,
        ];
        harvestBuildingArray.sort(function (a, b) {
            return b - a;
        });

        for (
            let buildingLoop = 0;
            buildingLoop < FrozenCookies.maxSpecials;
            buildingLoop++
        ) {
            FrozenCookies.harvestBuilding *= harvestBuildingArray[buildingLoop];
        }
    }

    switch (setHarvestBankPlant) {
        case BAKEBERRY:
            set("harvestPlant", "Bakeberry");
            FrozenCookies.harvestMinutes = 30;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case CHOCOROOT:
            set("harvestPlant", "Chocoroot");
            FrozenCookies.harvestMinutes = 3;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case WHITE_CHOCOROOT:
            set("harvestPlant", "White Chocoroot");
            FrozenCookies.harvestMinutes = 3;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;

        case QUEENBEET:
            set("harvestPlant", "Queenbeet");
            FrozenCookies.harvestMinutes = 60;
            FrozenCookies.harvestMaxPercent = 0.04;
            break;

        case DUKETATER:
            set("harvestPlant", "Duketater");
            FrozenCookies.harvestMinutes = 120;
            FrozenCookies.harvestMaxPercent = 0.08;
            break;

        case CRUMBSPORE:
            set("harvestPlant", "Crumbspore");
            FrozenCookies.harvestMinutes = 1;
            FrozenCookies.harvestMaxPercent = 0.01;
            break;

        case DOUGHSHROOM:
            set("harvestPlant", "Doughshroom");
            FrozenCookies.harvestMinutes = 5;
            FrozenCookies.harvestMaxPercent = 0.03;
            break;
    }

    if (!FrozenCookies.maxSpecials) {
        FrozenCookies.maxSpecials = 1;
    }

    return (
        (baseCps() *
            60 *
            FrozenCookies.harvestMinutes *
            FrozenCookies.harvestFrenzy *
            FrozenCookies.harvestBuilding) /
        Math.pow(10, FrozenCookies.maxSpecials) /
        FrozenCookies.harvestMaxPercent
    );
}

function cookieEfficiency(startingPoint, bankAmount) {
    const currentValue = cookieValue(startingPoint);
    const bankValue = cookieValue(bankAmount);
    const bankCps = gcPs(bankValue);
    if (bankAmount <= startingPoint) {
        return 0;
    }
    if (bankCps > 0) {
        const cost = Math.max(0, bankAmount - startingPoint);
        const deltaCps = gcPs(bankValue - currentValue);
        return divCps(cost, deltaCps);
    }
    return Number.MAX_VALUE;
}

export function bestBank(minEfficiency) {
    const edifice =
        FrozenCookies.autoSpell == 3 || FrozenCookies.holdSEBank ? edificeBank() : 0;
    const bankLevel = [0, luckyBank(), luckyFrenzyBank(), harvestBank()]
        .sort(function (a, b) {
            return b - a;
        })
        .map(function (bank) {
            return {
                cost: bank,
                efficiency: cookieEfficiency(Game.cookies, bank),
            };
        })
        .find(function (bank) {
            return (bank.efficiency >= 0 && bank.efficiency <= minEfficiency) ||
                setHarvestBankPlant != NONE;
        });
    if (bankLevel.cost > edifice || setHarvestBankPlant != NONE) {
        return bankLevel;
    }
    return {
        cost: edifice,
        efficiency: 1,
    };
}
