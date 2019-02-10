import * as fs from 'fs';
import { XMLDecoratorDeserializer } from './deserializer';
import { Element, Schema, ComplexType, QName, SimpleType, Attribute, ComplexContentExtension, Sequence, Choice, AttributeGroup } from './schema/XsdSchema';
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
        } else if (m.xmlType === "text") {
            output.push("    @XMLText({})" + EOL);
            output.push("    " + m.name + ": " + m.type + ";" + EOL + EOL);
        } else {
            throw new Error("Unhandled xmlType " + m.xmlType);
        }
    }
    output.push("}" + EOL + EOL);
}

console.log(output.join(""))

function scanClassesFromFile(fileName: string, classes: SchemaClass[]) {
    var contents = fs.readFileSync(fileName, 'utf8') as string;

    const deser = new XMLDecoratorDeserializer();
    const o = deser.deserialize<Schema>(contents, Schema);

    scanClasses(o, classes);
}

interface SchemaMember {
    name: string;
    namespaceUri: string|null; // only attributes can have null
    type: string;
    xmlType: 'attribute' | 'element' | 'array' | 'text';
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

function getAttributeTypeName(type: QName | undefined, simpleType: SimpleType | undefined, schema: Schema): string {
    if (type) {
        return convertQNameType(type, schema);
    } else if (simpleType) {
        if (simpleType.restriction && simpleType.restriction.base) {
            return convertQNameType(simpleType.restriction.base, schema);
        } else if (simpleType.union) {
            if (simpleType.union.simpleType) {
                // NOTE/TODO: take type from first in union. should validate something
                if (simpleType.union.simpleType.length === 0) {
                    throw new Error("Union with simpleType must have at least one element");
                }

                return getAttributeTypeName(undefined, simpleType.union.simpleType[0], schema);
            } else if (simpleType.union.memberTypes) {
                if (simpleType.union.memberTypes.length === 0) {
                    throw new Error("Union with memberTypes must have at least one type");
                }

                // TODO: returns the first member type
                return getAttributeTypeName(simpleType.union.memberTypes[0], undefined, schema);
            } else {
                throw new Error("Empty union");
            }
        } else {
            throw new Error("simpleType must specify (restriction|union) with base type " + simpleType.name);
        }
    } else {
        throw new Error("attribute must specify a type");
    }

}

function convertQNameType(type: QName, schema: Schema): string {
    if (type.namespaceUri === "http://www.w3.org/2001/XMLSchema") {

        switch (type.localName) {
            case "string": return "string";
            case "boolean": return "boolean";
            case "decimal": return "number";
            case "int": return "number";
            case "positiveInteger": return "number";
            case "nonNegativeInteger": return "number";
            case "date": return "Date";
            case "dateTime": return "Date";
            case "duration": return "number"; // ??
            case "NMTOKENS": return "string"; // string[] w/custom readerwriter
            case "NMTOKEN": return "string";
            case "language": return "string";
            default: throw new Error("attribute XML schema type " + type.localName);
        }
    }

    if (schema.simpleTypes) {
        const simpleType = schema.simpleTypes.find(s => s.name === type.localName);
        if (!simpleType) {
            throw new Error("Not a valid type " + type.localName)
        }

        return getAttributeTypeName(undefined, simpleType, schema);
    }

    throw new Error("Not a valid type " + type.localName)

    // TODO: lookup simpleType
    return type.localName;
}

function scanAttributes(attributes: Attribute[], cls: SchemaClass, schema: Schema) {
    for (let a of attributes) {
        let typeName: string = getAttributeTypeName(a.type, a.simpleType, schema);

        cls.members.push({
            name: a.name || "",
            namespaceUri: a.targetNamespace || null,
            type: typeName,
            xmlType: 'attribute',
        });
    }
}

function scanAttributeGroups(attributeGroups: AttributeGroup[], schema: Schema, cls: SchemaClass, classes: SchemaClass[]) {
    for (let ag of attributeGroups) {
        if (ag.ref) {
            if (!schema.attributeGroup) {
                throw new Error("Referenced attribute group, but there are none in the schema " + ag.ref);
            }
            const agRef = schema.attributeGroup.find(sag => sag.name === ag.ref);
            if (!agRef) {
                throw new Error("Cannot find attribute group " + ag.ref);
            }
            if (agRef.attributes) {
                scanAttributes(agRef.attributes, cls, schema);
            }
        }
    }
}

function scanSequence(sequence: Sequence, schema: Schema, cls: SchemaClass, classes: SchemaClass[]) {
    if (sequence.elements) {
        for (let s of sequence.elements) {
            scanElementClassMember(s, cls, schema, classes);
        }
    }
}

function scanChoice(choice: Choice, schema: Schema, cls: SchemaClass, classes: SchemaClass[]) {
    if (choice.elements) {
        for (let s of choice.elements) {
            scanElementClassMember(s, cls, schema, classes);
        }
    }
}

function scanComplexTypeMembers(complexType: ComplexType, schema: Schema, cls: SchemaClass, classes: SchemaClass[]) {

    if (complexType.attributes) {
        scanAttributes(complexType.attributes, cls, schema);
    }

    if (complexType.attributeGroup) {
        scanAttributeGroups(complexType.attributeGroup, schema, cls, classes);
    }

    if (complexType.sequence) {
        scanSequence(complexType.sequence, schema, cls, classes);
    } else if (complexType.choice) {
        scanChoice(complexType.choice, schema, cls, classes);
    } else if (complexType.simpleContent) {
        // is @XMLText 
        if (!complexType.simpleContent.extension) {
            throw new Error("Expexted extension in simpleContent");
        }
        cls.members.push({
            name: "value", // ensure unique
            namespaceUri: null,
            type: getAttributeTypeName(complexType.simpleContent.extension.base, undefined, schema),
            xmlType: "text",
        });

        if (complexType.simpleContent.extension.attributes) {
            scanAttributes(complexType.simpleContent.extension.attributes, cls, schema);
        }

        if (complexType.simpleContent.extension.attributeGroups) {
            scanAttributeGroups(complexType.simpleContent.extension.attributeGroups, schema, cls, classes);
        }

        // throw new Error("complexType simpleContent " + JSON.stringify(complexType, null, 2));
    } else if (complexType.complexContent) {
        // -> find complexType ->
        
        if (complexType.complexContent.extension) {
            if (!complexType.complexContent.extension.base) {
                throw new Error("Extension base must be set");                            
            }

            scanExtendClass(complexType.complexContent.extension.base, schema, cls, classes);

            if (complexType.complexContent.extension.attributes) {
                scanAttributes(complexType.complexContent.extension.attributes, cls, schema);
            }

            if (complexType.complexContent.extension.attributeGroups) {
                scanAttributeGroups(complexType.complexContent.extension.attributeGroups, schema, cls, classes);
            }

            if (complexType.complexContent.extension.sequence) {
                scanSequence(complexType.complexContent.extension.sequence, schema, cls, classes);
            }

            if (complexType.complexContent.extension.choice) {
                scanSequence(complexType.complexContent.extension.choice, schema, cls, classes);
            }

        } else if (complexType.complexContent.restriction) {
            if (!complexType.complexContent.restriction.base) {
                throw new Error("Restriction base must be set");                            
            }

            scanExtendClass(complexType.complexContent.restriction.base, schema, cls, classes);

            if (complexType.complexContent.restriction.attributes) {
                scanAttributes(complexType.complexContent.restriction.attributes, cls, schema);
            }

            if (complexType.complexContent.restriction.attributeGroups) {
                scanAttributeGroups(complexType.complexContent.restriction.attributeGroups, schema, cls, classes);
            }

            if (complexType.complexContent.restriction.sequence) {
                scanSequence(complexType.complexContent.restriction.sequence, schema, cls, classes);
            }

            if (complexType.complexContent.restriction.choice) {
                scanSequence(complexType.complexContent.restriction.choice, schema, cls, classes);
            }
        } else {
            throw new Error("complexContent must have restriction or extension");
        }
    } else {
        // throw new Error("complexType does not define any content" + JSON.stringify(complexType, null, 2));
    }

}

function scanComplexType(name: string, complexType: ComplexType, schema: Schema, classes: SchemaClass[]) {
    
    const cls: SchemaClass = {
        name: name,
        members: []
    };

    classes.push(cls);

    scanComplexTypeMembers(complexType, schema, cls, classes);
}

function scanExtendClass(base: QName, schema: Schema, cls: SchemaClass, classes: SchemaClass[]) {
    if (!schema.complexTypes) {
        throw new Error("No complex types in schema");
    }
    
    const localName = base.localName;
    const complexType = schema.complexTypes.find(c => c.name === localName);
    if (!complexType) {
        throw new Error("No complex type " + localName);
    }

    // console.warn("extending with " + JSON.stringify(complexType))
    // TODO: this copies members from the base class, use inheritance instead
    scanComplexTypeMembers(complexType, schema, cls, classes);
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
        // if complextype, OK, if simpletype; resolve
        let ct: ComplexType|undefined;
        let st: SimpleType|undefined;

        if (schema.complexTypes) {
            ct = schema.complexTypes.find(c => c.name === e.type);
        }
        
        if (schema.simpleTypes) {
            st = schema.simpleTypes.find(c => c.name === e.type);
        }

        if (ct) {
            cls.members.push({
                name: e.name || "",
                namespaceUri: e.targetNamespace || schema.targetNamespace || "",
                type: e.type,
                xmlType: xmlType
            });
        } else if (st) {
            cls.members.push({
                name: e.name || "",
                namespaceUri: e.targetNamespace || schema.targetNamespace || "",
                type: getAttributeTypeName(undefined, st, schema),
                xmlType: xmlType
            });
        } else {
            throw new Error("Unknown type " + e.type);
        }
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
        // TODO: read/write ref as QName
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
