import { Command, Option } from 'commander';
import { convert } from './convert';
import { ConvertOption } from './types/convert-option';

const program = new Command();

program
    .name('sqlproj-analysis')
    .version('0.0.1');


program.command('convert')
    .requiredOption('-s, --SourcePath <path>')
    .option('-t, --TargetPath <path>')
    .addOption(
        new Option('-f, --SourceFormat <type>', 'source format')
            .choices(['msbuild'])
            .default('msbuild')
    )
    .action((options: ConvertOption) => { return convert(options); });

program.parse();