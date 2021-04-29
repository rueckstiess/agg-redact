import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { redact } from "./redact";
import { inspect } from "util";
import { EJSON } from "bson";

export function cli() {
  const t = new Date();

  const args = yargs(hideBin(process.argv))
    .example('$0 \'[{"$match": {"secretField": "secretValue"}}]\'')
    .demandCommand(1).argv;

  console.log(inspect(redact(EJSON.parse(args._[0]))));
}
