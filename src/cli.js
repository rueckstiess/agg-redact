import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { redact } from "./redact";
import { inspect } from "util";
import { EJSON } from "bson";
import { argv } from "process";

export function cli() {
  const t = new Date();

  const args = yargs(hideBin(process.argv))
    .example('$0 \'[{"$match": {"secretField": "secretValue"}}]\'')
    .option("salt", {
      alias: "s",
      type: "string",
      default: "",
      description: "Add custom salt to hash function",
    })
    .demandCommand(1).argv;
  console.log(args);
  console.log(inspect(redact(EJSON.parse(args._[0]), { salt: args.salt })));
}
