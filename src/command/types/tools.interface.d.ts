export type convert2sarfi = (data: Buffer, success?: (content: Sarif) => void) => void;

export type toolsFinder = (opt: PostWhereOption, success?: (installationPath: string) => void) => void;