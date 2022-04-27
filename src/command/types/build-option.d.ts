export interface BuildOption {

    SourcePath?: string;

    Arguments?: string;

    OutfilePath?: string;

    AnalysisResultPath?: string;

    CollectWarning?: boolean | string;

    VsVersion?: string;
}

export interface PostBuildOption {

    SourcePath: string;

    Arguments?: string;

    OutfilePath?: string;

    AnalysisResultPath?: string;

    CollectWarning: boolean;

    VsVersion: string;
}