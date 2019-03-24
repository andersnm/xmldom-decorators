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

### DeserializerContext

The attribute factory receives a DeserializerContext upon deserialization. This is primarily used to resolve QName attribute values.

#### `resolvePrefix(prefix: string): string`

Returns the namespace URI of the provided prefix. Throws if the prefix is invalid.

### SerializerContext

The attribute factory receives a SerializerContext upon serialization. This is primarily used to serialize QName attribute values.

#### `getQualifiedName(elementName: string, namespaceUri: string): string`

Returns a fully qualified element name with prefix, given the unqualified element name and a namespace URI.

## Decorators

#### `@XMLRoot({name?, namespaceUri?})`

Applied to classes which define a root XML document element.

```ts
@XMLRoot({
  // The unqualified name of the root element.
  // Default: the class name.
  name: "elementName",

  // The namespace URI of the root element.
  // Default: empty string/no namespace.
  namespaceUri: "xml-uri",
})
```

#### `@XMLElement({types: [{name?, namespaceUri?, itemType?, isType?}]})`

Applied to class members. Maps the class member to an XML element. Must have a value type or class type. Throws a runtime error if applied to an array type.

It is permitted to map multiple name/type pairs to a class member. *One of* the types will be (de)serialized. During serialization, the item type determines which XML element will be written. During deserialization, the XML element name determines which item type will be read.

```ts
@XMLElement({
  // Optional array of types to match.
  // Default: one element with the property name and decorated type.
  types: [
    {
      // The unqualified name of the element.
      // Required if more than one type. If specified, must be unique within the class.
      name: "elementName",

      // The namespace of the element.
      // Default: empty string/no namespace.
      namespaceUri: "xml-uri",

      // Callback returning the type of the element.
      // Required if more than one type. If specified, must be unique within the types array.
      itemType: () => String,

      // Callback checking the type of a JavaScript object for serializing.
      // Required if more than one type and the data items are not constructed from the item type (e.g object literals).
      isType: (o) => o.constructor === String
    }
  ]
})
```

#### `@XMLAttribute({name?, namespaceUri?, factory?, type?})`

Applied to class members which define an attribute on an XML element. Must have value type. Throws a runtime error if applied to a class or an array type.

```ts
@XMLAttribute({
  // The unqualified name of the attribute.
  // Default: the property name. If specified, must be unique within the class.
  name: "elementName",

  // The namespace URI of the attribute.
  // Default: null/belongs to the element.
  namespaceUri: "xml-uri",

  // Tuple with callbacks to convert an XML attribute value to and from a JavaScript object.
  // Optional. Mutually exclusive with the type.
  factory: [
    // Callback to convert from an attribute value to a JavaScript object.
    (value: string, ctx: DeserializerContext) => new Mine(value),

    // Callback to convert from a JavaScript object to an attribute value.
    (value: any, ctx: SerializerContext) => value.toString()
  ],

  // The type of the attribute if it can't be derived from emitted decorator metadata.
  // Optional. Mutually exclusive with the factory.
  type: String,
})
```

#### `@XMLArray({name?, namespaceUri?, nested?, itemTypes: [{name?, namespaceUri?, itemType?, isType?}]})`

Applied to class members which define an array of XML elements, with or without a container XML element. Throws a runtime error if applied to a type which is not an array type.

It is permitted to map multiple name/type pairs to an array class member. *Any of* the types will be (de)serialized. During serialization, the item type determines which XML element will be written. During deserialization, the XML element name determines which item type will be read.

```ts
@XMLArray({
  // Specifies if there is a container element for the array items.
  // Default: true.
  nested: true,

  // The unqualified name of the array container element.
  // Default: the name of the property the decorator was applied to. Ignored if not nested. If specified, must be unique within the class.
  name: "containerName",

  // The namespace URI of the array container element.
  // Default: empty string/no namespace. Ignored if not nested.
  namespaceUri: "xml-uri",

  // Array of possible element types to match in the array.
  // Required.
  itemTypes: [
    {
      // The unqualified name of the array item element.
      // If nested, must be unique within the itemTypes array if specified, otherwise defaults to the name of the item type.
      // If not nested, must be unique within the class if specified, otherwise defaults to the name of the property.
      name: "elementName",

      // The namespace URI of the array item element. Default: empty string/no namespace.
      namespaceUri: "xml-uri",

      // Callback returning the type of an array item.
      // Required. Must be unique within the itemTypes array.
      itemType: () => String,

      // Callback checking the type of a JavaScript object for serializing.
      // Required if more than one type and the data items are not constructed from the item type (e.g object literals).
      isType: (o) => o.constructor === String
    }
  ]
})
```

#### `@XMLText({type?})`

Applied to a class member which define the text content of an XML element. There can only be one @XMLText() decorator per class.


```ts
@XMLText({
  // Optional override of the decorated type.
  type: Number
})
```

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
	@XMLArray({nested: false, itemTypes: [{itemType: () => ForwardClass}]})
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

Create a new class and add separate members decorated with @XMLAttribute and @XMLText.

### Parsing XML with qualified names in attribute values

Given an XML like this:

```xml
<ns:element attr="ns:value" xmlns:ns="uri" />
```

See the xmldom-decorators-cli project's XSD parser.

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

See the xmldom-decorators-cli project's XSD parser.

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
