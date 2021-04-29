import redact from "./redact";
import { ADLQM_FIELDS_TO_HASH, ADLQM_JSON_FIELD } from "./constants";
import { isArray, isPlainObject, isString, mapValues, some } from "lodash";
import { EJSON } from "bson";

export function redactQueryMetrics(doc, pathPrefix = "") {
  if (!isArray(doc) && !isPlainObject(doc)) {
    return doc;
  }

  return mapValues(doc, (value, key) => {
    if (pathPrefix) {
      key = `${pathPrefix}.${key}`;
    }

    // simple value redaction
    if (some(ADLQM_FIELDS_TO_HASH, (x) => key.match(x))) {
      return redact(value);
    }

    if (isArray(value)) {
      return value.map((x) => redactQueryMetrics(x, key));
    }

    if (isPlainObject(value)) {
      return redactQueryMetrics(value, key);
    }

    // redaction of json field in pipelines
    if (key.match(ADLQM_JSON_FIELD)) {
      return EJSON.stringify(redact(EJSON.parse(value)));
    }

    return value;
  });
}

export default redactQueryMetrics;
