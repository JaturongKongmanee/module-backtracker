var vscode = require('vscode');
var graph = require('./utils/graph');
var _ = require('lodash');

var outputChannel;

function activate(context) {

    graph.createGraph();
    
    var disposable = vscode.commands.registerCommand('extension.findReferences', () => {
        vscode.window.showInformationMessage('Find References!');

        editor = vscode.window.activeTextEditor;
        selection = editor.selection;
        
        // TODO: not works on mac when not select all word
        if (selection.isEmpty) {
            const position = editor.selection.active;
            var newPosition = position.with(position.line, 0);
            var newSelection = new vscode.Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }

        var text = editor.document.getText(selection);
        const currentFile = vscode.window.activeTextEditor.document.fileName + `!${text}`;

        if (!outputChannel)
            outputChannel = vscode.window.createOutputChannel('module-backtracker');

        outputChannel.clear();
        outputChannel.appendLine(`References for: ${text}`);
        const g = graph.getGraph();
        if (currentFile in g && _.size(g[currentFile].isRequired)) {
            g[currentFile].isRequired.forEach((data, i) => {
                outputChannel.appendLine(`#${i+1} ${data.uri}#${data.lineNumber}`);
            });
        }else{
            outputChannel.appendLine('0 references');
        }

        outputChannel.show(true);
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
}


exports.deactivate = deactivate;