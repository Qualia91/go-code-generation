'use strict'

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "go-code-generation" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('go-code-generation.helloWorld', function () {

		// check file is open
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("No file open")
			return;
		}

		// check we have a go file open
		if (!editor.document.fileName.endsWith(".go")) {
			vscode.window.showErrorMessage("File is not a Go file")
			return;
		}

		// get all text in file
		var file_text = editor.document.getText()

		const regex = /type +([^ ]+) +struct {(.+?(?=}))}/gs;

		// look for structs
		var struct_names = funcStructs(file_text, regex)

		struct_names.forEach(value => vscode.window.showWarningMessage(value))

		
	});

	context.subscriptions.push(disposable);
}

function funcStructs(file_text, regex) {
	var all_matched = file_text.matchAll(regex)

	var struct_names = []
	var struct_contents = []

	for (const iterator of all_matched) {
		struct_names.push(iterator[1])
		struct_contents.push(iterator[2])
	}

	
	return struct_names
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
