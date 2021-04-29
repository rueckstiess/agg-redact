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
    "a-hint-of-salt" // optional
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
    "a-hint-of-salt" // optional
  )
);
```

## Command Line Usage

```bash
$ agg-redact '[{"$match":{"secretField":"secretValue"}},{"$sort":{"secretField":1}},{"$limit":1}]' --salt a-hint-of-salt
```

## Output

```
[
  { "$match": { "2xhCG679ve": "3ifAaveZtF" } },
  { "$sort": { "2xhCG679ve": 1 } },
  { "$limit": 1 }
]
```
