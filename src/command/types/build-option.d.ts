export interface BuildOption {

    SourcePath?: string;

    Arguments?: string;

    OutfilePath?: string;

    AnalysisResultPath?: string;

    CollectWarning?: boolean | string;

    HideStaticCodeAnalysis?: boolean | string;

    VsVersion?: string;
}

export interface PostBuildOption {

    SourcePath: string;

    Arguments?: string;

    OutfilePath?: string;

    AnalysisResultPath?: string;

    CollectWarning: boolean;

    HideStaticCodeAnalysis: boolean | string;

    VsVersion: string;
}