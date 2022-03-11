import { Command } from 'commander';
import { convert } from './convert';
import { ConvertOption } from './types/convert-option';

const program = new Command();

program
    .name('sqlproj-analysis')
    .version('0.0.1');


program.command('convert')
    .option('-s, --SourcePath <char>')
    .option('-t, --TargetPath <char>')
    .option('-f, --SourceFormat <char>', 'source format', 'msbuild')
    .action((options: ConvertOption) => { convert(options); });

program.parse();