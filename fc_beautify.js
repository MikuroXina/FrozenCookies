import { getNumber } from "./fc_store";

export function Beautify(value) {
    const negative = value < 0;
    value = Math.abs(value);
    const formatter = NUMBER_FORMATTERS[getNumber("numberDisplay")];
    const output = formatter(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return negative ? "-" + output : output;
}
