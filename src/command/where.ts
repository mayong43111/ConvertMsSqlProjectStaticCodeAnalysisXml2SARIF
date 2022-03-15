import path from "path";
import fs from "fs";
import { PostWhereOption, WhereOption } from "./types/where-option";
import { toolsFinder } from "./types/tools.interface";
import { exec, ExecOptions } from "@actions/exec";


export function appWhere(options?: WhereOption, callback?: (pathString: string) => void): void {

    const opt = checkAndPostOptions(options);
    if (!opt) {
        return;
    }

    let findApplicationPath: toolsFinder;

    switch (opt.ExeType) {
        case 'msbuild':
            findApplicationPath = findMsBuild;
            break;
        case 'sqlpackage':
            findApplicationPath = findSqlpackage;
            break;
        default:
            console.error('only for msbuild.exe or sqlpackage.exe')
            return;
    }

    findApplicationPath(opt, callback);
    return;
}

function checkAndPostOptions(options?: WhereOption): PostWhereOption | null {

    if (process.platform !== 'win32') {
        console.error('this command can only be run on Windows runners')
        return null
    }

    options = options || {};
    options.VsWhere = options.VsWhere || path.join(
        process.env['ProgramFiles(x86)'] as string,
        'Microsoft Visual Studio\\Installer\\vswhere.exe'
    );

    if (!fs.existsSync(options.VsWhere)) {
        console.error('this command requires the path to where vswhere.exe exists')
        return null
    }

    options.ExeType = options.ExeType || 'msbuild';
    options.ExeType = options.ExeType.toLowerCase();

    switch (options.ExeType) {
        case 'msbuild':
        case 'sqlpackage':
            break;
        default:
            console.error('only for msbuild.exe or sqlpackage.exe')
            return null;
    }

    options.VsVersion = options.VsVersion || 'latest';

    options.Arch = options.Arch || 'x86';
    options.Arch = options.Arch.toLowerCase();

    if (options.Arch !== 'x86' && options.Arch !== 'x64') {
        console.error('only for x86 or x64')
        return null;
    }

    return {
        VsWhere: options.VsWhere,
        ExeType: options.ExeType,
        VsVersion: options.VsVersion,
        Arch: options.Arch
    };
}

function findMsBuild(opt: PostWhereOption, callback?: (pathString: string) => void): void {

    findInstallationPath(opt, (installationPath => {

        let toolPath = '';
        if (opt.Arch === "x64") {
            toolPath = path.join(
                installationPath,
                'MSBuild\\Current\\Bin\\amd64\\MSBuild.exe'
            );
        } else {
            toolPath = path.join(
                installationPath,
                'MSBuild\\Current\\Bin\\MSBuild.exe'
            )
        }

        if (fs.existsSync(toolPath)) {
            if (callback) {
                callback(toolPath);
            }
            console.log(toolPath)
        } else {
            console.error('the tool cannot be found.')
        }
    }));
}

function findSqlpackage(opt: PostWhereOption, callback?: (pathString: string) => void): void {
    findInstallationPath(opt, (installationPath => {

        let toolPath = path.join(
            installationPath,
            'Common7\\IDE\\Extensions\\Microsoft\\SQLDB\\DAC\\SqlPackage.exe');

        if (!fs.existsSync(toolPath)) {

            const programFilesPath = process.env['ProgramFiles'];

            if (programFilesPath) {

                toolPath = path.join(
                    programFilesPath,
                    'Microsoft SQL Server\\160\\DAC\\binSqlPackage.exe');

                if (!fs.existsSync(toolPath)) {

                    toolPath = path.join(
                        programFilesPath,
                        'Microsoft SQL Server\\150\\DAC\\binSqlPackage.exe');
                }
            }
        }

        if (fs.existsSync(toolPath)) {
            if (callback) {
                callback(toolPath);
            }
            console.log(toolPath)
        } else {
            console.error('the tool cannot be found.')
        }
    }));
}

//I like callback function ? ⊙﹏⊙∥, async/await is not used because of the unified coding style
function findInstallationPath(opt: PostWhereOption, success: (installationPath: string) => void) {

    let command = '-products * -requires Microsoft.Component.MSBuild -property installationPath -latest '
    if (opt.VsVersion !== 'latest') {
        command += `-version "${opt.VsVersion}" `
    }

    const options: ExecOptions = {}
    options.listeners = {
        stdout: (data: Buffer) => {
            success(data.toString().trim())
        }
    }

    exec(`"${opt.VsWhere}" ${command}`, [], options)
        .catch(reason => {
            console.error(reason)
        });
}

