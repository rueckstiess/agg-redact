import redact from "./redact";
import { ADLQM_FIELDS_TO_HASH, ADLQM_JSON_FIELD } from "./constants";
import { isArray, isPlainObject, mapValues, some } from "lodash";
import { EJSON } from "bson";
import { inspect } from "util";

export function redactQueryMetrics(doc, salt = "", pathPrefix = "") {
  if (!isArray(doc) && !isPlainObject(doc)) {
    return doc;
  }

  return mapValues(doc, (value, key) => {
    if (pathPrefix) {
      key = `${pathPrefix}.${key}`;
    }

    // simple value redaction
    if (some(ADLQM_FIELDS_TO_HASH, (x) => key.match(x))) {
      return redact(value, { salt });
    }

    if (isArray(value)) {
      return value.map((x) => redactQueryMetrics(x, salt, key));
    }

    if (isPlainObject(value)) {
      return redactQueryMetrics(value, salt, key);
    }

    // redaction of json field in pipelines
    if (key.match(ADLQM_JSON_FIELD)) {
      try {
        return EJSON.stringify(redact(EJSON.parse(value), { salt }));
      } catch (err) {
        return EJSON.stringify(redact(JSON.parse(value), { salt }));
      }
    }

    return value;
  });
}

export default redactQueryMetrics;
