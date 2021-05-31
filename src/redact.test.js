import redact from "./redact";
import { expect } from "chai";
import queryMetricsExample from "../test/fixtures/query_metrics_example.json";
import { EJSON } from "bson";

const HASH_LOOKUP = {
  food: "ohr6mYusMt",
  bike: "xcw7Yz2t3E",
  cloud: "13egaUZAbs",
};

describe("redact", function () {
  it("redacts strings", function () {
    expect(redact("cloud")).to.be.equal(HASH_LOOKUP.cloud);
  });

  it("retains the type when redacting dates", function () {
    const d = new Date();
    expect(redact(d))
      .to.be.a("string")
      .and.match(/^<date/);
  });

  it("retains the type when redacting numbers", function () {
    const n = 1234.56;
    expect(redact(n))
      .to.be.a("string")
      .and.match(/^<number/);
  });

  it("redacts different dates differently", function () {
    const date1 = new Date("2021-05-31T11:22:33.444Z");
    const date2 = new Date("2020-05-31T11:22:33.444Z");
    expect(redact(date1)).to.not.be.deep.equal(redact(date2));
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
      const addFieldsStage = EJSON.parse(
        queryMetricsExample.executedPlans[0].pipeline[0].json
      );
      const output = redact(addFieldsStage);
      expect(output).to.deep.equal({
        $addFields: {
          "txfF2cdBoA.3qNeT5m15j.659P6rGc4i": {
            $cond: {
              if: {
                $gte: [
                  "$txfF2cdBoA.3qNeT5m15j.Ki6PjCeLPG",
                  "<number 3YLsMd5zHB>",
                ],
              },
              then: {
                $cond: {
                  if: {
                    $gte: [
                      "$txfF2cdBoA.3qNeT5m15j.Ki6PjCeLPG",
                      "<number 4DU5UkCRwP>",
                    ],
                  },
                  then: "4S599TETwz",
                  else: "ExL7SeFfSd",
                },
              },
              else: "37XtSBEjk6",
            },
          },
        },
      });
    });
  });

  it("redacts two different pipelines differently", function () {
    const p1 = JSON.parse(
      '{"$match":{"$and":[{"meta.type":{"$eq":"event_summary"}},{"meta.source.account_id":{"$eq":{"$numberInt":"3"}}},{"data.time":{"$gte":{"$date":{"$numberLong":"1614185417077"}}}},{"data.time":{"$lt":{"$date":{"$numberLong":"1621961417077"}}}}]}}'
    );
    const p2 = JSON.parse(
      '{"$match":{"$and":[{"meta.type":{"$eq":"event_summary"}},{"meta.source.account_id":{"$eq":{"$numberInt":"3"}}},{"data.time":{"$gte":{"$date":{"$numberLong":"1619396971695"}}}},{"data.time":{"$lt":{"$date":{"$numberLong":"1621988971695"}}}}]}}'
    );
    expect(p1).to.not.be.deep.equal(p2);
    expect(redact(p1)).to.not.be.deep.equal(redact(p2));
  });
});
