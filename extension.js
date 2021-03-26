'use strict'

const { isTemplateSpan } = require('typescript');
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
	let goCodeGen = vscode.commands.registerCommand('go-code-generation.gen', function () {

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
		var struct_dictionary = getStructs(file_text, regex)

		createQuickPickBox(struct_dictionary)

		
	});

	context.subscriptions.push(goCodeGen);

}

function createQuickPickBox(struct_dict) {

	// create a list of pickable names of the following format:
	// <Struct Name>: Get <Struct Field> (<Field type>)
	// <Struct Name>: Set <Struct Field> (<Field type>)
	var pickable_names = []
	for (const [struct_name, field_dict] of Object.entries(struct_dict)) {
	
		for (const [field_name, field_type] of Object.entries(field_dict)) {

			var get_string = struct_name + " Get " + field_name + " ( " + field_type + " )"
			var set_string = struct_name + " Set " + field_name + " ( " + field_type + " )"
			
			pickable_names.push(get_string)
			pickable_names.push(set_string)

		}

	}
	

	vscode.window.showQuickPick(pickable_names, {canPickMany: true, placeHolder: "Select you getters and/or setters"}).then(items => {

		if (items != null) {
			items.forEach(item => {
			
				var split = item.split(/\s+/)

				if (split[1] == "Get") {
					insertText(createGet(lower_case(split[0][0]), split[0], split[2], split[4]))
				} else {
					insertText(createSet(lower_case(split[0][0]), split[0], split[2], split[4]))
				}
			});
		}

	})
}

function createGet(object_name, object_type, field_name, field_type) {
	var getter = `

// Getter method for the field <FIELD_NAME> of type <FIELD_TYPE> in the object <OBJ_TYPE>
func (<OBJ_NAME> *<OBJ_TYPE>) <FIELD_NAME>() <FIELD_TYPE> {		
	return <OBJ_NAME>.<FIELD_NAME>
}`	
	return getter.replace(/<OBJ_NAME>/g, object_name).replace(/<OBJ_TYPE>/g, object_type).replace(/<FIELD_NAME>/g, field_name).replace(/<FIELD_TYPE>/g, field_type)
}

function createSet(object_name, object_type, field_name, field_type) {
	var setter = `

// Setter method for the field <FIELD_NAME> of type <FIELD_TYPE> in the object <OBJ_TYPE>
func (<OBJ_NAME> *<OBJ_TYPE>) Set<FIELD_NAME>(<FIELD_NAME> <FIELD_TYPE>) {		
	<OBJ_NAME>.<FIELD_NAME> = <FIELD_NAME>
}`	
	return setter.replace(/<OBJ_NAME>/g, object_name).replace(/<OBJ_TYPE>/g, object_type).replace(/<FIELD_NAME>/g, field_name).replace(/<FIELD_TYPE>/g, field_type)
}


function getStructs(file_text, regex) {
	// get all structs
	var all_matched = file_text.matchAll(regex)

	var struct_dictionary = {}

	for (const iterator of all_matched) {

		// split matched string into a list of lines
		var struct_contents_lines = iterator[2].split("\n")

		// create struct field dictionary
		var field_dict = {}

		struct_contents_lines.forEach(line => {

			if (line != "") {
				// trip whitespace
				line = line.trim()

				// get fields
				// 3 cases for fields
				// 1) Single variable per line
				// 2) Multiple variable declaration in one line
				// 3) Embedded types

				// first check for multiple variables with searching for comma
				if (line.includes(",")) {					
					// split on commas and whitespace
					var split_line = line.split(/\s+/);

					// there doesn't have to be space after commas
					// the last value in this array will always be the type though
					var type = split_line[split_line.length - 1]

					// iterate over split_line up to penultimate value, split on commas, and add all to dictionary 
					for (let split_line_index = 0; split_line_index < split_line.length - 1; split_line_index++) {
						var tmp = split_line[split_line_index].split(",")
						tmp.forEach(split_by_comma_elem => {
							if (split_by_comma_elem != "") {
								field_dict[capitalize(split_by_comma_elem)] = type
							}
						});
					}
				} 
				// now check for single variable with splitting on whitespace
				else if (line.split(/\s+/).length == 2) {						
					var split_line = line.split(/\s+/)
					field_dict[capitalize(split_line[0])] = split_line[1]
				}
				// else it must be embedded type
				else {
					// don't think we do anything for this as its embedded type should provide everything
				}
			}

		});

		struct_dictionary[iterator[1]] = field_dict

	}
	
	return struct_dictionary
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

let insertText = (value) => {
	let editor = vscode.window.activeTextEditor

	if (!editor) {
		vscode.window.showErrorMessage("Can't insert text, no file is open")
	}

	var snippet = new vscode.SnippetString(value)
	editor.insertSnippet(snippet, editor.selection.end)
	
}

function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1)
}

function lower_case(s) {
	return s.charAt(0).toLowerCase() + s.slice(1)
}
