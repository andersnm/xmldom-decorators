import { XMLRoot, XMLElement, XMLAttribute, XMLArray } from '../src/decorators';
import { XMLDecoratorSerializer } from '../src/serializer';
import { XMLDecoratorDeserializer } from '../src/deserializer';

@XMLRoot()
class EmptyRoot {
}

@XMLRoot()
class StringInRoot {
	@XMLElement()
	name: string = "";
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
	@XMLArray({itemType: String})
	names: string[] = [];
}

@XMLRoot()
class ComplexNestedArrayInRoot {
	@XMLArray({itemType: DateInRoot})
	dates: DateInRoot[] = [];
}

@XMLRoot()
class FlatArrayInRoot {
	@XMLArray({itemType: String, nested: false})
	names: string[] = [];
}

describe("Decorators", () => {

	test("Empty root", () => {
		var o: EmptyRoot = {};
		const result = serialize(o, EmptyRoot);
		expect(result).toBe("<EmptyRoot/>");

		const x: any = deserialize(result, EmptyRoot);
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
});

function serialize(data: any, type: Function): string {
	const serializer = new XMLDecoratorSerializer();
	return serializer.serialize(data, type);
}

function deserialize(text: string, type: Function): any {
	const deserializer = new XMLDecoratorDeserializer();
	return deserializer.deserialize(text, type);
}
