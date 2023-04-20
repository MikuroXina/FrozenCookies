export function Beautify(value) {
    const negative = value < 0;
    value = Math.abs(value);
    const formatter = NUMBER_FORMATTERS[FrozenCookies.numberDisplay];
    const output = formatter(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return negative ? "-" + output : output;
}