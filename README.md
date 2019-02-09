# xmldom-decorators - TypeScript decorators and (de-)serializer for xmldom

## Example

Given a TypeScript class defining the XML schema:

```typescript
@XMLRoot()
export class MyXmlType {
	@XMLAttribute()
	a: number = 0;

	@XMLElement()
	b: string = "";

	@XMLArray({itemName: "v", itemType: () => Number})
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
var xml = `<MyXml a="1">
	<b>c</b>
	<n>
		<v>1</v>
		<v>2</v>
		<v>3</v>
	</n>
</MyXml>`;

const deserializer = new XMLDecoratorDeserializer();
const data = deserializer.deserialize(xml, MyXmlType);
```


## Classes

### XMLDecoratorDeserializer

#### `deserialize(data: string, type: Function): any`

Deserializes an XML string into a JavaScript object. The type parameter must be a class with the `@XMLRoot` decorator.

### XMLDecoratorSerializer

#### `serialize(data: any, type: Function, defaultNSPrefixMap?: {[key: string]: string}): string`

Serializes a JavaScript object into an XML string.

- `type` - Must be a class with the `@XMLRoot` decorator.
- `defaultNSPrefixMap` - Optional dictionary with namespace URI as the key and prefix as the value. Overrides the default namespace prefixes (p0, p1...). All prefixes must be unique. The prefix can be an empty string for no prefix.

## Decorators

#### `@XMLRoot({name?, namespaceUri?})`

Applied to classes which define a root XML document element.

#### `@XMLElement({name?, namespaceUri?})`

Applied to class members which define an XML element. Must have a value type or class type. Throws a runtime error if applied to an array type.

#### `@XMLAttribute({name?, namespaceUri?})`

Applied to class members which define an attribute on an XML element. Must have value type. Throws a runtime error if applied to a class or an array type.

#### `@XMLArray({name?, namespaceUri?, itemName?, itemType, nested?})`

Applied to class members which define an array of XML elements, with or without a container XML element. Throws a runtime error if applied to a type which is not an array type.

- `name: string` - The name of the array element(s). Default: the name of the property the decorator was applied to
- `itemName: string` - The name of array item elements inside the container element, if there is one. Default: the name of the item type
- `itemType: () => Function` - Callback returning the type of array items. Required
- `nested: boolean` - Specifies if there is a container element for the array items. Default: true
	
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
	@XMLArray({itemType: () => Number})
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
	@XMLArray({itemType: () => ForwardClass, nested: false})
	forward?: ForwardClass[];
}

class ForwardClass {
}

```

## TODO

- Allow to specify xs:integer, decimal, float on number types
- Separate schemas and decorator options
- Object construction strategy
- Validate required elements/attributes
- Scheme for inheriting namespaces instead of specifying namespace everywhere
- Replace the XML parser
- Base classes / inheritance
- xsd<->ts codegen tool
- More control over dates
- Recommendations for defaults
- Enums
- Strictness options
