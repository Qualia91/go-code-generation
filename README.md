# go-code-generation README

This is an Extension to generate some boilerplate code for you Go projects. Its currently under development.

## Features

Currently Supported Generation:

- Constructors
- Getters
- Setters
- Interface Implementation

## Usage

There commands currently available are:

- **Go: Class Generation:** This allows you to generate a constructor, getters and setters for a Go struct.
- **Go: Interface Implementation:** This allows you to generate methods of an interface found in the currently open file for an object of your choosing.

## Example

Say you have the following code in you Go file:

```go
package main

type object struct {
    variableone int
    variabletwo, variable3 string
}

type objectinterface interface {
    methodone()
    methodtwo(input int)
    methodthree(inputone, inputtwo string) float32
}
```
We can implement a constructor for `Object`, and getters and setters for `variableOne`, `variableTwo` and `variableThree` by:

- Opening the command pallet
- Searching for and selecting `Go: Class Generation`
- Selecting from the dropdown menu all the generated code you want
- Pressing enter

The following code will be generated:

```go

// Constructor for object
func Newobject(variableone int, variabletwo string, variable3 string) *object {
	o := new(object)
	o.variableone = variableone
	o.variabletwo = variabletwo
	o.variable3 = variable3
	return o
}

// Getter method for the field variableone of type int in the object object
func (o *object) Variableone() int {		
	return o.variableone
}

// Setter method for the field variableone of type int in the object object
func (o *object) SetVariableone(variableone int) {		
	o.variableone = variableone
}

// Getter method for the field variabletwo of type string in the object object
func (o *object) Variabletwo() string {		
	return o.variabletwo
}

// Setter method for the field variabletwo of type string in the object object
func (o *object) SetVariabletwo(variabletwo string) {		
	o.variabletwo = variabletwo
}

// Getter method for the field variable3 of type string in the object object
func (o *object) Variable3() string {		
	return o.variable3
}

// Setter method for the field variable3 of type string in the object object
func (o *object) SetVariable3(variable3 string) {		
	o.variable3 = variable3
}
```

Next, we can make `object` implement `objectinterface` by:

- Opening command pallet
- Searching and selecting `Go: Interface Implementation`
- Typing in the object name you wish to implement the interface and press enter. In our example, this is `object`
- Select the interface from the drop down menu and press ok

The following code will be generated:

```go
// Implements objectinterface
// TODO: Comment Here
func (object *object) methodone()  {		
	// Put code here
}

// Implements objectinterface
// TODO: Comment Here
func (object *object) methodtwo(input int)  {		
	// Put code here
}

// Implements objectinterface
// TODO: Comment Here
func (object *object) methodthree(inputone string, inputtwo string)  float32 {		
	// Put code here
}
```

