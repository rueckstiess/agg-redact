export const KEY_PRESERVING_OPS = [
  "$accumulator",
  "$cond",
  "$convert",
  "$dateFromParts",
  "$dateToParts",
  "$dateFromString",
  "$dateToString",
  "$filter",
  "$function",
  "$let",
  "$lookup",
  "$ltrim",
  "$map",
  "$merge",
  "$out",
  "$reduce",
  "$regexFind",
  "$regexFindAll",
  "$regexMatch",
  "$replaceOne",
  "$replaceAll",
  "$replaceRoot",
  "$rtrim",
  "$sample",
  "$switch",
  "$trim",
  "$unionWith",
  "$unwind",
  "$zip",
];

export const NUM_VALUE_PRESERVING_STAGES = [
  "$limit",
  "$project",
  "$sort",
  "$sample",
  "$skip",
];

export const ADLQM_FIELDS_TO_HASH = [
  /clientApplicationName/,
  /executedPlans\.databaseName/,
  /executedPlans\.collectionName/,
  /executedPlans\..*[pP]ipeline\.definedFields/,
  /executedPlans\..*[pP]ipeline\.referencedFields/,
  /executedPlans\..*[pP]ipeline\.group\..+/,
  /executedPlans\..*[pP]ipeline\.lookup\.[^h]/,
];

export const ADLQM_JSON_FIELD = /json$/;

export const ADLQM_PIPELINE_FIELD = /[pP]ipeline$/;

export const SCHEMES = {
  HASHED: "hashed",
  TYPED: "typed",
};
