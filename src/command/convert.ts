import fs from "fs";
import path from "path";
import { convert2sarfi } from "./convert.interface";
import { convertMsBuildXml } from "./dac/msbuild-convert";
import { Sarif } from "./sarif/sarif2";
import { ConvertOption, PostConvertOption } from "./types/convert-option";

export function convert(options?: ConvertOption): void {

    const opt = checkAndPostOptions(options);
    if (!opt) {
        return;
    }

    fs.rm(opt.TargetPath, { force: true }, (err) => {

        if (!err) {
            convertFileToSARIF(opt);
        } else {
            console.error(err);
        }
    });
}

function checkAndPostOptions(options?: ConvertOption): PostConvertOption | null {

    if (!options) {
        console.error(`options is null.`)
        return null;
    }

    if (!options.SourcePath) {
        console.error(`SourcePath is null.`)
        return null;
    }

    if (path.extname(options.SourcePath).toLowerCase() != '.xml') {
        console.error(`${options.SourcePath} extname is not xml.`)
        return null;
    }

    if (!path.isAbsolute(options.SourcePath)) {
        options.SourcePath = path.resolve(options.SourcePath);
    }

    if (!fs.existsSync(options.SourcePath)) {
        console.error(`${options.SourcePath} is not exist.`)
        return null;
    }

    if (!options.SourceFormat) {
        options.SourceFormat = 'msbuild';
    }

    options.SourceFormat = options.SourceFormat.toLowerCase();
    if (options.SourceFormat != 'msbuild') {
        console.error(`${options.SourceFormat} is not supported.`)
        return null;
    }

    if (!options.TargetPath) {
        options.TargetPath = path.join(path.dirname(options.SourcePath), path.basename(options.SourcePath, '.xml')) + '.sarif';
    } else if (path.extname(options.TargetPath).toLowerCase() != '.sarif') {
        console.error(`${options.SourcePath} extname is not sarif.`)
        return null;
    }

    return {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        SourcePath: options.SourcePath,
        TargetPath: options.TargetPath,
        SourceFormat: options.SourceFormat
    };
}

function convertFileToSARIF(opt: PostConvertOption) {

    fs.readFile(opt.SourcePath, (err, data) => {

        if (err) {
            console.error(err);
        } else if (data.length == 0) {
            console.error('source file is empty.');
        } else {

            let converter: convert2sarfi;

            switch (opt.SourceFormat) {
                case 'msbuild':
                    converter = convertMsBuildXml;
                    break;
                default:
                    console.error(`${opt.SourceFormat} not implemented`);
                    return;
            }

            converter(data, (content: Sarif) => saveSARIF(content, opt));
        }
    });
}

function saveSARIF(sarif: Sarif, opt: PostConvertOption) {

    if (sarif) {
        const content = JSON.stringify(sarif);

        fs.writeFile(opt.TargetPath, content, { encoding: 'utf-8' }, () => {
            console.log(`${opt.TargetPath} were generated`);
        });
    } else {
        console.error(`No files were generated.`);
    }
}





