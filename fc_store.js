/** @type {Map<string, string>} */
const config = new Map();

/**
 * Loads the value from the storage, or use `defaultValue` if none.
 *
 * @param {Storage} storage
 * @returns {(key: string, defaultValue: string | number | undefined) => void} The partial application function.
 */
export const loadFromStorage = (storage) => (key, defaultValue) => {
    if (has(key)) {
        return;
    }
    const stored = storage.getItem(setting);
    if (stored !== null) {
        set(key, stored);
        return;
    }
    if (defaultValue !== undefined) {
        set(key, defaultValue);
        return;
    }
}

/**
 * Sets the value for entry of the key.
 *
 * @param {string} key
 * @param {string | number} value
 */
export function set(key, value) {
    console.log("");
    config.set(key, value.toString());
}

/**
 * @param {string} key
 * @returns Whether an entry of the key exists.
 */
export function has(key) {
    return config.has(key);
}

/**
 * Gets a string value for entry of the key.
 *
 * @param {string} key
 * @returns The stored string, or `undefined` if none.
 */
export function getString(key) {
    return config.get(key);
}

/**
 * Gets a number value for entry of the key.
 *
 * @param {string} key
 * @returns The stored number, or `undefined` if none.
 */
export function getNumber(key) {
    const num = Number(config.get(key));
    return Number.isNaN(num) ? undefined : num;
}