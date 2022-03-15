---
ArtifactType: tools  
Documentation: https://github.com/yongmams/sqlproj-code-analysis-action#readme  
Language: typescript, csharp  
Platform: windows  
Tags: code analysis,sarif  
---

# SQLProj Code Analysis for GitHub Action

Use Msbuild on GitHub Action for code static analysis, and upload SARIF to GitHub code scean.  

## Limitations

The custom code is for DB150 only, unless you upgrade the SDK yourself.

## Getting Started

```
sqlproj-analysis convert -s xx.result.StaticCodeAnalysis.Results.xml -o xx.sarif
```

```
sqlproj-analysis where
```

### Prerequisites

You need install NodeJs 

### Installing

```
npm install -g sqlproj-analysis-cli
```

## Running the tests

TODO：

### End-to-end tests

TODO：

### Unit tests

TODO：

## Deployment

TODO：

## Built With

TODO：

## Contributing

Yong Ma

## Versioning and changelog

TODO：

## Authors

Yong Ma

## License

This project is licensed under the MIT - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Yong Ma
