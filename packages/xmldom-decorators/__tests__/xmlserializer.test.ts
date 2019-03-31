import { XMLRoot, XMLElement, XMLAttribute, XMLArray, XMLText } from '../src';
import { XMLDecoratorSerializer, SerializerContext } from '../src';
import { XMLDecoratorDeserializer, DeserializerContext } from '../src';

export interface QName {
    localName: string;
    namespaceUri: string;
}

function QNameReader(value: string, ctx: DeserializerContext): QName {
    const cpos = value.indexOf(":");
    const prefix = cpos !== -1 ? value.substr(0, cpos) : "";
    let namespaceUri = "";
    if (prefix) {
        namespaceUri = ctx.resolvePrefix(prefix);
    }

    return { localName: value.substr(cpos + 1), namespaceUri: namespaceUri };
}

function QNameWriter(value: QName, ctx: SerializerContext): string {
    return ctx.getQualifiedName(value.localName, value.namespaceUri);
}

@XMLRoot()
class EmptyRoot {
}

@XMLRoot()
class StringInRoot {
	@XMLElement()
	name: string = "";
}

@XMLRoot()
class TextInRoot {
	@XMLAttribute()
	name: string = "";

	@XMLText()
	value: string = "";
}

@XMLRoot()
class DateInRoot {
	@XMLElement()
	dateElement: Date = new Date(0);

	@XMLAttribute()
	dateAttribute?: Date;
}

@XMLRoot()
class NestedArrayInRoot {
	@XMLArray({ itemTypes: [{itemType: () => String}] })
	names: string[] = [];
}

@XMLRoot()
class FallbackTypeInRoot {
	@XMLElement({ types: [{name: "Name"}] })
	name: string = "";
}

@XMLRoot()
class OptionalTypeInRoot {
	@XMLElement()
	value1?: string;

	@XMLElement()
	value2?: string;

	@XMLArray({ itemTypes: [{ name: "value3", itemType: () => String}] })
	value3?: string[];
}

@XMLRoot()
class ComplexNestedArrayInRoot {
	@XMLArray({ itemTypes: [{ name: "DateInRoot", itemType: () => DateInRoot}] })
	dates: DateInRoot[] = [];
}

@XMLRoot()
class FlatArrayInRoot {
	@XMLArray({ nested:false, itemTypes: [{itemType: () => String}] })
	names: string[] = [];
}

@XMLRoot()
class CyclicElementType {
	@XMLArray({nested: false, itemTypes: [{itemType: () => CyclicElement}]})
	elements: CyclicElement[] = [];
}

@XMLRoot()
class CyclicElement {
	@XMLElement()
	type: CyclicElementType = new CyclicElementType();
}

@XMLRoot()
class CyclicRoot {
	@XMLElement()
	element: CyclicElement = new CyclicElement();
}

@XMLRoot({namespaceUri: "uri-test"})
class ResolveAttributePrefix {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
	name?: QName;
}

@XMLRoot({name: "main"})
class MultiRootTypeMain {
    @XMLAttribute()
	name?: string;
}

@XMLRoot({name: "error"})
class MultiRootTypeError {
    @XMLAttribute()
	message?: string;
}

@XMLRoot({name: "warning"})
class MultiRootTypeWarning {
    @XMLAttribute()
	text?: string;
}

@XMLRoot({name: "main"})
@XMLRoot({name: "error"})
@XMLRoot({name: "warning"})
class MultiRootDecorator {
    @XMLAttribute()
	name?: string;

	@XMLAttribute()
	message?: string;

	@XMLAttribute()
	text?: string;
}

@XMLRoot()
class MultiArrayItemType {
	@XMLArray({nested: false, itemTypes: [
		{name: "thing", itemType: () => ArrayThing, isType: (o) => o.hasOwnProperty("thingID")},
		{name: "stuff", itemType: () => ArrayStuff, isType: (o) => o.hasOwnProperty("stuffID")},
	]})
	elements: (ArrayThing|ArrayStuff)[] = [];
}

@XMLRoot()
class MultiArrayConstructorItemType {
	@XMLArray({nested: false, itemTypes: [
		{name: "thing", itemType: () => ArrayThing },
		{name: "stuff", itemType: () => ArrayStuff },
	]})
	elements: (ArrayThing|ArrayStuff)[] = [];
}

class ArrayThing {
	@XMLAttribute()
	thingID: string = "";
}

class ArrayStuff {
	@XMLAttribute()
	stuffID: string = "";
}

class DerivedMemberTypeBase {
	type: string = "";
}

class DerivedMemberType1 extends DerivedMemberTypeBase {
	@XMLAttribute({type: String})
	type = "type1";

	@XMLAttribute()
	name: string = "";
}

class DerivedMemberType2 extends DerivedMemberTypeBase {
	@XMLAttribute({type: String})
	type = "type2";

	@XMLAttribute()
	fieldName?: number;
}

@XMLRoot()
class DerivedMemberType {
	@XMLElement({types: [
	    {name: "thing1", itemType: () => DerivedMemberType1, isType: (o) => o.type === "type1"},
	    {name: "thing2", itemType: () => DerivedMemberType2, isType: (o) => o.type === "type2"},
	]})
	thing?: DerivedMemberTypeBase;
}

@XMLRoot()
class MultiMemberType {
	@XMLElement({types: [
		{name: "thing1", itemType: () => DerivedMemberType1, isType: (o) => o.type === "type1"},
		{name: "thing2", itemType: () => DerivedMemberType2, isType: (o) => o.type === "type2"}
	]})
	thing?: DerivedMemberType1|DerivedMemberType2;
}

describe("Decorators", () => {

	test("Empty root", () => {
		var o: EmptyRoot = {};
		const result = serialize(o, EmptyRoot);
		expect(result).toBe("<EmptyRoot/>");

		const x: any = deserialize(result, EmptyRoot);
		expect(x).toEqual(o);
	});

	test("Text in root", () => {
		const o: TextInRoot = { name: "Hello World", value: "Inner text" };
		const result = serialize(o, TextInRoot);
		expect(result).toBe('<TextInRoot name="Hello World">Inner text</TextInRoot>');

		const x: any = deserialize(result, TextInRoot);
		expect(x).toEqual(o);
	});

	test("String in root", () => {
		const o: StringInRoot = { name: "Hello World" };
		const result = serialize(o, StringInRoot);
		expect(result).toBe("<StringInRoot><name>Hello World</name></StringInRoot>");

		const x: any = deserialize(result, StringInRoot);
		expect(x).toEqual(o);
	});

	test("String with entity", () => {
		const o: StringInRoot = { name: "Hello & World" };
		const result = serialize(o, StringInRoot);
		expect(result).toBe("<StringInRoot><name>Hello &amp; World</name></StringInRoot>");

		const x: any = deserialize(result, StringInRoot);
		expect(x).toEqual(o);
	});

	test("Date", () => {
		const o: DateInRoot = { dateAttribute: new Date("2018-05-05Z"), dateElement: new Date("2018-05-05T13:14Z") };
		const result = serialize(o, DateInRoot);
		expect(result).toBe('<DateInRoot dateAttribute="2018-05-05T00:00:00.000Z"><dateElement>2018-05-05T13:14:00.000Z</dateElement></DateInRoot>');

		const x: any = deserialize(result, DateInRoot);
		expect(x).toEqual(o);
	});

	test("Nested array in root", () => {
		const o: NestedArrayInRoot = { names: [ "Hello", "World" ] };
		const result = serialize(o, NestedArrayInRoot);
		expect(result).toBe("<NestedArrayInRoot><names><String>Hello</String><String>World</String></names></NestedArrayInRoot>");

		const x: any = deserialize(result, NestedArrayInRoot);
		expect(x).toEqual(o);

		const x2: any = deserialize("<NestedArrayInRoot><names><String>Hello</String><String>World</String><NotAString>1</NotAString></names></NestedArrayInRoot>", NestedArrayInRoot);
		expect(x2).toEqual(o);
	});

	test("Fallback type in root", () => {
		const o: FallbackTypeInRoot  = { name: "test" };
		const result = serialize(o, FallbackTypeInRoot);
		expect(result).toBe("<FallbackTypeInRoot><Name>test</Name></FallbackTypeInRoot>");

		const x: any = deserialize(result, FallbackTypeInRoot);
		expect(x).toEqual(o);
	});

	test("Optional type in root", () => {
		const o: OptionalTypeInRoot  = { value2: "test" };
		const result = serialize(o, OptionalTypeInRoot);
		expect(result).toBe("<OptionalTypeInRoot><value2>test</value2></OptionalTypeInRoot>");

		const x: any = deserialize(result, OptionalTypeInRoot);
		expect(x).toEqual(o);
	});

	test("Empty nested array in root", () => {
		const o: NestedArrayInRoot = { names: [ ] };
		const result = serialize(o, NestedArrayInRoot);
		expect(result).toBe("<NestedArrayInRoot><names/></NestedArrayInRoot>");

		const x: any = deserialize(result, NestedArrayInRoot);
		expect(x).toEqual(o);
	});

	test("Complex nested array in root", () => {
		const o: ComplexNestedArrayInRoot = {
			dates: [
				{ dateAttribute: new Date("2018-02-02Z"), dateElement: new Date("2018-03-03Z") },
				{ dateAttribute: new Date("2018-04-04Z"), dateElement: new Date("2018-05-05Z") }
			]
		};
		const result = serialize(o, ComplexNestedArrayInRoot);
		expect(result).toBe('<ComplexNestedArrayInRoot><dates><DateInRoot dateAttribute="2018-02-02T00:00:00.000Z"><dateElement>2018-03-03T00:00:00.000Z</dateElement></DateInRoot><DateInRoot dateAttribute="2018-04-04T00:00:00.000Z"><dateElement>2018-05-05T00:00:00.000Z</dateElement></DateInRoot></dates></ComplexNestedArrayInRoot>');

		const x: any = deserialize(result, ComplexNestedArrayInRoot);
		expect(x).toEqual(o);
	});

	test("Flat array in root", () => {
		const o: FlatArrayInRoot = { names: [ "Hello", "World" ] };
		const result = serialize(o, FlatArrayInRoot);
		expect(result).toBe("<FlatArrayInRoot><names>Hello</names><names>World</names></FlatArrayInRoot>");

		const x: any = deserialize(result, FlatArrayInRoot);
		expect(x).toEqual(o);
	});

	test("Empty flat array in root", () => {
		const o: FlatArrayInRoot = { names: [ ] };
		const result = serialize(o, FlatArrayInRoot);
		expect(result).toBe("<FlatArrayInRoot/>");

		const x: any = deserialize(result, FlatArrayInRoot);
		expect(x).toEqual(o);
	});

	test("Cyclic types", () => {
		const o: CyclicRoot = { element: { type: { elements: [ { type: { elements: [ ]} }]} } };
		const result = serialize(o, CyclicRoot);
		expect(result).toBe("<CyclicRoot><element><type><elements><type/></elements></type></element></CyclicRoot>");

		const x: any = deserialize(result, CyclicRoot);
		expect(x).toEqual(o);
	});


	test("Resolve prefix in attribute value", () => {
		const o: ResolveAttributePrefix = { name: { localName: "test", namespaceUri: "uri-test"} };
		const result = serialize(o, ResolveAttributePrefix);
		expect(result).toBe('<p0:ResolveAttributePrefix name="p0:test" xmlns:p0="uri-test"/>');

		const x: any = deserialize(result, ResolveAttributePrefix);
		expect(x).toEqual(o);
	});

	test("Multiple root types", () => {
		var o: MultiRootTypeMain = { name: 'test' };
		const result = serialize(o, MultiRootTypeMain);
		expect(result).toBe('<main name="test"/>');

		const x: any = deserialize(result, [ MultiRootTypeMain, MultiRootTypeError, MultiRootTypeWarning ]);
		expect(x).toEqual(o);

		const y: any = deserialize('<warning />', [ MultiRootTypeMain, MultiRootTypeError, MultiRootTypeWarning ]);
		expect(y).toBeInstanceOf(MultiRootTypeWarning);

		const z: any = deserialize('<error />', [ MultiRootTypeMain, MultiRootTypeError, MultiRootTypeWarning ]);
		expect(z).toBeInstanceOf(MultiRootTypeError);
	});

	test("Multiple root decorators", () => {
		var o: MultiRootDecorator = { name: 'test' };
		// <main>
		const a = serialize(o, MultiRootDecorator, "main");
		expect(a).toBe('<main name="test"/>');
		
		const x: any = deserialize(a, MultiRootDecorator);
		expect(x).toBeInstanceOf(MultiRootDecorator);
		expect(x).toEqual(o);

		// <warning>
		const b = serialize(o, MultiRootDecorator, "warning");
		expect(b).toBe('<warning name="test"/>');

		const y: any = deserialize(b, MultiRootDecorator);
		expect(y).toBeInstanceOf(MultiRootDecorator);
		expect(y).toEqual(o);

		// <error>
		const c = serialize(o, MultiRootDecorator, "error");
		expect(c).toBe('<error name="test"/>');

		const z: any = deserialize(c, MultiRootDecorator);
		expect(z).toBeInstanceOf(MultiRootDecorator);
		expect(z).toEqual(o);
	});

	test("Array with multiple item types and isType", () => {
		const o: MultiArrayItemType = {
			elements: [
				{
					stuffID: "hello",
				},
				{
					thingID: "world",
				},
			]
		};

		const a = serialize(o, MultiArrayItemType);
		expect(a).toBe('<MultiArrayItemType><stuff stuffID="hello"/><thing thingID="world"/></MultiArrayItemType>');

		const x: any = deserialize(a, MultiArrayItemType);
		expect(x).toBeInstanceOf(MultiArrayItemType);
		expect(x).toEqual(o);
	});

	test("Array with multiple constructed item types and no isType", () => {
		const o: MultiArrayConstructorItemType = {
			elements: [
				mix(new ArrayStuff(), {
					stuffID: "hello",
				}),
				mix(new ArrayThing(), {
					thingID: "world",
				}),
			]
		};

		const a = serialize(o, MultiArrayConstructorItemType);
		expect(a).toBe('<MultiArrayConstructorItemType><stuff stuffID="hello"/><thing thingID="world"/></MultiArrayConstructorItemType>');

		const x: any = deserialize(a, MultiArrayConstructorItemType);
		expect(x).toBeInstanceOf(MultiArrayConstructorItemType);
		expect(x).toEqual(o);
	});

	test("Derived member type", () => {
		const o: DerivedMemberType = {
			thing: Object.assign<DerivedMemberType2, Partial<DerivedMemberType2>>(new DerivedMemberType2(), {
				type: "type2",
				fieldName: 7,
			}),
		};

		const a = serialize(o, DerivedMemberType);
		expect(a).toBe('<DerivedMemberType><thing2 type="type2" fieldName="7"/></DerivedMemberType>');

		const x: any = deserialize(a, DerivedMemberType);
		expect(x).toBeInstanceOf(DerivedMemberType);
		expect(x).toEqual(o);
	});

	test("Multi member type", () => {
		const o: MultiMemberType = {
			thing: Object.assign<DerivedMemberType2, Partial<DerivedMemberType2>>(new DerivedMemberType2(), {
				type: "type2",
				fieldName: 7,
			}),
		};

		const a = serialize(o, MultiMemberType);
		expect(a).toBe('<MultiMemberType><thing2 type="type2" fieldName="7"/></MultiMemberType>');

		const x: any = deserialize(a, MultiMemberType);
		expect(x).toBeInstanceOf(MultiMemberType);
		expect(x).toEqual(o);
	});

	test.skip("Read first element if more than one in XML", () => {
		// TODO: bug
		const result = "<StringInRoot><name>Hello World</name><name>Second World</name></StringInRoot>";
		const x: any = deserialize(result, StringInRoot);
		expect(x).toEqual({ name: "Hello World" });
	});

	test("Don't invoke factory for missing attributes", () => {
		const o: ResolveAttributePrefix = { };
		const result = serialize(o, ResolveAttributePrefix);
		expect(result).toBe('<p0:ResolveAttributePrefix xmlns:p0="uri-test"/>');

		const x: any = deserialize(result, ResolveAttributePrefix);
		expect(x).toEqual(o);
	});

	test("Throw if array without itemType", () => {
		expect(() => {

			@XMLRoot()
			class ArrayNoItemTypeError {
				@XMLArray({itemTypes: [
					{name: "thing1"},
				]})
				things?: string[];
			}
				
		}).toThrow(new Error("@XMLArray must declare item type on things"));
	});

	test("Throw if deserialize plain string", () => {
		expect(() => {
			deserialize("not xml", EmptyRoot);
		}).toThrow(new Error("Unexpected character data"));
	});

	test("Throw if deserialize bad XML", () => {
		expect(() => {
			deserialize("<EmptyRoot not xml", EmptyRoot);
		}).toThrow();
	});

	test("Throw if deserialize text before XML", () => {
		expect(() => {
			deserialize("not xml <EmptyRoot/>", EmptyRoot);
		}).toThrow(new Error("Unexpected character data"));
	});

	test("Do not throw if text after XML", () => {
		deserialize("<EmptyRoot/>abcdef", EmptyRoot);
	});

	test("Do not throw if XML after XML", () => {
		deserialize("<EmptyRoot/><EmptyRoot/><EmptyRoot/>", EmptyRoot);
	});

});

function serialize(data: any, type: Function, localName?: string, ns?: string): string {
	const serializer = new XMLDecoratorSerializer();
	return serializer.serialize(data, type, null, localName, ns);
}

function deserialize(text: string, type: Function|Function[]): any {
	const deserializer = new XMLDecoratorDeserializer();
	return deserializer.deserialize(text, type);
}

function mix<T>(target: T, source: Partial<T>): T {
	return Object.assign(target, source);
}
