import redactQueryMetrics from "./adlqm";
import redact from "./redact";
import { expect } from "chai";
import queryMetricsExample from "../test/fixtures/query_metrics_example.json";
import { inspect } from "util";

describe("redactQueryMetrics", function () {
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
  it("keeps the fields in definedFields consistent with the fields in the redacted pipeline", function () {
    const result = redactQueryMetrics(queryMetricsExample);
    expect(result.executedPlans[0].pipeline[0].json).to.match(
      new RegExp(result.executedPlans[0].pipeline[0].definedFields[0])
    );
  });
});
