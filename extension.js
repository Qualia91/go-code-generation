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

	// generate getters, setters and constructor
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

	// generate interface methods
	let goCodeGenInterface = vscode.commands.registerCommand('go-code-generation.interface', function () {

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

		const regex = /type +([^ ]+) +interface {(.+?(?=}))}/gs;

		// look for interface
		var interface_dictionary = getInterface(file_text, regex)

		createQuickPickBoxInterface(interface_dictionary)

		
	});
	
	// generate ServeHTTP function for object
	let goCodeGenServeHTTP = vscode.commands.registerCommand('go-code-generation.servehttp', function () {

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

		createQuickPickBoxServeHTTP(struct_dictionary)

		
	});

	context.subscriptions.push(goCodeGen);

	context.subscriptions.push(goCodeGenInterface);

	context.subscriptions.push(goCodeGenServeHTTP);
}

function createQuickPickBoxServeHTTP(struct_dict) {

	var http_methods = [
		"Connect",
		"Get",
		"Post",
		"Put",
		"Patch",
		"Delete",
		"Head",
		"Options",
		"Trace"
	]

	var pickable_names = []
	for (const [struct_name, field_dict] of Object.entries(struct_dict)) {
	
		var con_string = struct_name
		pickable_names.push(con_string)

	}
	
	let objectName = ""

	vscode.window.showQuickPick(pickable_names, {canPickMany: false, placeHolder: "Enter Object Type you wish to use for the Handler"})
	.then(value => {
		objectName = value
	})
	.then(() => {
		vscode.window.showQuickPick(http_methods, {canPickMany: true, placeHolder: "Select what REST functions you would like implemented"}).then(items => {

			if (items != null) {
				insertText(createServeHTTPFunction(objectName, items))
			}

		})
	})
}

function createQuickPickBoxInterface(interface_dict) {

	var pickable_names = []
	for (const [struct_name, field_dict] of Object.entries(interface_dict)) {
	
		var con_string = struct_name
		pickable_names.push(con_string)
		
	}
	
	let objectName = ""

	vscode.window.showInputBox({ prompt: "Enter Object Type you wish to use for Implementation"})
	.then(value => {
		objectName = value
	})
	.then(() => {
		vscode.window.showQuickPick(pickable_names, {canPickMany: true, placeHolder: "Select the interfaces you wish to implement"})
		.then(items => {

			if (items != null) {
				items.reverse().forEach(item => {
					insertText(createInterface(item, interface_dict[item], objectName))
				});
			}

		})
	})

}

function createQuickPickBox(struct_dict) {

	// create a list of pickable names of the following format:
	// <Struct Name>: Get <Struct Field> (<Field type>)
	// <Struct Name>: Set <Struct Field> (<Field type>)
	var pickable_names = []
	for (const [struct_name, field_dict] of Object.entries(struct_dict)) {
	
		var con_string = struct_name + " Constructor"
		var builder_string = struct_name + " Builder"
		pickable_names.push(con_string)
		pickable_names.push(builder_string)
		
		for (const [field_name, field_type] of Object.entries(field_dict)) {

			var get_string = struct_name + " Get " + field_name + " ( " + field_type + " )"
			var set_string = struct_name + " Set " + field_name + " ( " + field_type + " )"
			
			pickable_names.push(get_string)
			pickable_names.push(set_string)

		}

	}
	

	vscode.window.showQuickPick(pickable_names, {canPickMany: true, placeHolder: "Select what you would like to generate"}).then(items => {

		if (items != null) {
			items.reverse().forEach(item => {
			
				var split = item.split(/\s+/)

				if (split[1] == "Constructor") {
					insertText(createConstructor(split[0], struct_dict[split[0]]))
				} else if (split[1] == "Builder") {
					insertText(createBuilder(split[0], struct_dict[split[0]]))
				} else if (split[1] == "Get") {
					insertText(createGet(lower_case(split[0][0]), split[0], split[2], split[4]))
				} else {
					insertText(createSet(lower_case(split[0][0]), split[0], split[2], split[4]))
				}
			});
		}

	})
}

function createInterface(name, methods, objectName) {

	var interfaces = ""

	methods.forEach(method => {

		// need to add variable names to method
		// start by getting everything between the brackets of the method
		var matched = method[0].match(/\((.+?(?=))\)/s)

		// if matched is empty, the function has no inputs and so carry on as usual
		// else, we need to add variables into signature
		if (matched !== null && matched.length > 0) {


			// get everything up to first ( of method
			method[0] = method[0].split("(")[0].concat("(")

			// then split by commas to get multiple inputs
			var currentMatches = matched[1].trim().split(",")

			// we need to cover the case where a few variables of the same type are init together
			// this list will create a list of variables with no type.
			// if it gets to a type eventually, the list will be added
			// if it doesnt, the list will be added as types
			var variable_list = []

			// overwrite method string as we will be creating a new one
			// iterate over matches
			currentMatches.forEach(currentMatch => {
				
				// trim whitespace
				currentMatch = currentMatch.trim()
				
				// check if variables in method definition has a variable name
				// this can be done by splitting on whitespace and checking for array bigger than 1
				if (currentMatch.split(/\s+/).length > 1) {
					var var_type = currentMatch.split(/\s+/)[1].trim() 
					// if it has variable names, just add this on normally
					// along with the list of variables collected so far without types
					variable_list.forEach(variable => {
						method[0] = method[0].concat(variable).concat(" ").concat(var_type).concat(", ")
					})
					method[0] = method[0].concat(currentMatch).concat(", ")
					// now clear the list
					variable_list = []
				} else {
					// if it doesn't have variable name, add it to the list
					variable_list.push(currentMatch)
				}
			});

			// if at this point there are variables in variable_list, iterate over and add as if they are types
			variable_list.forEach(variable => {
				method[0] = method[0].concat(lower_case(variable)).concat(" ").concat(variable).concat(", ")
			})

			// remove trailing comma
			if (method[0] !== "") {
				method[0] = method[0].substring(0, method[0].length - 2)
			}

			// now add trailing )
			method[0] = method[0].concat(")")
		}
		

		interfaces = interfaces.concat(`

// Implements <INTERFACE_NAME>
// TODO: Comment Here
func (<OBJ_NAME> *<OBJ_TYPE>) <METHOD_NAME> <RETURN_TYPE> {		
	// Put code here
}`);

		interfaces = interfaces.replace(/<OBJ_NAME>/g, lower_case(objectName)).replace(/<OBJ_TYPE>/g, objectName).replace(/<INTERFACE_NAME>/g, name).replace(/<METHOD_NAME>/g, method[0]).replace(/<RETURN_TYPE>/g, method[1])
	});

	return interfaces

}

function createBuilder(object_name, field_dict) {
	var cons = `

// Builder Object for <OBJ_NAME>
type <OBJ_NAME>Builder struct {
	<PARAMS>
}

// Constructor for <OBJ_NAME>Builder
func New<OBJ_NAME>Builder() *<OBJ_NAME>Builder {
	o := new(<OBJ_NAME>Builder)
	return o
}

// Build Method which creates <OBJ_NAME>
func (b *<OBJ_NAME>Builder) Build() *<OBJ_NAME> {
	o := new (<OBJ_NAME>)
<PARAM_INIT>\treturn o
}

<BUILDER_SETTERS>
`

	var params = ""
	var inits = ""
	var builder_setters = ""

	// iterate over fields and make params, inits and builder setters
	for (const [field_name, field_type] of Object.entries(field_dict)) {

		params = params.concat(field_name).concat(" ").concat(field_type).concat("\n\t")
		inits = inits.concat("\to.").concat(field_name).concat(" = b.").concat(field_name).concat("\n")	

		var current_builder_setter = `
// Builder method to set the field <FIELD_NAME> in <OBJ_NAME>Builder
func (b *<OBJ_NAME>Builder) <FIELD_NAME_CAP>(v <FIELD_TYPE>) *<OBJ_NAME>Builder {
	b.<FIELD_NAME> = v
	return b
}

		`

		// replace field information
		current_builder_setter = current_builder_setter
			.replace(/<FIELD_NAME>/g, field_name)
			.replace(/<FIELD_NAME_CAP>/g, capitalize(field_name))
			.replace(/<FIELD_TYPE>/g, field_type)

		// then add to build setters var
		builder_setters = builder_setters.concat(current_builder_setter)

	}

	return cons
			.replace(/<BUILDER_SETTERS>/g, builder_setters)
			.replace(/<OBJ_NAME>/g, object_name)
			.replace(/<PARAMS>/g, params)
			.replace(/<PARAM_INIT>/g, inits)
}

function createServeHTTPFunction(object_name, http_methods) {
	var cons = `

// Serve HTTP Function to Implement RESTfull API
func (h <OBJ_NAME>) ServeHTTP(rw http.ResponseWriter, r *http.Request) {

	switch r.Method {
<CASE_STATEMENTS>	default:
		rw.WriteHeader(http.StatusMethodNotAllowed)
	}
}`

	var methods = ""

	http_methods.forEach(method_name => {

		methods = methods.concat(`	case http.Method<METHOD_NAME>:

		rw.WriteHeader(http.StatusOK)
`).replace(/<METHOD_NAME>/, method_name)

	});


	return cons.replace(/<OBJ_NAME>/g, object_name).replace(/<CASE_STATEMENTS>/g, methods)
}

function createConstructor(object_name, field_dict) {
	var cons = `

// Constructor for <OBJ_NAME>
func New<OBJ_NAME>(<PARAMETERS>) *<OBJ_NAME> {
	o := new(<OBJ_NAME>)
<PARAM_INIT>\treturn o
}`

	var params = ""
	var inits = ""

	for (const [field_name, field_type] of Object.entries(field_dict)) {

		params = params.concat(field_name).concat(" ").concat(field_type).concat(", ")
		inits = inits.concat("\to.").concat(field_name).concat(" = ").concat(field_name).concat("\n")	

	}

	// if params is not empty, remove last 2 characters
	if (params !== "") {
		params = params.substring(0, params.length - 2)
	}

	return cons.replace(/<OBJ_NAME>/g, object_name).replace(/<PARAMETERS>/g, params).replace(/<PARAM_INIT>/g, inits)
}

function createGet(object_name, object_type, field_name, field_type) {
	var getter = `

// Getter method for the field <FIELD_NAME> of type <FIELD_TYPE> in the object <OBJ_TYPE>
func (<OBJ_NAME> *<OBJ_TYPE>) <FIELD_NAME_CAP>() <FIELD_TYPE> {		
	return <OBJ_NAME>.<FIELD_NAME>
}`	
	return getter.replace(/<OBJ_NAME>/g, object_name).replace(/<OBJ_TYPE>/g, object_type).replace(/<FIELD_NAME_CAP>/g, capitalize(field_name)).replace(/<FIELD_NAME>/g, field_name).replace(/<FIELD_TYPE>/g, field_type)
}

function createSet(object_name, object_type, field_name, field_type) {
	var setter = `

// Setter method for the field <FIELD_NAME> of type <FIELD_TYPE> in the object <OBJ_TYPE>
func (<OBJ_NAME> *<OBJ_TYPE>) Set<FIELD_NAME_CAP>(<FIELD_NAME> <FIELD_TYPE>) {		
	<OBJ_NAME>.<FIELD_NAME> = <FIELD_NAME>
}`	
	return setter.replace(/<OBJ_NAME>/g, object_name).replace(/<OBJ_TYPE>/g, object_type).replace(/<FIELD_NAME_CAP>/g, capitalize(field_name)).replace(/<FIELD_NAME>/g, field_name).replace(/<FIELD_TYPE>/g, field_type)
}

function getInterface(file_text, regex) {
	// get all interfaces
	var all_matched = file_text.matchAll(regex)

	var interface_dictionary = {}

	for (const iterator of all_matched) {

		// split matched string into a list of lines
		var interface_contents_lines = iterator[2].split("\n")

		// create method dictionary
		var method_list = []

		interface_contents_lines.forEach(line => {

			if (line != "") {
				// trip whitespace
				line = line.trim()

				var method = [] 
					
				var split_line = line.split(")")

				var outputs = line.substring(line.indexOf(')')+1)
				method.push(split_line[0].concat(")"))

				if (outputs !== "") {
					method.push(outputs.trim())
				} else {
					method.push("")
				}

				method_list.push(method)

			}

		});

		interface_dictionary[iterator[1]] = method_list

	}
	
	return interface_dictionary
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
				// 4 cases for fields
				// 1) Single variable per line
				// 2) Multiple variable declaration in one line
				// 3) Embedded types
				// 4) Field name is capitalized and so public -  no need for getter

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
								// check if field is private
								if (isPrivate(split_by_comma_elem)) {
									field_dict[split_by_comma_elem] = type
								}
							}
						});
					}
				} 
				// now check for single variable with splitting on whitespace
				else if (line.split(/\s+/).length == 2) {						
					var split_line = line.split(/\s+/)
					// check if private
					if (isPrivate(split_line[0])) {
						field_dict[split_line[0]] = split_line[1]
					}
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

function isPrivate(word) {
	return word.charAt(0) !== word.charAt(0).toUpperCase()
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
	//editor.insertSnippet(snippet, editor.selection.end)
	editor.insertSnippet(snippet, editor.document.positionAt(editor.document.getText().length))
	
}

function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1)
}

function lower_case(s) {
	return s.charAt(0).toLowerCase() + s.slice(1)
}
