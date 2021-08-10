import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { redact } from "./redact";
import { EJSON } from "bson";
import readline from "readline";

export function cli() {
  let args = yargs(hideBin(process.argv))
    .example('$0 \'[{"$match": {"secretField": "secretValue"}}]\'')
    .option("salt", {
      alias: "s",
      type: "string",
      default: "",
      description: "Add custom salt to hash function",
    });

  if (process.stdin.isTTY) {
    args.demandCommand(1);
  }
  args = args.argv;

  if (process.stdin.isTTY) {
    console.log(
      EJSON.stringify(redact(EJSON.parse(args._[0]), { salt: args.salt }))
    );
  } else {
    // read from stdin line by line
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", function (line) {
      console.log(
        EJSON.stringify(redact(EJSON.parse(line), { salt: args.salt }))
      );
    });
  }
}
