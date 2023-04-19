export function timeDisplay(seconds) {
    if (seconds === "---" || seconds === 0) {
        return "Done!";
    }
    if (seconds == Number.POSITIVE_INFINITY) {
        return "Never!";
    }
    seconds = Math.floor(seconds);

    let years = Math.floor(seconds / (365.25 * 24 * 60 * 60));
    years = years > 0 ? Beautify(years) + "y " : "";
    seconds %= 365.25 * 24 * 60 * 60;

    let days = Math.floor(seconds / (24 * 60 * 60));
    days = days > 0 ? days + "d " : "";
    seconds %= 24 * 60 * 60;

    let hours = Math.floor(seconds / (60 * 60));
    hours = hours > 0 ? hours + "h " : "";
    seconds %= 60 * 60;

    let minutes = Math.floor(seconds / 60);
    minutes = minutes > 0 ? minutes + "m " : "";
    seconds %= 60;

    seconds = seconds > 0 ? seconds + "s" : "";
    return (years + days + hours + minutes + seconds).trim();
}
