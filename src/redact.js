const fieldsToRemove = ["clientApplicationName"];
const fieldsToHash = [
  "executedPlans.databaseName",
  "executedPlans.collectionName",
];

function hashKey(key) {}

export function redact(doc) {
  if (doc === "foo") {
    return "bar";
  }

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
