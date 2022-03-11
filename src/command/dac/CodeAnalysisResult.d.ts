export interface CodeAnalysisResult {
    Problems: Problems;
}

export interface Problems {
    Problem: Problem | Problem[];
}

export interface Problem {
    Rule: string;
    ProblemDescription: string;
    SourceFile: string;
    Line: number;
    Column: number;
    Severity: SqlRuleProblemSeverity;
}

export type SqlRuleProblemSeverity = 'Error' | 'Unknown' | 'Warning';