import { createHash } from "crypto";
import {
  KEY_PRESERVING_OPS,
  NUM_VALUE_PRESERVING_STAGES,
  SCHEMES,
  CONST,
} from "./constants";

import {
  isArray,
  isPlainObject,
  isString,
  isBoolean,
  isNull,
  isNumber,
  fromPairs,
  toPairs,
} from "lodash";
import base58 from "base-58";

/**
 * Uses crypto.createHash to calculate the hash, then encodes the
 * digest with base-58 and truncates after 10 characters.
 *
 * @param {String} input   string to be hashed
 * @param {String} salt    salt to randomise the hash
 * @returns {String}       the hash digest
 */
export function hash(input, salt = "") {
  const sha1 = createHash("sha1");
  sha1.update(input);
  if (salt) {
    sha1.update(hash(salt, ""));
  }
  return base58.encode(sha1.digest()).slice(0, 10);
}

/**
 * Hashes the string with the hash() function. If the string contains
 * a '.' character, the string is first split, each segment hashed
 * individually and then recombined.
 *
 * @param {String} str    input string to be hashed
 * @param {String} salt   salt to randomise the hash
 * @returns               the hash digest
 */
function hashString(str, salt, scheme) {
  if (scheme === SCHEMES.TYPED) {
    return "string";
  }

  if (str.includes(".")) {
    return str
      .split(".")
      .map((x) => hash(x, salt, scheme))
      .join(".");
  }
  return hash(str, salt, scheme);
}

/**
 * Hashes an object key, except if it starts with a $ or is the
 * literal string "_id".
 *
 * @param {String} key    object key to be hashed
 * @param {String} salt   salt to randomise the hash

 * @returns               the hash digest
 */
function hashKey(key, salt, scheme) {
  if (key.startsWith("$")) {
    return key;
  }

  if (key === "_id") {
    return key;
  }
  if (scheme === SCHEMES.TYPED) {
    return "key";
  }
  return hashString(key, salt, scheme);
}

/**
 * Hashes any object value (right-hand side) except
 *   - booleans and null types
 *   - strings starting with $$ (system variables)
 *   - strings starting with $ (field paths) are hashed
 *     but the $ is preserved at the start
 *
 * @param {Any} value     Object value to be hashed
 * @param {String} salt   salt to randomise the hash

 * @returns               the hash digest
 */
function hashValue(value, salt, scheme) {
  if (isBoolean(value) || isNull(value) || value === "_id") {
    return value;
  }

  if (!isString(value)) {
    let type;
    try {
      type = toString
        .call(value)
        .match(/\[object (\w+)\]/)[1]
        .toLowerCase();
    } catch (err) {
      type = typeof value;
    }
    return scheme === SCHEMES.TYPED
      ? type
      : `<${type} ${hashString(String(value), salt, scheme)}>`;
  }

  if (value.startsWith("$$")) {
    return value;
  }
  if (value.startsWith("$")) {
    return "$" + hashString(value.slice(1), salt, scheme);
  }

  return hashString(value, salt, scheme);
}

/**
 * Main function to redact any type, including objects and arrays.
 *
 * @param {Any} input   input to be hashed
 * @param {Object} options
 * @param {Boolean} options.preserveTopLevelKeys   does not hash top-level keys in object
 * @param {Boolean} options.preserveValueNumbers   does not hash numeric values in object
 * @param {String} options.salt                    salt to randomise the hash
 * @param {String} options.scheme                  'hashed' or 'type', default is 'hashed'
 * @returns   same as input but with hashed keys/values
 */
export function redact(
  input,
  {
    preserveTopLevelKeys = false,
    preserveValueNumbers = false,
    salt = "",
    scheme = SCHEMES.HASHED,
  } = {}
) {
  if (isArray(input)) {
    return input.map((x) => redact(x, { preserveValueNumbers, salt, scheme }));
  }

  if (isPlainObject(input)) {
    return fromPairs(
      toPairs(input).map(([key, value]) => [
        preserveTopLevelKeys ? key : hashKey(key, salt, scheme),
        redact(value, {
          salt,
          scheme,
          preserveTopLevelKeys: KEY_PRESERVING_OPS.includes(key),
          preserveValueNumbers:
            preserveValueNumbers || NUM_VALUE_PRESERVING_STAGES.includes(key),
        }),
      ])
    );
  }

  if (preserveValueNumbers && isNumber(input)) {
    return input;
  }

  // for every other type, convert to string explicitly, then hash
  return hashValue(input, salt, scheme);
}

export default redact;
