import {SchemaMapper} from '../src/schemascanner';
import { formatClass, formatClasses } from '../src/classformatter';
import { Schema, Element, ComplexType, ComplexContent, ComplexContentExtension, Sequence } from '../src/xsdschema';
import { XMLDecoratorSerializer, SerializerContext } from 'xmldom-decorators';
import { XMLDecoratorDeserializer, DeserializerContext } from 'xmldom-decorators';

function mix<T>(target: T, source: Partial<T>): T {
    return Object.assign(target, source);
}

describe("Schema", () => {

    test("extend base", () => {

        // TODO: extend base in different schema, check ns

        const schema = new Schema();
        schema.items.push(mix(new Element(), {
            name: "root",
            type: { localName: "rootType", namespaceUri: "" }
        }));

        schema.items.push(mix(new ComplexType(), {
            name: "rootType",

            complexContent: mix(new ComplexContent(), {
                extension: mix(new ComplexContentExtension(), {
                    base: { localName: "baseType", namespaceUri: "" },
                })
            })
        }));

        schema.items.push(mix(new ComplexType(), {
            name: "baseType",

            sequence: mix(new Sequence(), {
                elements: [
                    mix(new Element(), {
                        name: "hello",
                        type: { localName: "string", namespaceUri: "http://www.w3.org/2001/XMLSchema"}
                    })
                ]
            })
        }));

        const s = serialize(schema, Schema);
        expect(s).toBe("<p0:schema xmlns:p0=\"http://www.w3.org/2001/XMLSchema\"><p0:element name=\"root\" type=\"rootType\"/><p0:complexType name=\"rootType\"><p0:complexContent><p0:extension base=\"baseType\"/></p0:complexContent></p0:complexType><p0:complexType name=\"baseType\"><p0:sequence><p0:element name=\"hello\" type=\"p0:string\"/></p0:sequence></p0:complexType></p0:schema>");

        const mapper = new SchemaMapper();
        mapper.loadSchema(schema);

        const classes = mapper.getClasses();
        console.log(JSON.stringify(classes));
        expect(classes).toHaveLength(1);
        expect(classes[0].members).toHaveLength(1);

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
