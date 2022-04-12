import { exec, ExecOptions } from "@actions/exec";
import fs from "fs";
import path from "path";
import iconv from 'iconv-lite';
import { BuildOption, PostBuildOption } from "./types/build-option";
import { WhereOption } from "./types/where-option";
import { appWhere } from "./where";

export function build(options?: BuildOption, callback?: (dacpacPath: string, analysisResultPath: string) => void): void {

    const opt = checkAndPostOptions(options);
    if (!opt) {
        return;
    }

    let dacpacPath = '';
    let analysisResultPath = '';

    const whereOpts = generateWhereOptions(opt);
    appWhere(whereOpts, msbuild => {

        let command = `${opt.SourcePath}`
        if (opt.Arguments) {
            command += ` ${opt.Arguments}`
        }

        const options: ExecOptions = { silent: true }
        options.listeners = {
            stdout: (stdout: Buffer) => {
                const data = iconv.decode(stdout, 'cp936')

                if (data.startsWith('SqlPrepareForRun:')) {
                    const matchr = data.match(/(?<=->\s{1}).*/g);

                    if (matchr && matchr[0]) {
                        dacpacPath = matchr[0];
                    }
                }

                if (data.startsWith('  The results are saved in')) {
                    const matchr = data.match(/(?<=The results are saved in ).*(?<=\.StaticCodeAnalysis\.Results\.xml)/g);

                    if (matchr && matchr[0]) {
                        analysisResultPath = matchr[0];
                    }
                }

                console.log(data);
            }
        }

        exec(`"${msbuild}" ${command}`, [], options)
            .then(res => {
                if (res == 0 && fs.existsSync(dacpacPath)) {

                    if (opt.OutfilePath) {
                        fs.copyFile(dacpacPath, opt.OutfilePath, () => {
                            console.log(`the dacpac file path: ${opt.OutfilePath || ''}`);
                        });
                    } else {
                        console.log(`the dacpac file path: ${dacpacPath}`);
                    }
                }

                if (res == 0 && fs.existsSync(analysisResultPath)) {

                    if (opt.analysisResultPath) {
                        fs.copyFile(analysisResultPath, opt.analysisResultPath, () => {
                            console.log(`the static analysis result file path: ${opt.analysisResultPath || ''}`);
                        });
                    } else {
                        console.log(`the static analysis result file path: ${analysisResultPath}`);
                    }
                }

                if (callback) {
                    callback(dacpacPath, analysisResultPath);
                }
            })
            .catch(reason => {
                console.error(reason)
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

    if (path.extname(options.SourcePath).toLowerCase() != '.sqlproj') {
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
        if (path.extname(options.OutfilePath).toLowerCase() !== '.dacpac') {
            options.OutfilePath = path.join(options.OutfilePath, path.basename(options.SourcePath, '.sqlproj')) + '.dacpac';
        }
    }

    if (options.analysisResultPath) {
        if (!path.isAbsolute(options.analysisResultPath)) {
            options.analysisResultPath = path.resolve(options.analysisResultPath);
        }

        //out file path is folder， equal isDir
        if (path.extname(options.analysisResultPath).toLowerCase() !== '.dacpac') {
            options.analysisResultPath = path.join(options.analysisResultPath, path.basename(options.SourcePath, '.sqlproj')) + '.xml';
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

