import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export function cli() {
  const t = new Date();

  const args = yargs(hideBin(process.argv))
    .fail(function (msg, err, yargs) {
      if (err) {
        console.error(`\n\n${err}\n\n`);
        process.exit(1);
      }
      console.error(yargs.help());
      console.error(`\n\n${msg}`);
    })
    .onFinishCommand(() => {
      const duration = new Date() - t;
      console.log(`\ncompleted in ${duration} ms.`);
    })
    .wrap(120)
    .demandCommand(1).argv;

  console.log("ARGS", args);
}
