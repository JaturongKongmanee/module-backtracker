var fs = require('fs');
var path = require('path');
var pathService = require('./utils/pathService');
var vscode = require('vscode');
var _ = require('lodash');

var graph = {};

function activate(context) {
    var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        vscode.window.showInformationMessage('Hello World!');  

    const rootPath = vscode.workspace.rootPath;

    fromDir(rootPath, /\.js$/, (from) => {
        readInFile(from, (err, data) => {
            buildGraph(from, err, data);
        });
    });
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
                //console.log(matchedImport);
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
                            graph[to[j]].isRequired.push(from);
                        } else {
                            graph[to[j]] = {
                                isRequired: [from],
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