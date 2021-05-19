import redactQueryMetrics from "./adlqm";
import redact from "./redact";
import { expect } from "chai";
import queryMetricsExample from "../test/fixtures/query_metrics_example.json";
import { inspect } from "util";

describe("redactQueryMetrics", function () {
  it("passes the salt to the redact function", function () {
    const result1 = redactQueryMetrics(queryMetricsExample, "salt1");
    const result2 = redactQueryMetrics(queryMetricsExample, "salt2");
    expect(result1.clientApplicationName).to.not.equal(
      result2.clientApplicationName
    );
  });
  it("redacts the clientApplicationName field", function () {
    const result = redactQueryMetrics(queryMetricsExample);
    expect(result.clientApplicationName).to.equal(redact("MongoDB Shell"));
  });
  it("redacts the databaseName field", function () {
    const result = redactQueryMetrics(queryMetricsExample);
    expect(result.executedPlans[0].databaseName).to.equal(
      redact("sample_mflix")
    );
  });
  it("redacts the collectionName field", function () {
    const result = redactQueryMetrics(queryMetricsExample);
    expect(result.executedPlans[0].collectionName).to.equal(redact("users"));
  });
  it("does not redact other fields", function () {
    const result = redactQueryMetrics(queryMetricsExample);
    expect(result.clientDriverName).to.equal("MongoDB Internal Client");
  });
  it("redacts the pipeline.json fields", function () {
    const result = redactQueryMetrics(queryMetricsExample);
    expect(result.executedPlans[0].pipeline[0].json).to.not.equal(
      queryMetricsExample.executedPlans[0].pipeline[0].json
    );
  });
  it("falls back to replacing value with a placeholder string if the redaction throws an error", function () {
    const input = { "test.json": '{"r": {"$regex": "foo", "$options": "gi"}}' };
    const result = redactQueryMetrics(input);
    expect(result["test.json"]).to.match(
      /{"25rGiRjCuL":{"\$regex":"AeF1qioaaY","\$options":"4X1AjEwehM"}}/
    );
  });
  it("adds prefix hashes to each of the pipeline stages", function () {
    const result = redactQueryMetrics(queryMetricsExample);
    result.executedPlans[0].pipeline.forEach((stage) =>
      expect(Object.keys(stage)).to.include("prefixHash")
    );
  });
  it("keeps the fields in definedFields consistent with the fields in the redacted pipeline", function () {
    const result = redactQueryMetrics(queryMetricsExample);
    expect(result.executedPlans[0].pipeline[0].json).to.match(
      new RegExp(result.executedPlans[0].pipeline[0].definedFields[0])
    );
  });
});
