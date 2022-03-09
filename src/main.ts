import { Command } from 'commander';
const program = new Command();

program
    .version('0.0.1')
    .option('-s, --sourcePath <char>')
    .option('-t, --targetPath <char>')
    .action((options) => {

        console.log(options.sourcePath)
    });

program.parse();