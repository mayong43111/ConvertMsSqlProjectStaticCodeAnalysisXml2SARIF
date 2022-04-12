import { exec, ExecOptions } from "@actions/exec";
import fs from "fs";
import path from "path";
import iconv from 'iconv-lite';
import { BuildOption, PostBuildOption } from "./types/build-option";
import { WhereOption } from "./types/where-option";
import { appWhere } from "./where";
import { generateFullNameWithNumber } from "./unit";

export function build(options?: BuildOption, callback?: (dacpacPath: string[], analysisResultPath: string[]) => void): void {

    const opt = checkAndPostOptions(options);
    if (!opt) {
        return;
    }

    const dacpacPath: string[] = [];
    const analysisResultPath: string[] = [];

    const whereOpts = generateWhereOptions(opt);
    appWhere(whereOpts, msbuild => {

        let command = `${opt.SourcePath}`
        if (opt.Arguments) {
            command += ` ${opt.Arguments}`
        }

        const options: ExecOptions = { silent: true, failOnStdErr: true }
        options.listeners = {
            stdout: (stdout: Buffer) => {
                const data = iconv.decode(stdout, 'cp936')

                if (data.startsWith('SqlPrepareForRun:')) {
                    const matchr = data.match(/(?<=->\s{1}).*(?<=\.dacpac)/g);

                    if (matchr && matchr[0]) {
                        dacpacPath.push(matchr[0]);
                    }
                }

                if (data.startsWith('  The results are saved in')) {
                    const matchr = data.match(/(?<=The results are saved in ).*(?<=\.StaticCodeAnalysis\.Results\.xml)/g);

                    if (matchr && matchr[0]) {
                        analysisResultPath.push(matchr[0]);
                    }
                }

                console.log(data);
            }
        }

        exec(`"${msbuild}" ${command}`, [], options)
            .then(res => {

                if (res != 0) {
                    throw 'build failed.';
                }

                dacpacPath.forEach((dac, index) => {
                    if (opt.OutfilePath) {
                        const fullName = generateFullNameWithNumber(opt.OutfilePath, '.dacpac', index, path.basename(dac));
                        fs.copyFile(dac, fullName, () => {
                            console.log(`the dacpac file path: ${fullName}`);
                        });
                    } else {
                        console.log(`the dacpac file path: ${dac}`);
                    }
                });

                analysisResultPath.forEach((report, index) => {
                    if (opt.analysisResultPath) {
                        const fullName = generateFullNameWithNumber(opt.analysisResultPath, '.xml', index, path.basename(report));
                        fs.copyFile(report, fullName, () => {
                            console.log(`the static analysis result file path: ${fullName}`);
                        });
                    } else {
                        console.log(`the static analysis result file path: ${report}`);
                    }
                });

                if (callback) {
                    callback(dacpacPath, analysisResultPath);
                }
            })
            .catch(reason => {
                console.error(reason);
                process.exit(1);
            });

    });
}

function checkAndPostOptions(options?: BuildOption): PostBuildOption | null {

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

    if (options.analysisResultPath) {
        if (!path.isAbsolute(options.analysisResultPath)) {
            options.analysisResultPath = path.resolve(options.analysisResultPath);
        }
    }

    if (!options.analysisResultPath && options.OutfilePath) {
        options.analysisResultPath = path.join(path.dirname(options.OutfilePath), path.basename(options.OutfilePath, '.dacpac')) + '.xml';
    }

    options.VsVersion = options.VsVersion || 'latest';

    return {
        SourcePath: options.SourcePath,
        Arguments: options.Arguments,
        OutfilePath: options.OutfilePath,
        analysisResultPath: options.analysisResultPath,
        VsVersion: options.VsVersion
    }
}

function generateWhereOptions(opt: PostBuildOption): WhereOption {

    return {
        Target: 'msbuild',
        VsVersion: opt.VsVersion
    }
}

