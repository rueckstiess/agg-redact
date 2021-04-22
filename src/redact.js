import murmur from "imurmurhash";
import { createHash } from "crypto";
import base58 from "base-58";

const fieldsToRemove = ["clientApplicationName"];
const fieldsToHash = [
  "executedPlans.databaseName",
  "executedPlans.collectionName",
];

const hash = createHash("sha1");

function hashKey(key) {}

function hashValue(value) {
  return base58.encode(hash.update(value).digest()).slice(0, 10);
}

export function redact(doc, isOperatorTopLevel = false) {
  if (Array.isArray(doc)) {
    return doc.map(redact);
  }

  const type = typeof doc;

  if (type === "object") {
  }

  if (type === "number") {
  }

  return hashValue(String(doc));
}

export default redact;
