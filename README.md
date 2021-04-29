# agg-redact

Redacts MongoDB Aggregation Pipelines by hashing user-provided keys and values.

## Programmatic Usage (ESM)

```js
import { redact } from "agg-redact";

console.log(
  redact(
    [
      { $match: { secretField: "secretValue" } },
      { $sort: { secretField: 1 } },
      { $limit: 1 },
    ],
    "just-a-bit-of-salt" // optional
  )
);
```

## Programmatic Usage (CJS)

```js
const redact = require("agg-redact").default;

console.log(
  redact(
    [
      { $match: { secretField: "secretValue" } },
      { $sort: { secretField: 1 } },
      { $limit: 1 },
    ],
    "just-a-bit-of-salt" // optional
  )
);
```

## Command Line Usage

```bash
agg-redact '[{"$match":{"secretField":"secretValue"}},{"$sort":{"secretField":1}},{"$limit":1}]'

[
  { '$match': { fvScLdDR2p: 'L8jiUWxDWm' } },
  { '$sort': { fvScLdDR2p: 1 } },
  { '$limit': 1 }
]
```
