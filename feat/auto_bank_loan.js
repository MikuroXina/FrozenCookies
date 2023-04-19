import { cpsBonus, hasClickBuff } from "../fc_time.js";

export function start() {
    if (FrozenCookies.autoLoan) {
        FrozenCookies.autoLoanBot = setInterval(autoLoanBuy, FrozenCookies.frequency);
    }
}

export function stop() {
    if (FrozenCookies.autoLoanBot) {
        clearInterval(FrozenCookies.autoLoanBot);
        FrozenCookies.autoLoanBot = 0;
    }
}

function autoLoanBuy() {
    if (!BANK_GAME || BANK_GAME.officelevel < 2) {
        return;
    }

    if (hasClickBuff() && cpsBonus() >= FrozenCookies.minLoanMult) {
        if (BANK_GAME.officeLevel >= 2) {
            BANK_GAME.takeLoan(1);
        }
        if (BANK_GAME.officeLevel >= 4) {
            BANK_GAME.takeLoan(2);
        }
        if (BANK_GAME.officeLevel >= 5 && FrozenCookies.autoLoan == 2) {
            BANK_GAME.takeLoan(3);
        }
    }
}
