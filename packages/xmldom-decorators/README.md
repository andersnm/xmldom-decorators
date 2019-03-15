# xmldom-decorators - TypeScript decorators and (de-)serializer for xmldom

## Install

```
npm install xmldom-decorators
```

Enable emitting decorator metadata in tsconfig.json:

```
{
  "compilerOptions": {
    ....
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Example

Given a TypeScript class defining the XML schema:

```typescript
@XMLRoot()
export class MyXmlType {
	@XMLAttribute()
	a: number = 0;

	@XMLElement()
	b: string = "";

	@XMLArray({itemTypes: [{itemName: "v", itemType: () => Number}]})
	n: number[] = [];
}
```

### Serialize JavaScript objects to XML

```typescript
const data: MyXmlType = {
	a: 1,
	b: "c",
	n: [1,2,3]
};

const serializer = new XMLDecoratorSerializer();
const xml = serializer.serialize(data, MyXmlType);
```

### Deserialize XML to JavaScript objects:

```typescript
var xml = `<MyXmlType a="1">
	<b>c</b>
	<n>
		<v>1</v>
		<v>2</v>
		<v>3</v>
	</n>
</MyXmlType>`;

const deserializer = new XMLDecoratorDeserializer();
const data = deserializer.deserialize(xml, MyXmlType);
```


## Classes

### XMLDecoratorDeserializer

#### `deserialize(data: string, type: Function|Function[]): any`

Deserializes an XML string into a JavaScript object.

- `data` - XML string to deserialize.
- `type` - Must be a class or an array of classes with the `@XMLRoot` decorator.

### XMLDecoratorSerializer

#### `serialize(data: any, type: Function, defaultNSPrefixMap?: {[key: string]: string}): string`

Serializes a JavaScript object into an XML string.

- `data` - The JavaScript object to serialize.
- `type` - Must be a class with the `@XMLRoot` decorator.
- `defaultNSPrefixMap` - Optional dictionary with namespace URI as the key and prefix as the value. Overrides the default namespace prefixes (p0, p1...). All prefixes must be unique. The prefix can be an empty string for no prefix.

## Decorators

#### `@XMLRoot({name?, namespaceUri?})`

Applied to classes which define a root XML document element.

- `name: string` - The unqualified name of the root element. Default: the name of the type the decorator was applied to.

#### `@XMLElement({types: [{name?, namespaceUri?, itemType?, isType?}]})`

Applied to class members which define an XML element. Must have a value type or class type. Throws a runtime error if applied to an array type.

- `types: []` - Array of possible element types for this field. Default: one element with property name and decorated type.
- `types[].name: string` - The unqualified name of the element. Required if more than one type.
- `types[].itemType: () => Function` - Callback returning the type of the element. Required if more than one type.
- `types[].isType: (o) => Function` - Callback checking the type of a JavaScript object for serializing. Required if more than one type.

#### `@XMLAttribute({name?, namespaceUri?, factory?, type?})`

Applied to class members which define an attribute on an XML element. Must have value type. Throws a runtime error if applied to a class or an array type.

- `name: string` - The unqualified name of the attribute. Default: the name of the property the decorator was applied to.
- `factory: Tuple` - Optional. Callbacks to convert an XML attribute value to and from a JavaScript object.
- `type: Function` - Optional. The type of the attribute if it can't be derived from emitted decorator metadata.

#### `@XMLArray({name?, namespaceUri?, nested?, itemTypes: [{name?, namespaceUri?, itemType?, isType?}]})`

Applied to class members which define an array of XML elements, with or without a container XML element. Throws a runtime error if applied to a type which is not an array type.

- `name: string` - The unqualified name of the array container element. Default: the name of the property the decorator was applied to.
- `nested: boolean` - Specifies if there is a container element for the array items. Default: true.
- `itemTypes: []` - Array of possible element types in the array. Required.
- `itemTypes[].name: string` - The unqualified element name an array item. Default: the name of the item type.
- `itemTypes[].itemType: () => Function` - Callback returning the type of an array items. Required.
- `itemTypes[].isType: (o) => Function` - Callback checking the type of a JavaScript object for serializing. Required.
	
#### `@XMLText()`

Applied to class members which define the text content of an XML element.

## Limitations and notes

TypeScript's decorator metadata suffers certain limitations developers must be aware of when writing schemas,
and be able to work around if needed.

Decorator metadata cannot be attached to interfaces, so the (de)serializer is based around classes. This implies any non-optional class members must have a default value.

The following class(es) demonstrate potential pitfalls with decorators applied to class members:

```typescript
@XMLRoot()
class Test {
	// Properties without a decorator will not be (de)serialized
	notEmittedProperty: string = "";

	// The XML array itemType must be a callback which returns the array item type
	// Decorator metadata cannot directly reference types declared later in the file.
	// Decorator metadata does not have information about array item types.
	@XMLArray({itemTypes: [{itemType: () => Number}]})
	intArray: Number[] = [];

	// Optional attributes must be set explicitly (NOTE: not implemented yet)
	// Decorator metadata does have information about the '?' type modifier.
	@XMLElement({optional: true})
	value?: string;

	// Decorators applied to members with a class type declared later in the file
	// will cause a runtime error. This means ordering of classes is important,
	// and some situations require a workaround using arrays.

	// @XMLElement() <--- RUNTIME ERROR "ForwardClass is not defined"
	// forward?: ForwardClass;

	// Workaround with array still allows to (de)serialize the XML:
	@XMLArray({itemTypes: [{itemType: () => ForwardClass, nested: false}]})
	forward?: ForwardClass[];
}

class ForwardClass {
}

```

## More examples

### Parsing XML with different root elements

F.ex an API can return XML for either a message type, or an error type:

```xml
<!-- XML returned on success: -->
<message>...</message>

<!-- XML returned on error: -->
<error>...</error>
```
To handle this, either

1. Specify multiple @XMLRoot decorators and design the class to contain all fields
2. Specify separate @XMLRoot classes, and pass an array of possible types to the deserializer

### Parsing XML with attributes and text content

Given an XML like this:

```xml
<element attr="value">Hello world</element>
```

### Parsing XML with qualified names in attribute values

Given an XML like this:

```xml
<ns:element attr="ns:value" xmlns:ns="uri" />
```

### Parsing XML with significant order of child elements

Given an XML like this:

```xml
<schema>
	<element />
	<element />
	<complexType />
	<complexType />
	<simpleType />
	<simpleType />
</schema>
```



## TODO

- Allow to specify xs:integer, decimal, float on number types
- Object construction strategy
- Validate required elements/attributes
- Scheme for inheriting namespaces instead of specifying namespace everywhere
- Replace the XML parser
- xsd<->ts codegen tool
- More control over dates
- Recommendations for defaults
- Enums
- Strictness options
