import path from "path";
import fs from "fs";
import { PostScanOption, ScanOption } from "./types/scan-option";
import { BuildOption } from "./types/build-option";
import { build } from "./build";
import { convert } from "./convert";
import { generateFullNameWithNumber } from "./unit";

export function scan(options?: ScanOption): void {

    const opt = checkAndPostOptions(options);
    if (!opt) {
        return;
    }

    const msbuildOpts: BuildOption = {
        SourcePath: opt.SourcePath,
        OutfilePath: opt.OutfilePath,
        CollectWarning: true,
        HideStaticCodeAnalysis: true,
        Arguments: opt.Arguments,
        VsVersion: opt.VsVersion
    }

    build(msbuildOpts, (_, xmls) => {

        if (xmls && xmls.length > 0) {

            xmls.forEach((report, index) => {
                const fullName = generateFullNameWithNumber(opt.OutfilePath, '.sarif', index, path.basename(report, '.xml'));
                convert({
                    SourcePath: report,
                    OutfilePath: fullName,
                    SourceFormat: 'msbuild'
                });
            });
        } else {
            console.warn(`the static analysis result file not found`);
        }

    });
}

function checkAndPostOptions(options?: ScanOption): PostScanOption | null {

    if (!options) {
        console.error(`options is null.`)
        return null;
    }

    if (!options.SourcePath) {
        console.error(`Target is null, sqlproj file path must be specified.`)
        return null;
    }

    if (!['.sqlproj', '.sln'].includes(path.extname(options.SourcePath).toLowerCase())) {
        console.error(`${options.SourcePath} extname is not sqlproj.`)
        return null
    }

    if (!path.isAbsolute(options.SourcePath)) {
        options.SourcePath = path.resolve(options.SourcePath);
    }

    if (!fs.existsSync(options.SourcePath)) {
        console.error(`${options.SourcePath} is not exist.`)
        return null;
    }

    if (options.OutfilePath && !path.isAbsolute(options.OutfilePath)) {
        options.OutfilePath = path.resolve(options.OutfilePath);
    }

    if (!options.OutfilePath) {
        options.OutfilePath = path.dirname(options.SourcePath);
    }

    options.VsVersion = options.VsVersion || 'latest';

    return {
        SourcePath: options.SourcePath,
        Arguments: options.Arguments,
        OutfilePath: options.OutfilePath,
        VsVersion: options.VsVersion
    }
}

