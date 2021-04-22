import redact from "./redact";
import { expect } from "chai";

describe("redact", function () {
  it("should redact something", function () {
    expect(redact("food")).to.be.equal("ohr6mYusMt");
  });
});
