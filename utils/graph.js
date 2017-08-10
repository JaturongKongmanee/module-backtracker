const vscode = require('vscode');
const path = require('path');
const _ = require('lodash');
const fileService = require('./fileService');

var _graph = {};
var _filesCount = 0;
var _statusBarItem;
const _regexImport = /import\s*\{(.*)\}\s*from\s*['"](.*)['"]/;

const processFile = (currentFileName, err, data) => {
    if (_filesCount > 0 && !_statusBarItem){
        _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        _statusBarItem.text = 'mb-init ..';
        _statusBarItem.show();
    }

    if (_.size(data)) {
        lines = data.split('\n');
            //const regexRequire = /require\s*\(['"](.*)['"]\)/;

        for (let i = 0; i < lines.length; i++){
            //var matchedRequire = regexRequire.exec(lines[i]);
            const importLineMatch = _regexImport.exec(lines[i]);

            if (importLineMatch) {
                const references = fileService.getAbsolutePathFromImport(currentFileName, importLineMatch[1], importLineMatch[2]);
                if(!references) continue;
                
                if (currentFileName in _graph) {
                    _graph[currentFileName].requireList = _graph[currentFileName].requireList.concat(references);
                } else {
                    _graph[currentFileName] = {
                        isRequired: [],
                        requireList: references
                    };
                }

                for (let j=0; j < references.length; j++){
                    if (references[j] in _graph) {
                        _graph[references[j]].isRequired.push({
                            uri: vscode.Uri.file(from),
                            lineNumber: i + 1
                        });
                    } else {
                        _graph[references[j]] = {
                            isRequired: [{
                                uri: vscode.Uri.file(currentFileName),
                                lineNumber: i + 1
                            }],
                            requireList: []
                        };
                    }
                }
            }
        }
    }
    
    // TODO: find better way to check if graph initializing is done
    if(--_filesCount === 0){
        if (!_statusBarItem) 
            _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        _statusBarItem.text = 'mb-init .. done';
        _statusBarItem.show();
        console.log(_graph);
    }
};


exports.createGraph = () => {
    _graph = {};
    
    _filesCount = fileService.listAllFiles(vscode.workspace.rootPath, /\.js$/, processFile);
}

exports.getGraph = () => _graph;

