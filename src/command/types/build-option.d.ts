export interface BuildOption {

    SourcePath?: string;

    Arguments?: string;

    OutfilePath?: string;

    VsVersion?: string;
}

export interface PostBuildOption {

    SourcePath: string;

    Arguments?: string;

    OutfilePath?: string;

    VsVersion: string;
}