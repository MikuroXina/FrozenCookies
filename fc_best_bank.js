import { getNumber, set } from "./fc_store";
import { cookieValue } from "./fc_value";
import { willAutoSpellSE } from "./feat/auto_spell";

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

export function isPlantingSomething() {
    return getNumber("setHarvestBankPlant") != 0;
}

export function isPlantingFungus() {
    return getNumber("setHarvestBankPlant") >= CRUMBSPORE;
}

let harvestFrenzy = 1;
let harvestBuilding = 1;

export function harvestCps() {
    return baseCps() *
        60 *
        getNumber("harvestMinutes") *
        harvestFrenzy *
        harvestBuilding;
}

const HARVEST_DURING_NORMAL = 0;
const HARVEST_DURING_FRENZY = 1;
const HARVEST_DURING_BUILDING_SPECIAL = 2;
const HARVEST_DURING_FRENZY_BUILDING_SPECIAL = 3;

function harvestBank() {
    const setHarvestBankPlant = getNumber("setHarvestBankPlant");
    if (setHarvestBankPlant == null || setHarvestBankPlant == NONE) {
        return 0;
    }

    set("harvestMinutes", 0);
    set("harvestMaxPercent", 0);
    harvestFrenzy = 1;
    harvestBuilding = 1;
    set("harvestPlant", "");

    const setHarvestBankType = getNumber("setHarvestBankType");
    if (setHarvestBankType == HARVEST_DURING_FRENZY || setHarvestBankType == HARVEST_DURING_FRENZY_BUILDING_SPECIAL) {
        harvestFrenzy = 7;
    }

    const maxSpecials = getNumber("maxSpecials");
    if (setHarvestBankType == HARVEST_DURING_BUILDING_SPECIAL || setHarvestBankType == HARVEST_DURING_FRENZY_BUILDING_SPECIAL) {
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

        for (let buildingLoop = 0; buildingLoop < maxSpecials; buildingLoop++) {
            harvestBuilding *= harvestBuildingArray[buildingLoop];
        }
    }

    switch (setHarvestBankPlant) {
        case BAKEBERRY:
            set("harvestPlant", "Bakeberry");
            set("harvestMinutes", 30);
            set("harvestMaxPercent", 0.03);
            break;

        case CHOCOROOT:
            set("harvestPlant", "Chocoroot");
            set("harvestMinutes", 3);
            set("harvestMaxPercent", 0.03);
            break;

        case WHITE_CHOCOROOT:
            set("harvestPlant", "White Chocoroot");
            set("harvestMinutes", 3);
            set("harvestMaxPercent", 0.03);
            break;

        case QUEENBEET:
            set("harvestPlant", "Queenbeet");
            set("harvestMinutes", 60);
            set("harvestMaxPercent", 0.04);
            break;

        case DUKETATER:
            set("harvestPlant", "Duketater");
            set("harvestMinutes", 120);
            set("harvestMaxPercent", 0.08);
            break;

        case CRUMBSPORE:
            set("harvestPlant", "Crumbspore");
            set("harvestMinutes", 1);
            set("harvestMaxPercent", 0.01);
            break;

        case DOUGHSHROOM:
            set("harvestPlant", "Doughshroom");
            set("harvestMinutes", 5);
            set("harvestMaxPercent", 0.03);
            break;
    }

    if (!maxSpecials) {
        set("maxSpecials", 1);
    }

    return (
        harvestCps() /
        Math.pow(10, getNumber("maxSpecials")) /
        getNumber("harvestMaxPercent")
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

/**
 * Calculates cost and efficiency of the best bank to purchase.
 *
 * @param {number} minEfficiency - The minimum efficiency to purchase.
 * @returns {{ cost: number; efficiency: number; }} Cost and efficiency of the best bank.
 */
export function bestBank(minEfficiency) {
    const setHarvestBankPlant = getNumber("setHarvestBankPlant");
    const edifice =
        willAutoSpellSE() || !!getNumber("holdSEBank") ? edificeBank() : 0;
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
        .find(function ({ efficiency }) {
            return (efficiency >= 0 && efficiency <= minEfficiency) ||
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
