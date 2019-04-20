import { SchemaMapper } from 'xmldom-decorators-cli/lib/schemascanner';
import { Schema, Element, ComplexType, ComplexContent, ComplexContentExtension, Sequence } from 'xmldom-decorators-cli/lib/xsdschema';

import { AsyncTest, Expect, Test, TestCase, TestFixture } from "alsatian";

const expect = Expect;

function mix<T>(target: T, source: Partial<T>): T {
    return Object.assign(target, source);
}

@TestFixture("Schema")
export class SchemaTests {

    @Test("extend base")
	public extendBase() {

        // Extend base in different schema, check ns

        const baseSchema = mix(new Schema(), {
            targetNamespace: "uri-base",
        });

        baseSchema.items.push(mix(new ComplexType(), {
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

        const schema = new Schema();
        schema.items.push(mix(new Element(), {
            name: "root",
            type: { localName: "rootType", namespaceUri: "" }
        }));

        schema.items.push(mix(new ComplexType(), {
            name: "rootType",

            complexContent: mix(new ComplexContent(), {
                extension: mix(new ComplexContentExtension(), {
                    base: { localName: "baseType", namespaceUri: "uri-base" },
                })
            })
        }));

        const mapper = new SchemaMapper();
        mapper.loadSchemas([schema, baseSchema]);

        const classes = mapper.getClasses();
        console.log(JSON.stringify(classes));
        expect(classes.length).toBe(1);
        expect(classes[0].members.length).toBe(1);

        expect(classes[0].members[0].name).toBe("hello");
        expect(classes[0].members[0].namespaceUri).toBe("uri-base");

    }
}
