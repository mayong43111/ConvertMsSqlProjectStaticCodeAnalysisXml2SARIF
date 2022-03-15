import { Command, Option } from 'commander';
import { convert } from './convert';
import { ConvertOption } from './types/convert-option';
import { WhereOption } from './types/where-option';
import { appWhere } from './where';

const program = new Command();

program
    .name('sqlproj-analysis')
    .description('a tool for analyzing DacFx sqlproj code')
    .version('0.0.1');


program.command('convert')
    .description('convert DacFx code analysis result xml to sarif')
    .requiredOption('-s, --SourcePath <path>')
    .option('-o, --OutfilePath <path>')
    .addOption(
        new Option('-f, --SourceFormat <type>', 'source format')
            .choices(['msbuild'])
            .default('msbuild')
    )
    .action((options: ConvertOption) => { return convert(options); });

program.command('where')
    .description('find msbuild.exe or sqlpackage.exe path, the system must be windows and install vs with SSDT.')
    .option('-w, --VsWhere <path>', 'manually set the path of vswhere')
    .option('-v, --VsVersion <version>', 'set vs version', 'latest')
    .addOption(
        new Option('-e, --ExeType <type>', 'application type')
            .choices(['msbuild', 'sqlpackage'])
            .default('msbuild')
    )
    .addOption(
        new Option('-a, --Arch <arch>', 'application architecture')
            .choices(['x86', 'x64'])
            .default('x86')
    )
    .action((options: WhereOption) => { return appWhere(options); });

program.parse();