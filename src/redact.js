import { createHash } from "crypto";
import { KEY_PRESERVING_OPS, NUM_VALUE_PRESERVING_STAGES } from "./constants";

import {
  isArray,
  isObject,
  isString,
  isBoolean,
  isNull,
  isNumber,
  fromPairs,
  toPairs,
} from "lodash";
import base58 from "base-58";

function hash(input) {
  const hash = createHash("sha1");
  return base58.encode(hash.update(input).digest()).slice(0, 10);
}

function hashString(str) {
  if (str.includes(".")) {
    return str.split(".").map(hash).join(".");
  }
  return hash(str);
}

function hashKey(key) {
  if (key.startsWith("$")) {
    return key;
  }

  if (key === "_id") {
    return key;
  }

  return hashString(key);
}

function hashValue(value) {
  if (isBoolean(value) || isNull(value)) {
    return value;
  }

  if (!isString(value)) {
    return `<${typeof value} ${hashString(String(value))}>`;
  }

  if (value.startsWith("$$")) {
    return value;
  }
  if (value.startsWith("$")) {
    return "$" + hashString(value.slice(1));
  }

  return hashString(value);
}

export function redact(
  input,
  { preserveTopLevelKeys = false, preserveValueNumbers = false } = {}
) {
  if (isArray(input)) {
    return input.map(redact);
  }

  if (isObject(input)) {
    return fromPairs(
      toPairs(input).map(([key, value]) => [
        preserveTopLevelKeys ? key : hashKey(key),
        redact(value, {
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
  return hashValue(input);
}

export default redact;
