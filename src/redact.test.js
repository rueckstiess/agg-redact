import redact from ".";
import { expect } from "chai";

describe("redact", function () {
  it("should redact something", function () {
    expect(redact("foo")).to.be.equal("bar");
  });
});
