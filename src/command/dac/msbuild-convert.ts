import { parseString } from "xml2js";
import { Artifact, ReportingDescriptor, Run, Sarif } from "../sarif/sarif2";
import { CodeAnalysisResult, Problem } from "./CodeAnalysisResult";

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
                        name: "MSBuild",
                        informationUri: "https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild?view=vs-2022",
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

        run.results?.push(
            {
                level: "warning",
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

    rules.push(
        {
            id: ruleId,
            shortDescription: {
                text: "Avoid using types of variable length that are size 1 or 2"
            },
            helpUri: "https://docs.microsoft.com/en-us/previous-versions/visualstudio/visual-studio-2010/dd193263(v=vs.100)",
            properties: {
                category: "Microsoft.Design"
            }
        }
    );

    return rules.length;
}

function findOrCreateArtifact(artifacts: Artifact[], sourceFile: string): number {

    for (let i = 0; i < artifacts.length; i++) {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (sourceFile == artifacts[i].location?.uri) {
            return i;
        }
    }

    artifacts.push(
        {
            location: {
                uri: sourceFile
            }
        }
    );

    return artifacts.length;
}

