import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
    .version('0.0.1')
    .option('-s, --SourcePath <char>')
    .option('-t, --TargetPath <char>')
    .action((options) => {

        if (!options.SourcePath || !fs.existsSync(options.SourcePath)) {

            console.error(`${options.SourcePath} is not exists.`)
            return;
        }
    });

program.parse();