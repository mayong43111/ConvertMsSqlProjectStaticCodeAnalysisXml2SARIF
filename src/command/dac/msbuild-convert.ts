import { parseString } from 'xml2js';
import { Artifact, ReportingDescriptor, Run, Sarif } from '../sarif/sarif2';
import { CodeAnalysisResult, Problem } from './CodeAnalysisResult';

export function convertMsBuildXml(data: Buffer, complateCallback: (content: Sarif) => void) {

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    parseString(data.toString(), { ignoreAttrs: true, explicitArray: false }, (err, res: CodeAnalysisResult) => {

        if (err) {
            console.error(err);
        } else {

            const result: Sarif = generateNewSARIF();
            let problems: Problem[];

            if (!res || !res.Problems || !res.Problems.Problem) {
                problems = [];
            } else if (!(res.Problems.Problem instanceof Array)) {
                problems = [res.Problems.Problem];
            } else {
                problems = [];
            }

            analysisProblems(result, problems);
            complateCallback(result);
        }
    });
}

function generateNewSARIF(): Sarif {

    return {
        version: '2.1.0',
        $schema: 'http://json.schemastore.org/sarif-2.1.0-rtm.4',
        runs: [
            {
                tool: {
                    driver: {
                        name: 'MSBuild',
                        informationUri: 'https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild?view=vs-2022',
                        rules: []
                    }
                },
                artifacts: [],
                results: []
            }
        ]
    };
}

function analysisProblems(result: Sarif, problems: Problem[]) {

    const run: Run = result.runs[0];
    // eslint-disable-next-line  
    const rules: ReportingDescriptor[] = run.tool.driver.rules!;
    // eslint-disable-next-line  
    const artifacts: Artifact[] = run.artifacts!;

    for (let i = 0; i < problems.length; i++) {

        const ruleId = problems[i].Rule;
        const ruleIndex = findOrCreateRule(rules, ruleId);

        const sourceFile = problems[i].SourceFile;
        const artifactIndex = findOrCreateArtifact(artifacts, sourceFile);

        const level = findLevel(ruleId);

        run.results?.push(
            {
                level: level,
                message: {
                    text: problems[i].ProblemDescription
                },
                locations: [
                    {
                        physicalLocation: {
                            artifactLocation: {
                                uri: sourceFile,
                                index: artifactIndex
                            },
                            region: {
                                startLine: Number(problems[i].Line),
                                startColumn: Number(problems[i].Column)
                            }
                        }
                    }
                ],
                ruleId: problems[i].Rule,
                ruleIndex: ruleIndex
            }
        )
    }
}

function findOrCreateRule(rules: ReportingDescriptor[], ruleId: string): number {

    for (let i = 0; i < rules.length; i++) {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (ruleId == rules[i].id) {
            return i;
        }
    }

    const index = rules.length;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newRule: ReportingDescriptor = FindRuleById(ruleId);
    rules.push(newRule);

    return index;
}

function findOrCreateArtifact(artifacts: Artifact[], sourceFile: string): number {

    for (let i = 0; i < artifacts.length; i++) {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (sourceFile == artifacts[i].location?.uri) {
            return i;
        }
    }

    const index = artifacts.length;
    artifacts.push(
        {
            location: {
                uri: sourceFile
            }
        }
    );

    return index;
}

function FindRuleById(ruleId: string): ReportingDescriptor {

    for (let i = 0; i < DefaultMsRules.length; i++) {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (ruleId == DefaultMsRules[i].id) {
            return DefaultMsRules[i];
        }
    }

    return {
        id: ruleId,
        shortDescription: {
            text: 'This is a custom rule.'
        },
        properties: {
            category: 'Microsoft.Custom'
        }
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findLevel(ruleId: string): "none" | "note" | "warning" | "error" {
    return 'warning'
}

export const DefaultMsRules: ReportingDescriptor[] = [
    {
        id: 'Microsoft.Rules.Data.SR0001',
        shortDescription: {
            text: 'One or more of your stored procedures, views, or table-valued functions contains SELECT *.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193296(v=vs.100)',
        properties: {
            category: 'Microsoft.Design'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0008',
        shortDescription: {
            text: 'Your code contains an @@IDENTITY call.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd172121(v=vs.100)',
        properties: {
            category: 'Microsoft.Design'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0009',
        shortDescription: {
            text: 'One or more data types of variable length have a length of 1 or 2.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193263(v=vs.100)',
        properties: {
            category: 'Microsoft.Design'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0010',
        shortDescription: {
            text: 'One or more joins between tables and views are using deprecated syntax (such as =, *=, or =* in a WHERE clause) instead of current syntax.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd172122(v=vs.100)',
        properties: {
            category: 'Microsoft.Design'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0013',
        shortDescription: {
            text: 'Your output parameters are not initialized in all possible code paths throughout a stored procedure or function.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd172136(v=vs.100)',
        properties: {
            category: 'Microsoft.Design'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0014',
        shortDescription: {
            text: 'The data type for a column, variable, or parameter is being converted implicitly to another data type.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193269(v=vs.100)',
        properties: {
            category: 'Microsoft.Design'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0011',
        shortDescription: {
            text: 'The name of at least one database object contains at least one special character.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd172134(v=vs.100)',
        properties: {
            category: 'Microsoft.Naming'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0012',
        shortDescription: {
            text: 'The name of a user-defined type includes a reserved word.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193421(v=vs.100)',
        properties: {
            category: 'Microsoft.Naming'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0016',
        shortDescription: {
            text: 'One or more of your stored procedures has sp_ as a prefix.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd172115(v=vs.100)',
        properties: {
            category: 'Microsoft.Naming'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0004',
        shortDescription: {
            text: 'An IN predicate references a column that does not have an index.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193249(v=vs.100)',
        properties: {
            category: 'Microsoft.Performance'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0005',
        shortDescription: {
            text: 'The LIKE predicate of a WHERE clause starts with the wildcard character, \'%\'.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193273(v=vs.100)',
        properties: {
            category: 'Microsoft.Performance'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0006',
        shortDescription: {
            text: 'As part of a comparison, an expression contains a column reference.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193264(v=vs.100)',
        properties: {
            category: 'Microsoft.Performance'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0007',
        shortDescription: {
            text: 'An ISNULL function was not used in a comparison expression where a column could contain a NULL value.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193267(v=vs.100)',
        properties: {
            category: 'Microsoft.Performance'
        }
    },
    {
        id: 'Microsoft.Rules.Data.SR0015',
        shortDescription: {
            text: 'A WHERE predicate contains one or more deterministic function calls.'
        },
        helpUri: 'https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193285(v=vs.100)',
        properties: {
            category: 'Microsoft.Performance'
        }
    }
]

