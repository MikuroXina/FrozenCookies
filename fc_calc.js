export function divCps(value, cps) {
    if (!value) {
        return 0;
    }
    if (cps) {
        return value / cps;
    }
    return Number.POSITIVE_INFINITY;
}
