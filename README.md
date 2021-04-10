# Go Code Generation Extension for Visual Studio Code

This is an Extension for Visual Studio Code to generate some boilerplate code for you Go projects. Its currently under development.

## Download
https://marketplace.visualstudio.com/items?itemName=bocdev.go-code-generation

## Features

Currently Supported Generation:

- Constructors
- Getters
- Setters
- Builder Pattern
- Interface Implementation
- Serve HTTP Method on an object (REST impl)

## Usage

There commands currently available are:

- **Go: Class Generation:** This allows you to generate a constructor, getters and setters, and builders for a Go struct.
- **Go: Interface Implementation:** This allows you to generate methods of an interface found in the currently open file for an object of your choosing.
- **Go: Serve HTTP Method Creation:** This allows you to select a struct, select what http request methods you wish to support in your restful api, and generate a ServeHTTP method for it.

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


If you want a builder created for the `object` struct,simple select builder in the drop down menu in the above command. The following code will be generated:

```golang

// Constructor for objectBuilder
func NewobjectBuilder() *objectBuilder {
	o := new(objectBuilder)
	return o
}

// Build Method which creates object
func (b *objectBuilder) Build() *object {
	o := new (object)
	o.variableone = b.variableone
	o.variabletwo = b.variabletwo
	o.variable3 = b.variable3
	return o
}

// Builder method to set the field variableone in objectBuilder
func (b *objectBuilder) Variableone(v int) *objectBuilder {
	b.variableone = v
	return b
}

// Builder method to set the field variabletwo in objectBuilder
func (b *objectBuilder) Variabletwo(v string) *objectBuilder {
	b.variabletwo = v
	return b
}

// Builder method to set the field variable3 in objectBuilder
func (b *objectBuilder) Variable3(v string) *objectBuilder {
	b.variable3 = v
	return b
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

To use an object as a `http.Handler`, you can auto generate the `ServeHTTP` function and choose what http requests you would like to implement in a switch statement by selecting `Go: Serve HTTP Method Creation`. It will generate the following for our object struct is all options are chosen:


```golang

// Serve HTTP Function to Implement RESTfull API
func (h object) ServeHTTP(rw http.ResponseWriter, r *http.Request) {

	switch r.Method {
	case http.MethodConnect:

		rw.WriteHeader(http.StatusOK)
	case http.MethodGet:

		rw.WriteHeader(http.StatusOK)
	case http.MethodPost:

		rw.WriteHeader(http.StatusOK)
	case http.MethodPut:

		rw.WriteHeader(http.StatusOK)
	case http.MethodPatch:

		rw.WriteHeader(http.StatusOK)
	case http.MethodDelete:

		rw.WriteHeader(http.StatusOK)
	case http.MethodHead:

		rw.WriteHeader(http.StatusOK)
	case http.MethodOptions:

		rw.WriteHeader(http.StatusOK)
	case http.MethodTrace:

		rw.WriteHeader(http.StatusOK)
	default:
		rw.WriteHeader(http.StatusMethodNotAllowed)
	}
}

```