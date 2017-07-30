var fs = require('fs');
var path = require('path');
var pathService = require('./utils/pathService');
var vscode = require('vscode');
var _ = require('lodash');
var os = require("os");

var graph = {};

function activate(context) {
    // var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
    //     vscode.window.showInformationMessage('Hello World!');
    const rootPath = vscode.workspace.rootPath;

    fromDir(rootPath, /\.js$/, (from) => {
        readInFile(from, (err, data) => {
            buildGraph(from, err, data);
        });
    });
    
    var disposable = vscode.commands.registerCommand('extension.findReferences', function () {
        vscode.window.showInformationMessage('Find References!');

        editor = vscode.window.activeTextEditor;
        selection = editor.selection;
        if (selection.isEmpty) {
            // the Position object gives you the line and character where the cursor is
            const position = editor.selection.active;
            var newPosition = position.with(position.line, 0);
            var newSelection = new vscode.Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }

        var text = editor.document.getText(selection);
        const currentFile = vscode.window.activeTextEditor.document.fileName + `!${text}`;

        var outputChannel = vscode.window.createOutputChannel('exit');
        outputChannel.clear();
        outputChannel.appendLine(`References for: ${text}`);
        if (_.size(graph[currentFile].isRequired)) {
            graph[currentFile].isRequired.forEach((data) => {
                outputChannel.appendLine(`${data.uri}#:${data.lineNumber}`);
            });
        }

        outputChannel.show(true);

        // console.log(results);
        // results.forEach((data) => {
        //     window.outputChannel.appendLine(data.uri);
        //     //console.log(data.uri);
        // });


        // const uri = editor.document.uri;
        // var outputChannel = vscode.window.createOutputChannel("ext");
        // outputChannel.append(`#1 ${uri}#2:3`);
        // outputChannel.show(true);


        // vscode.window.outputChannel.clear();
        // results.forEach(function (v, i, a) {
        // // due to an issue of vscode(https://github.com/Microsoft/vscode/issues/586), in order to make file path clickable within the output channel,the file path differs from platform
        // var patternA = '#' + (i + 1) + '\t' + v.uri + '#' + (1 + 1);
        // var patternB = '#' + (i + 1) + '\t' + v.uri + ':' + (1 + 1) + ':' + (1 + 1);
        // var patterns = [patternA, patternB];

        // //for windows and mac
        // var patternType = 0;
        // if (os.platform() == "linux") {
        //     // for linux
        //     patternType = 1;
        // }
        // // if (toggleURI) {
        // //     //toggle the pattern
        // //     patternType = +!patternType;
        // // }
        // vscode.window.outputChannel.appendLine(patterns[patternType]);
        //window.outputChannel.appendLine('\t' + v.label + '\n')

    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

function fromDir(startPath, filter, callback){
    if (!fs.existsSync(startPath)) {
        console.log("no dir ",startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for(var i = 0; i < files.length; i++) { 
        var from = path.join(startPath,files[i]);
        var stat = fs.lstatSync(from);

        if (stat.isDirectory()){
            fromDir(from, filter, callback);
        }
        else if (filter.test(from)) {
            callback(from);
        } 
    };
};

function readInFile(file, callback) {
    fs.readFile(file, {encoding: 'utf-8'}, callback);
};

function buildGraph(from, err, data) {
    if (_.size(data)) {     
        lines = data.split('\n');
            //const regexRequire = /require\s*\(['"](.*)['"]\)/;
            const regexImport = /import\s*\{(.*)\}\s*from\s*['"](.*)['"]/;
            
            for (var i = 0; i < lines.length; i++){
                //var matchedRequire = regexRequire.exec(lines[i]);
                var matchedImport = regexImport.exec(lines[i]);
                if (matchedImport) {
                    var to = pathService.getAbsolutePathFromImport(from, matchedImport);
                    if (from in graph) {
                        graph[from].requireList = graph[from].requireList.concat(to);
                    } else {
                        graph[from] = {
                            isRequired: [],
                            requireList: to
                        };
                    }

                    for (var j=0; j< to.length; j++){
                        if (to[j] in graph) {
                            graph[to[j]].isRequired.push({
                                uri: vscode.Uri.file(from),
                                lineNumber: i + 1
                            });
                        } else {
                            graph[to[j]] = {
                                isRequired: [{
                                    uri: vscode.Uri.file(from),
                                    lineNumber: i + 1
                                }],
                                requireList: []
                            };
                        }
                    }
                }
            }
    } else {
        console.log(err);
    }
    
    console.log(graph);
};

exports.deactivate = deactivate;