import path from "path";
import fs from "fs";
import { PostScanOption, ScanOption } from "./types/scan-option";
import { BuildOption } from "./types/build-option";
import { build } from "./build";
import { convert } from "./convert";

export function scan(options?: ScanOption): void {

    const opt = checkAndPostOptions(options);
    if (!opt) {
        return;
    }

    const msbuildOpts: BuildOption = {
        SourcePath: opt.SourcePath,
        Arguments: opt.Arguments,
        VsVersion: opt.VsVersion
    }

    build(msbuildOpts, (_, xmlPath) => {

        if (xmlPath && fs.existsSync(xmlPath)) {
            convert({
                SourcePath: xmlPath,
                OutfilePath: opt.OutfilePath,
                SourceFormat: 'msbuild'
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

    if (!['.sqlproj', 'sln'].includes(path.extname(options.SourcePath).toLowerCase())) {
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

    if (options.OutfilePath) {
        if (!path.isAbsolute(options.OutfilePath)) {
            options.OutfilePath = path.resolve(options.OutfilePath);
        }

        //out file path is folder equal isDir
        if (path.extname(options.OutfilePath).toLowerCase() !== '.sarif') {
            options.OutfilePath = path.join(options.OutfilePath, path.basename(options.SourcePath, '.sqlproj')) + '.sarif';
        }
    }

    options.VsVersion = options.VsVersion || 'latest';

    return {
        SourcePath: options.SourcePath,
        Arguments: options.Arguments,
        OutfilePath: options.OutfilePath,
        VsVersion: options.VsVersion
    }
}

