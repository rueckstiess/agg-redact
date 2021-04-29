import redactQueryMetrics from "./adlqm";
import { expect } from "chai";
import extract from "../test/fixtures/extract.json";
import { inspect } from "util";

describe("redactQueryMetrics", function () {
  it.only("redacts strings", function () {
    const result = redactQueryMetrics(extract[0]);
    console.log(
      inspect(result, {
        showHidden: false,
        depth: 100,
        colors: true,
      })
    );
  });
});

inspect();
