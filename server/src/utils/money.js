/** Largest amount accepted for a single transaction / transfer. */
const MAX_AMOUNT = 1_000_000_000;

/** All balance arithmetic happens in integer paise to avoid floating point drift. */
const toMinor = (value) => Math.round(Number(value) * 100);

const fromMinor = (minor) => minor / 100;

/** DECIMAL-safe string for persisting a minor-unit integer. */
const minorToDecimalString = (minor) => fromMinor(minor).toFixed(2);

module.exports = { MAX_AMOUNT, toMinor, fromMinor, minorToDecimalString };
