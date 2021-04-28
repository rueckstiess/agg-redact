export const KEY_PRESERVING_OPS = ["$cond"];
export const NUM_VALUE_PRESERVING_STAGES = [
  "$project",
  "$sort",
  "$limit",
  "$sample",
];

const fieldsToRemove = ["clientApplicationName"];
const fieldsToHash = [
  "executedPlans.databaseName",
  "executedPlans.collectionName",
];
