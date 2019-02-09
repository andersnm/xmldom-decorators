import * as fs from 'fs';
import { XMLDecoratorDeserializer } from './deserializer';
import { Element, Schema, ComplexType } from './schema/XsdSchema';
import { toposort } from './toposort';

const EOL = "\r\n";

if (process.argv.length < 3) {
    console.log("Usage: xsd filename.xsd");
    process.exit(1);
}

const classes: SchemaClass[] = [];
scanClassesFromFile(process.argv[2], classes);

// Topological sort, TODO: rewrite back edges to arrays

const nodes = classes.map(c => c.name);
const edges: [string, string][] = [];

for (let c of classes) {
    const classEdges = c.members.filter(m => nodes.indexOf(m.type) !== -1).map(m => [m.type, c.name]) as [string, string][];
    edges.push(...classEdges);
}

const cycles: [string, string][] = [];

const sorted = toposort(nodes, edges, (a: string, b: string) => cycles.push([a, b]));
// console.log(sorted, cycles);

const output: string[] = [];

output.push("import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from \"./src/decorators\";" + EOL + EOL)

for (let className of sorted) {

    const e = classes.find(c => c.name === className);
    if (!e) {
        continue;
    }

    output.push("export class " + e.name + " {" + EOL);
    for (let m of e.members) {
        if (m.xmlType === "attribute") {
            output.push("    @XMLAttribute({namespaceUri: \"" + m.namespaceUri + "\"})" + EOL);
            output.push("    " + m.name + ": " + m.type + ";" + EOL + EOL);
        } else if (m.xmlType === "element") {
            output.push("    @XMLElement({namespaceUri: \"" + m.namespaceUri + "\"})" + EOL);
            output.push("    " + m.name + ": " + m.type + ";" + EOL + EOL);
        } else if (m.xmlType === "array") {
            output.push("    @XMLArray({namespaceUri: \"" + m.namespaceUri + "\", itemType: () => " + m.type + ", nested: false})" + EOL);
            output.push("    " + m.name + ": " + m.type + "[];" + EOL + EOL);
        }
    }
    output.push("}" + EOL + EOL);
}

console.log(output.join(""))

function scanClassesFromFile(fileName: string, classes: SchemaClass[]) {
    var contents = fs.readFileSync(fileName, 'utf8') as string;

    const deser = new XMLDecoratorDeserializer();
    const o = deser.deserialize<Schema>(contents, Schema);

    // TODO: need to resolve prefix namespaces? f.ex xs:string -> schema-uri+string

    scanClasses(o, classes);
}

interface SchemaMember {
    name: string;
    namespaceUri: string|null; // only attributes can have null
    type: string;
    xmlType: 'attribute' | 'element' | 'array';
}

interface SchemaClass {
    name: string;
    members: SchemaMember[];
}

function scanClasses(schema: Schema, classes: SchemaClass[]) {

    if (schema.imports) {
        for (let i of schema.imports) {
            if (!i.schemaLocation) {
                throw new Error("Import must specify schemaLocation");
            }
            scanClassesFromFile(i.schemaLocation, classes);
        }
    }

    if (schema.complexTypes) {
       for (let c of schema.complexTypes) {
           if (!c.name) {
               throw new Error("complexType must have a name");
           }

           scanComplexType(c.name, c, schema, classes);
       }
    }

    if (schema.elements) {
        for (let e of schema.elements) {
            scanElementClass(e, schema, classes);
        }
    }

}

function scanElementClass(element: Element, schema: Schema, classes: SchemaClass[]) {
    if (!element.name) {
        throw new Error("Element must have name property");
    }

    if (element.complexType) {
        scanComplexType(element.name, element.complexType, schema, classes);
    }
}

function scanComplexType(name: string, complexType: ComplexType, schema: Schema, classes: SchemaClass[]) {
    
    const cls: SchemaClass = {
        name: name,
        members: []
    };

    classes.push(cls);

    if (complexType.attributes) {
        for (let a of complexType.attributes) {
            let typeName: string;
            if (a.type) {
                typeName = a.type;
            } else if (a.simpleType) {
                if (a.simpleType.restriction && a.simpleType.restriction.base) {
                    typeName = a.simpleType.restriction.base;
                } else {
                    throw new Error("simpleType must specify a restriction base type");
                }
            } else {
                throw new Error("attribute must specify a type");
            }

            cls.members.push({
                name: a.name || "",
                namespaceUri: a.targetNamespace || null,
                type: typeName,
                xmlType: 'attribute',
            });
        }
    }

    if (complexType.sequence) {
        if (complexType.sequence.elements) {
            for (let s of complexType.sequence.elements) {
                scanElementClassMember(s, cls, schema, classes);
            }
        }
    } else if (complexType.choice) {
        if (complexType.choice.elements) {
            for (let s of complexType.choice.elements) {
                scanElementClassMember(s, cls, schema, classes);
            }
        }
    }

}

function scanElementClassMember(e: Element, cls: SchemaClass, schema: Schema, classes: SchemaClass[]) {
    let xmlType: 'array' | 'element';

    const maxOccurs = parseInt(e.maxOccurs as string, 10);
    if ((!isNaN(maxOccurs) && maxOccurs > 1) || e.maxOccurs === "unbounded") {
        xmlType = 'array';
    } else {
        xmlType = 'element';
    }

    if (e.type) {
        cls.members.push({
            name: e.name || "",
            namespaceUri: e.targetNamespace || schema.targetNamespace || "",
            type: e.type,
            xmlType: xmlType
        });
    } else if (e.complexType) {
        let name: string;
        if (e.complexType.name) {
            name = e.complexType.name;
        } else {
            name = e.name + "InnerComplexType";
            // TODO: check if name was declared globally
        }

        cls.members.push({
            name: e.name || "",
            namespaceUri: e.targetNamespace || schema.targetNamespace || "",
            type: name,
            xmlType: xmlType
        });

        scanComplexType(name, e.complexType, schema, classes);
    } else if (e.ref) {
        // ref is qualified!
        const cpos = e.ref.indexOf(":");
        const refName = cpos !== -1 ? e.ref.substr(cpos + 1) : e.ref;
        const c = classes.find(c => c.name === refName);
        if (!c) {
            throw new Error("NO CLASS " + refName)
        }

        cls.members.push({
            name: refName || "",
            namespaceUri: e.targetNamespace || schema.targetNamespace || "",
            type: c.name,
            xmlType: xmlType
        });

    } else {
        console.log("    // TODO: " + e.name);
    }
}
