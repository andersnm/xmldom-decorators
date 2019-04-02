import { Element, Schema, ComplexType, QName, SimpleType, Attribute, SimpleContent } from './xsdschema';
import { SchemaCollection } from './schemacollection';
import { SchemaVisitor } from './schemavisitor';
import { SchemaClass } from './classtypes';

const builtinTypes: SchemaClass[] = [
    // String types
    {
        type: "builtinType",
        name: "string",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "normalizedString",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "token",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "language",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "NMTOKEN",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "NMTOKENS",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "Name",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "NCName",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },

    // Other types
    {
        type: "builtinType",
        name: "QName",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "boolean",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Boolean",
        members: [],
    },
    {
        type: "builtinType",
        name: "hexBinary",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "base64Binary",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "anyURI",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "notation",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },

    // Magic types
    {
        type: "builtinType",
        name: "ID",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "IDREFS",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "ENTITY",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "ENTITIES",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },

    // Numeric types
    {
        type: "builtinType",
        name: "decimal",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "float",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "double",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "integer",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "positiveInteger",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "negativeInteger",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "nonPositiveInteger",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "nonNegativeInteger",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "long",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "int",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "short",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "byte",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "unsignedLong",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "unsignedInt",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "unsignedShort",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },
    {
        type: "builtinType",
        name: "unsignedByte",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Number",
        members: [],
    },

    // Date types
    {
        type: "builtinType",
        name: "date",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Date",
        members: [],
    },
    {
        type: "builtinType",
        name: "dateTime",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "Date",
        members: [],
    },
    {
        type: "builtinType",
        name: "gYearMonth",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "gYear",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "duration",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "gMonthDay",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "gDay",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
    {
        type: "builtinType",
        name: "gMonth",
        namespaceUri: "http://www.w3.org/2001/XMLSchema",
        javaScriptType: "String",
        members: [],
    },
];

function decapitalize(str: string): string {
    return str.substr(0, 1).toLowerCase() + str.substr(1);
}

function capitalize(str: string): string {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
}

function getMemberName(path: string|undefined): string|undefined {
    if (path === undefined) {
        return undefined;
    }

    return path.split(/[\s\_\-]/).map((p, index) => index == 0 ? decapitalize(p) : capitalize(p)).join("");
}

function getClassName(path: string|string[]|undefined): string|undefined {
    // capitalize first letter, split on dash/underscore, capitalize following letter

    if (path === undefined) {
        return undefined;
    }

    if (path === "Date" || path === "String" || path === "Number" || path == "Boolean") {
        return path + "Type";
    }

    if (Array.isArray(path)) {
        return path.map(p => p.split(/[\s\_\-]/).map(p => capitalize(p)).join("")).join("");
    }

    return path.split(/[\s\_\-]/).map(p => capitalize(p)).join("");
}

class SchemaMapperVisitor extends SchemaVisitor {
    path: string[] = [];
    mapper: SchemaMapper;
    schema: Schema | undefined;
    targetNamespace: string = "";

    constructor(mapper: SchemaMapper) {
        super();

        this.mapper = mapper;
    }

    visitSchema(schema: Schema) {
        this.schema = schema;
        this.targetNamespace = schema.targetNamespace || "";
        super.visitSchema(schema);
        this.schema = undefined;
        this.targetNamespace = "";
    }

    visitElement(element: Element) {
        if (element.name) {
            this.path.push(element.name);
        }

        super.visitElement(element);

        if (element.name) {
            this.path.pop();
        }
    }

    visitComplexType(complexType: ComplexType, element?: Element) {

        if (complexType.name) {
            this.path.push(complexType.name);
        }

        this.mapper.complexTypeClasses.set(complexType, {
            type: "complexType",
            javaScriptType: getClassName(complexType.name) || getClassName(this.path) || "",
            name: complexType.name || "",
            namespaceUri: this.targetNamespace,
            members: []
        } );

        if (!this.schema) {
            throw new Error("Internal error: no schema");
        }

        this.mapper.complexTypeSchemas.set(complexType, this.schema);

        super.visitComplexType(complexType, element);

        if (complexType.name) {
            this.path.pop();
        }
    }
    
    visitSimpleType(simpleType: SimpleType) {
        this.mapper.simpleTypeClasses.set(simpleType, {
            type: "simpleType",
            javaScriptType: "",
            name: simpleType.name || "",
            namespaceUri: this.targetNamespace,
            simpleType: simpleType,
            members: [],
        });

        super.visitSimpleType(simpleType);
    }
}

class SchemaClassVisitor extends SchemaVisitor {
    typeStack: SchemaClass[] = [];
    mapper: SchemaMapper;
    schema: Schema | undefined;

    constructor(mapper: SchemaMapper) {
        super();

        this.mapper = mapper;
    }

    visitSchema(schema: Schema) {
        this.schema = schema;
        super.visitSchema(schema);
        this.schema = undefined;
    }

    visitComplexType(complexType: ComplexType, element?: Element) {
        const schemaClass = this.mapper.complexTypeClasses.get(complexType);
        if (!schemaClass) {
            throw new Error("Internal error");
        }

        this.typeStack.push(schemaClass);
        super.visitComplexType(complexType);
        this.typeStack.pop();
    }

    visitElement(element: Element) {
        if (this.typeStack.length == 0) {
            super.visitElement(element);
        } else {
            const top = this.typeStack[this.typeStack.length - 1];
            let elementType: SchemaClass| undefined;
            let minOccurs = element.minOccurs;
            let maxOccurs = element.maxOccurs;
            while (true) {
                if (element.type) {
                    elementType = this.mapper.getSchemaClassByQName(element.type);
                    break;
                } else if (element.complexType) {
                    elementType = this.mapper.complexTypeClasses.get(element.complexType);
                    break;
                } else if (element.simpleType) {
                    elementType = this.mapper.simpleTypeClasses.get(element.simpleType);
                    break;
                } else if (element.ref) {
                    
                    const elementRef = this.mapper.collection.getElement(element.ref);
                    if (!elementRef) {
                        throw new Error("Cannot find element reference " + element.ref.localName);
                    }

                    // TODO: reference cycle = infinite loop
                    element = elementRef;
                } else {
                    // Default element type string
                    elementType = this.mapper.getBuiltinSchemaClass("string");
                    break;
                    // throw new Error("Unable to determine type for element " + JSON.stringify(element));
                }
            }

            // Remove restrictions on simpleType, should resolve to a builtin type
            while (elementType && elementType.simpleType && elementType.simpleType.restriction) {
                if (!elementType.simpleType.restriction.base) {
                    throw new Error("Expected base on restriction");
                }
                elementType = this.mapper.getSchemaClassByQName(elementType.simpleType.restriction.base);
            }

            if (!elementType) {
                throw new Error("Could not determine type for element " + JSON.stringify(element));
            }

            top.members.push({
                name: element.name || "",
                javaScriptName: getMemberName(element.name) || "",
                type: elementType,
                xmlType: "element",
                minOccurs: minOccurs,
                maxOccurs: maxOccurs,
                namespaceUri: this.schema ? (this.schema.targetNamespace || "") : "",
            });
            super.visitElement(element);
        }
    }

    visitAttribute(attribute: Attribute) {
        if (this.typeStack.length == 0) {
            super.visitAttribute(attribute);
        } else {
            const top = this.typeStack[this.typeStack.length - 1];
            let attributeType: SchemaClass| undefined;
            while (true) {
                if (attribute.type) {
                    attributeType = this.mapper.getSchemaClassByQName(attribute.type);
                    if (attributeType.type === "complexType") {
                        throw new Error("Attribute cannot have complex type " + attribute.type.localName + "/" + attribute.type.namespaceUri);
                    }
                    break;
                } else if (attribute.simpleType) {
                    attributeType = this.mapper.simpleTypeClasses.get(attribute.simpleType);
                    if (!attributeType) {
                        throw new Error("Could not determine simple type for attribute " + attribute.name);
                    }
                    break;
                } else if (attribute.ref) {
                    const attributeRef = this.mapper.collection.getAttribute(attribute.ref);
                    if (!attributeRef) {
                        throw new Error("Cannot find attribute reference " + attribute.ref.localName + "/" + attribute.ref.namespaceUri);
                    }

                    attribute = attributeRef;

                } else {
                    // Default attribute type string
                    attributeType = this.mapper.getBuiltinSchemaClass("string");
                    break;
                    // throw new Error("Unable to determine type for attribute " + JSON.stringify(attribute));
                }
            }

            // Remove restrictions on simpleType, should resolve to a builtin type
            while (attributeType && attributeType.simpleType) {

                if (attributeType.simpleType.union) {
                    // TODO: using first type in union, whether simpleType or memberTypes
                    if (attributeType.simpleType.union.simpleType) {
                        attributeType = this.mapper.simpleTypeClasses.get(attributeType.simpleType.union.simpleType[0]);
                    } else if (attributeType.simpleType.union.memberTypes) {
                        attributeType = this.mapper.getSchemaClassByQName(attributeType.simpleType.union.memberTypes[0]);
                    } else {
                        throw new Error("Expected simpleType or memberTypes in union");
                    }
                } else if (attributeType.simpleType.restriction) {
                    if (!attributeType.simpleType.restriction.base) {
                        throw new Error("Expected base on restriction");
                    }
                    attributeType = this.mapper.getSchemaClassByQName(attributeType.simpleType.restriction.base);
                } else {
                    break;
                }
            }

            if (!attributeType) {
                throw new Error("Could not determine type for attribute");
            }

            top.members.push({
                name: attribute.name || "",
                javaScriptName: getMemberName(attribute.name) || "",
                type: attributeType,
                xmlType: "attribute",
                namespaceUri: this.schema ? (this.schema.targetNamespace || null) : null,
            });
            super.visitAttribute(attribute);
        }
    }

    visitSimpleContent(simpleContent: SimpleContent) {
        // is @XMLText 
        if (!simpleContent.extension) {
            throw new Error("Expected extension in simpleContent");
        }

        if (!simpleContent.extension.base) {
            throw new Error("Expected base in simpleContent extension");
        }

        let textType = this.mapper.getSchemaClassByQName(simpleContent.extension.base);

        // Remove restrictions on simpleType, should resolve to a builtin type
        while (textType && textType.simpleType && textType.simpleType.restriction) {
            if (!textType.simpleType.restriction.base) {
                throw new Error("Expected base on restriction");
            }
            textType = this.mapper.getSchemaClassByQName(textType.simpleType.restriction.base);
        }

        if (!textType) {
            throw new Error("Could not determine type for simple content " + JSON.stringify(simpleContent));
        }

        const top = this.typeStack[this.typeStack.length - 1];
        top.members.push({
            name: "value",
            javaScriptName: getMemberName("value") || "",
            type: textType,
            xmlType: "text",
            namespaceUri: this.schema ? (this.schema.targetNamespace || null) : null,
        });

        super.visitSimpleContent(simpleContent);
    }

    visitExtensionBase(base: QName) {
        const currentSchema = this.schema;

        const type = this.mapper.collection.getComplexType(base);
        if (!type) {
            throw new Error("Cannot find complexType " + base.localName + "/" + base.namespaceUri);
        }

        // If type is in a different schema, set this.schema
        // NOTE: Calling super's visitComplexType to add members to the current stack top, do not want the local logic
        // TODO: may infinite loop/stackoverflow
        this.schema = this.mapper.complexTypeSchemas.get(type);
        if (!this.schema) {
            throw new Error("schema");
        }

        super.visitComplexType(type);

        this.schema = currentSchema;
    }
}

export class SchemaMapper {
    collection: SchemaCollection = new SchemaCollection();
    elementClasses: Map<Element, SchemaClass> = new Map();
    complexTypeClasses: Map<ComplexType, SchemaClass> = new Map();
    simpleTypeClasses: Map<SimpleType, SchemaClass> = new Map();
    complexTypeSchemas: Map<ComplexType, Schema> = new Map();

    public load(fileName: string) {
        this.collection.load(fileName);
        this.build();
    }

    public loadSchemas(schemas: Schema[]) {
        this.collection.schemas.push(...schemas);
        this.build();
    }

    build() {
        var mapper = new SchemaMapperVisitor(this);

        for (let schema of this.collection.schemas) {
            mapper.visitSchema(schema);
        }

        var builder = new SchemaClassVisitor(this);

        for (let schema of this.collection.schemas) {
            builder.visitSchema(schema);
        }
    }

    getClasses(): SchemaClass[] {
        const rootClasses: SchemaClass[] = [];

        for (let element of this.collection.root.elements) {
            let elementType: SchemaClass|undefined;
            if (element.type) {
                elementType = this.getSchemaClassByQName(element.type);
            } else if (element.simpleType) {
                throw new Error("Root as simpleType not implemented");
            } else if (element.complexType) {
                elementType = this.complexTypeClasses.get(element.complexType);
            }

            if (!elementType) {
                throw new Error("Could not find type for element");
            }

            if (!element.name) {
                // TODO: ref?
                throw new Error("Root element must have name");
            }

            // create a new class for the root types
            rootClasses.push({
                name: element.name,
                namespaceUri: elementType.namespaceUri,
                members: elementType.members,
                type: "elementType",
                javaScriptType: element.name,
            });
        }

        const result: SchemaClass[] = [...rootClasses];

        function addClassesToResult(cls: SchemaClass) {
            for (let member of cls.members) {
                if (member.type.type === "complexType") {
                    if (result.indexOf(member.type) === -1) {
                        result.push(member.type);
                        addClassesToResult(member.type);
                    }
                }
            }
        }

        for (let rootClass of rootClasses) {
            addClassesToResult(rootClass);
        }

        return result;
    }

    public getSchemaClassByQName(name: QName): SchemaClass {
        if (name.namespaceUri === "http://www.w3.org/2001/XMLSchema") {
            return this.getBuiltinSchemaClass(name.localName);
        }
    
        let result: SchemaClass|undefined;
        const simpleType = this.collection.getSimpleType(name);
        if (simpleType) {
            result = this.simpleTypeClasses.get(simpleType);
            if (result) {
                return result;
            }
        }

        const complexType = this.collection.getComplexType(name);
        if (complexType) {
            result = this.complexTypeClasses.get(complexType); 
            if (result) {
                return result;
            }
        }

        throw new Error("Not a valid type " + JSON.stringify(name));
    }

    getBuiltinSchemaClass(localName: string): SchemaClass {
        const builtinType = builtinTypes.find(b => b.name == localName);
        if (!builtinType) {
            throw new Error("Cannot find built in type " + localName);
        }

        return builtinType;
    }
}
