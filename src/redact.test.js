import redact from "./redact";
import { expect } from "chai";
import agg1 from "../test/fixtures/agg1";
import { inspect } from "util";

const HASH_LOOKUP = {
  food: "ohr6mYusMt",
  bike: "xcw7Yz2t3E",
  cloud: "13egaUZAbs",
};

describe("redact", function () {
  it("redacts strings", function () {
    expect(redact("cloud")).to.be.equal(HASH_LOOKUP.cloud);
  });

  it("redacts arrays of strings", function () {
    const input = ["food", "bike", "cloud"];
    const output = redact(input);
    expect(output).to.be.deep.equal(input.map((e) => HASH_LOOKUP[e]));
  });

  it("does not hash variables and constants that start with $$", function () {
    expect(redact("$$NOW")).to.be.equal("$$NOW");
  });

  it("preserves the $ when redacting strings that start with a $", function () {
    expect(redact("$cloud")).to.be.equal("$" + HASH_LOOKUP.cloud);
  });

  it("hashes substrings of dotted path notation individually", function () {
    expect(redact("food.cloud")).to.be.equal(
      `${redact("food")}.${redact("cloud")}`
    );
  });

  it("hashes $-prefixed substrings of dotted path notation individually", function () {
    expect(redact("$cloud.bike")).to.be.equal(
      `$${redact("cloud")}.${redact("bike")}`
    );
  });

  it("hashes keys and values in objects", function () {
    expect(redact({ cloud: "bike" })).to.be.deep.equal({
      [HASH_LOOKUP.cloud]: HASH_LOOKUP.bike,
    });
  });

  it("does not hash _id keys in objects", function () {
    expect(redact({ _id: "food" })).to.be.deep.equal({
      _id: HASH_LOOKUP.food,
    });
  });

  it("hashes _id as a value", function () {
    expect(redact({ cloud: "_id" })).to.be.deep.equal({
      [HASH_LOOKUP.cloud]: redact("_id"),
    });
  });

  it("preserves dot notation in keys", function () {
    expect(redact({ "bike.cloud": "food" })).to.be.deep.equal({
      [`${HASH_LOOKUP.bike}.${HASH_LOOKUP.cloud}`]: HASH_LOOKUP.food,
    });
  });

  it("hashes nested objects as values", function () {
    expect(redact({ _id: { cloud: "bike" } })).to.be.deep.equal({
      _id: {
        [HASH_LOOKUP.cloud]: HASH_LOOKUP.bike,
      },
    });
  });

  it("applies a salt to the hash when one is provided", function () {
    expect(redact("food")).to.not.equal(redact("food", { salt: "pepper" }));
  });

  it("returns the same hash deterministically with the same salt", function () {
    expect(redact("food", { salt: "pepper" })).to.equal(
      redact("food", { salt: "pepper" })
    );
  });

  it("returns different hashes with a different salt", function () {
    expect(redact("food", { salt: "pepper" })).to.not.equal(
      redact("food", { salt: "oregano" })
    );
  });

  it("does not hash booleans or null", function () {
    expect(redact(true)).to.equal(true);
    expect(redact(null)).to.equal(null);
  });

  it("preserves top-level keys for certain operators", function () {
    expect(
      redact({ $cond: { if: { _id: 1 }, then: true, else: false } })
    ).to.be.deep.equal({
      $cond: {
        if: { _id: "<number kALBf3r1tJ>" },
        then: true,
        else: false,
      },
    });
  });

  it("preserves numeric values for certain stages", function () {
    expect(redact({ $sort: { cloud: 1 } })).to.deep.equal({
      $sort: {
        [HASH_LOOKUP.cloud]: 1,
      },
    });

    expect(redact({ $limit: 100 })).to.deep.equal({ $limit: 100 });
  });

  describe("Examples", function () {
    it("preserves top-level keys when $out takes an object", function () {
      expect(redact({ $out: { db: "cloud", coll: "food" } })).to.be.deep.equal({
        $out: {
          db: HASH_LOOKUP.cloud,
          coll: HASH_LOOKUP.food,
        },
      });
    });

    it("does not preserve values when $out takes a string", function () {
      expect(redact({ $out: "bike" })).to.be.deep.equal({
        $out: HASH_LOOKUP.bike,
      });
    });

    it("redacts $addFields correctly", function () {
      const output = redact(agg1[0]);
      expect(output).to.deep.equal({
        $addFields: {
          "2JM8FiUZYu": {
            $divide: [
              { $subtract: ["$3TKRfeE3ty", "$u1VJSHjtBj"] },
              "<number N3ZkQLVu1a>",
            ],
          },
        },
      });
    });
  });
});
