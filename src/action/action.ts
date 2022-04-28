import * as  core from '@actions/core';
import { scan } from '../command/scan';

try {
    const sourcefile = core.getInput('source-path');
    const outfile = core.getInput('outfile-path');
    const args = core.getInput('msbuild-arguments');

    scan({
        SourcePath: sourcefile,
        OutfilePath: outfile,
        Arguments: args
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    core.setFailed(error.message as string);
}