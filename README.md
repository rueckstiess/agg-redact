# mqlredact

Redacts MongoDB Aggregation Pipelines by hashing user-provided keys and values.

## Programmatic Usage (ESM)

```js
import { redact } from "mqlredact";

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
const redact = require("mqlredact").default;

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

Install with:

```bash
npm install -g mqlredact
```

Run the script with an aggregation pipeline in JSON (and optional salt):

```bash
$ mqlredact '[{"$match":{"secretField":"secretValue"}},{"$sort":{"secretField":1}},{"$limit":1}]' --salt a-hint-of-salt
```

## Output

```
[
  { "$match": { "2xhCG679ve": "3ifAaveZtF" } },
  { "$sort": { "2xhCG679ve": 1 } },
  { "$limit": 1 }
]
```
