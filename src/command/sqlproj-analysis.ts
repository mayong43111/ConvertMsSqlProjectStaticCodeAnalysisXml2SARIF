import { Command, Option } from 'commander';
import { build } from './build';
import { convert } from './convert';
import { scan } from './scan';
import { BuildOption } from './types/build-option';
import { ConvertOption } from './types/convert-option';
import { ScanOption } from './types/scan-option';
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
    .action((options: ConvertOption) => { convert(options); });

program.command('where')
    .description('find msbuild.exe or sqlpackage.exe path, the system must be windows and install vs with SSDT')
    .option('-w, --VsWhere <path>', 'manually set the path of vswhere')
    .option('-v, --VsVersion <version>', 'set vs version', 'latest')
    .addOption(
        new Option('-t, --Target <name>', 'target application')
            .choices(['msbuild', 'sqlpackage', 'sqlcmd'])
            .default('msbuild')
    )
    .addOption(
        new Option('-a, --Arch <arch>', 'application architecture')
            .choices(['x86', 'x64'])
            .default('x86')
    )
    .action((options: WhereOption) => { appWhere(options); });

program.command('build')
    .description('build the *.sqlproj using msbuild.exe, the system must be windows and install vs with SSDT.')
    .requiredOption('-s, --SourcePath <sqlproj>', '*.sqlproj file path')
    .option('-a, --Arguments <msbuild args>', 'set msbuild args without project file')
    .option('-o, --OutfilePath <path>', 'set the destination path to copy the dacpac file')
    .option('-r, --AnalysisResultPath <path>', 'set the destination path to copy the static analysis result file')
    .option('-cw, --CollectWarning <switch>', 'collect warnings to record', false)
    .option('-hsca, --HideStaticCodeAnalysis <switch>', 'hide static code warnings', false)
    .option('-v, --VsVersion <version>', 'set vs version, not the msbuild toolsversion switches', 'latest')
    .action((options: BuildOption) => { build(options); });

program.command('scan')
    .description('scan the *.sqlproj using msbuild.exe, the system must be windows and install vs with SSDT.')
    .requiredOption('-s, --SourcePath <sqlproj>', '*.sqlproj file path')
    .option('-a, --Arguments <msbuild args>', 'set msbuild args without project file')
    .option('-o, --OutfilePath <path>', 'set the destination path to copy the static analysis result')
    .option('-v, --VsVersion <version>', 'set vs version, not the msbuild toolsversion switches', 'latest')
    .action((options: ScanOption) => { scan(options); });

program.parse();