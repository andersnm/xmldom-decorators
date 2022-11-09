import { XMLReader, Locator, DOMBuilder, ElementAttributes } from "@xmldom/xmldom/lib/sax";
import { RootSchema, ArraySchema, BaseSchema, ArrayItemOptions, isRootSchema, isElementSchema, isArraySchema, ElementSchema, TextSchema, AttributeSchema, isTextSchema } from "./decorators";

export function getArrayItemName(schema: ArraySchema, opts: ArrayItemOptions): string {
    if (!schema.nested && !opts.name) {
        return schema.name;
    }

    return opts.name || (opts.itemType && opts.itemType().name) || "";
}

function getArrayItemType(arraySchema: ArraySchema, localName: string, ns: string): ArrayItemOptions|null {
    return arraySchema.itemTypes.find(c => getArrayItemName(arraySchema, c) === localName && c.namespaceUri === (ns ? ns : "")) || null;
}

function getElementType(elementSchema: ElementSchema, localName: string, ns: string): ArrayItemOptions|null {
    return elementSchema.types.find(c => c.name === localName && c.namespaceUri === (ns ? ns : "")) || null;
}

function isElementOrArrayOrArrayItem(schema: BaseSchema, localName: string, ns: string) {
    if (isElementSchema(schema)) {
        const elementType = getElementType(schema, localName, ns);
        return !!elementType;
    }

    if (isArraySchema(schema)) {
        if (schema.nested) {
            return schema.name === localName && schema.namespaceUri === (ns ? ns : "");
        }

        const itemType = getArrayItemType(schema, localName, ns);
        return !!itemType;
    }

    return false;
}

interface ElementContext {
    contextType: "ignore" | "root" | "element" | "array";
    elementSchema: BaseSchema | null;
    value: any;
    propertyKey: string | null; // resolved property name, since schema doesnt have it always
    type: Function | null; // actual resolved element type
    keys: {[key: string]: true}; // encountered property keys if element/root type
}

export interface DeserializerContext {
    resolvePrefix(prefix: string): string;
}

class DeserializerBuilder implements DOMBuilder, DeserializerContext {
    private xmlRootSchemas: RootSchema[];
    private elementStack: ElementContext[] = [];
    private prefixStack: [string, string][] = [];
    private started: boolean = false; // Indicates whether any XML content has occurred. Used to throw errors on non-XML input
    private ended: boolean = false; // Indicates whether the root element has been closed. Used to ignore additional input
    public locator: Locator = {
        columnNumber: 0,
        lineNumber: 0,
    };
    public currentElement: any = null;
    public result: any = null;

    // The xmldom sax API does DOM manipulation for text at the end of the stream.
    public doc = {
        builder: this,
        createTextNode(text: string) {
            if (!this.builder.started) {
                // Throw if the stream is entirely non-xml and has no '<' characters
                throw new Error("Unexpected character data");
            }
        },
        appendChild(node: any) {
        }
    };

    constructor(xmlRootSchemas: RootSchema[]) {
        this.xmlRootSchemas = xmlRootSchemas;
        this.startPrefixMapping("xml", "http://www.w3.org/XML/1998/namespace");
    }

    startDocument(): void {
    }

    endDocument(): void {
    }

    characters(xt: string, start: number, length: number): void {
        if (!this.started) {
            // Throw if any characters before first '<' character
            throw new Error("Unexpected character data");
        }

        if (this.elementStack.length === 0) {
            return; // Ignore f.ex whitespace between <?xml...> and root element
        }

        const parent = this.elementStack[this.elementStack.length - 1];
        if (!parent.type) {
            return;
        }

        // console.log("chars", xt, start, length)

        if (parent.contextType === "root" || parent.contextType === "element") {
            if (parent.type === Number || parent.type === Boolean || parent.type === String || parent.type === Date) {
                parent.value = this.convertValue(xt, parent.type);
            } else if (typeof parent.type === "function") {
                // Text inside object, check for a property with XMLText decorator:
                const children: BaseSchema[] = Reflect.getMetadata("xml:type:children", parent.type) || [];
                const childSchema = children.find(c => isTextSchema(c)) as TextSchema;
                if (childSchema) {
                    parent.value[childSchema.propertyKey] = this.convertValue(xt, childSchema.type);
                }
            }
        }
    }

    startElement(ns: string, localName: string, tagName: string, el: ElementAttributes): void {
        if (this.ended) {
            return ;
        }

        this.started = true;

        if (this.elementStack.length === 0) {
            this.startRoot(ns, localName, tagName, el)
            return ;
        }

        const parent = this.elementStack[this.elementStack.length - 1];

        if (parent.contextType === "ignore") {
            this.pushIgnore();
            return;
        }

        if (!parent.type) {
            throw new Error("Internal error. No type on parent");
        }

        if (parent.contextType === "root" || parent.contextType === "element") {
            const children: BaseSchema[] = Reflect.getMetadata("xml:type:children", parent.type) || [];

            const childSchema = children.find(c => isElementOrArrayOrArrayItem(c, localName, ns));

            if (!childSchema) {
                // TODO: fail if complex content in a simple type
                // console.log(localName, ns, "skipping")
                this.pushIgnore();
                return;
            }

            if (isArraySchema(childSchema) && !childSchema.nested) {
                // non-nested array member on object

                const itemType = getArrayItemType(childSchema, localName, ns);

                if (!itemType) {
                    throw new Error("Internal error: could not find non-nested array item type");
                }

                if (!itemType.itemType) {
                    throw new Error("Internal error: non-nested array item must specify an itemType");
                }

                // Push a fake array container for this item, reusing the array value
                const value = parent.value[childSchema.propertyKey] = parent.value[childSchema.propertyKey] || [];
                
                this.elementStack.push({
                    value: value,
                    elementSchema: childSchema,
                    contextType: "array",
                    type: Array,
                    propertyKey: childSchema.propertyKey,
                    keys: {},
                });

                this.pushValue(childSchema, itemType.itemType(), null, el);
    
            } else if (isArraySchema(childSchema) && childSchema.nested) {
                // nested array member on object
                this.pushValue(childSchema, Array, childSchema.propertyKey, el);
            } else if (isElementSchema(childSchema)) {
                // element member on object
                const elementType = getElementType(childSchema, localName, ns);
                if (!elementType) {
                    throw new Error("Cannot find element");
                }

                if (!elementType.itemType) {
                    throw new Error("Cannot find element type");
                }

                this.pushValue(childSchema, elementType.itemType(), childSchema.propertyKey, el);
            } else {
                throw new Error("Internal error: Expected array or element in object");
            }

        } else if (parent.contextType === "array") {

            const arraySchema = parent.elementSchema as ArraySchema;

            const itemType = getArrayItemType(arraySchema, localName, ns);

            if (!itemType) {
                // Ignore if element is not an item type
                this.pushIgnore();
                return;
            }

            if (!itemType.itemType) {
                throw new Error("Internal error, no itemType");
            }

            this.pushValue(arraySchema, itemType.itemType(), null, el);
        } else {
            throw new Error("Internal error. Found element in " + parent.contextType);
        }
    }

    endElement(ns: string, localName: string, tagName: string): void {
        if (this.ended) {
            return ;
        }

        const parent = this.elementStack.pop();
        if (!parent) {
            throw new Error("Unbalanced xml");
        }

        if (parent.contextType === "ignore") {
            return;
        }

        // TODO: validate object: missing properties

        if (this.elementStack.length === 0) {
            this.result = parent.value;
            this.ended = true; // signal to ignore remainder of sax events
            return;
        }

        const top = this.elementStack[this.elementStack.length - 1];
        if (top.elementSchema === null) {
            return;
        }

        if (top.contextType === "element" || top.contextType === "root") {
            if (!parent.propertyKey) {
                throw new Error("Expected propertyKey to be set");
            }

            if (top.keys[parent.propertyKey]) {
                return; // already set
            }

            top.value[parent.propertyKey] = parent.value;
            top.keys[parent.propertyKey] = true;
        } else if (top.contextType === "array") {
            const arraySchema = top.elementSchema as ArraySchema;

            top.value.push(parent.value);

            // Pop one more time for non-nested arrays to account for the fake array container
            if (!arraySchema.nested) {
                this.elementStack.pop();
            }
        } else {
            throw new Error("?? " + top.contextType);
        }
    }

    startPrefixMapping(nsPrefix: string, value: string): void {
        if (this.ended) {
            return ;
        }

        // Is called before startElement => no elementStack
        // Use separate prefix stack
        this.prefixStack.push([nsPrefix, value]);
    }

    endPrefixMapping(prefix: string): void {
        if (this.ended) {
            return ;
        }

        // Pop the topmost matching prefix
        for (let i = this.prefixStack.length - 1; i >= 0; i--) {
            if (this.prefixStack[i][0] === prefix) {
                this.prefixStack.splice(i, 1);
                return ;
            }
        }

        throw new Error("Internal error. Cannot end prefix mapping.");
    }

    comment(source: string, start: number, length: number): void {
        this.started = true;
    }

    startCDATA(): void {
    }

    endCDATA(): void {
    }

    startDTD(name: string, pubid: string, sysid: string): void {
        this.started = true;
    }

    endDTD(): void {
    }

    processingInstruction(p1: string, p2: string): void {
        this.started = true;
    }

    resolvePrefix(prefix: string): string {
        let i = this.prefixStack.length - 1;
        while (i >= 0) {
            if (prefix === this.prefixStack[i][0]) {
                return this.prefixStack[i][1];
            }

            i--;
        }

        throw new Error("Cannot resolve prefix " + prefix);
    }

    private startRoot(ns: string, localName: string, tagName: string, el: ElementAttributes): void {
        // scan multiple roots
        let rootSchema: RootSchema|null = null;

        let rootNames: string[] = [];
        for (let schema of this.xmlRootSchemas) {
            rootNames.push(schema.name);
            if (localName === schema.name && (ns ? ns : "") == schema.namespaceUri) {
                rootSchema = schema;
                break;
            }
        }

        if (!rootSchema) {
            throw new Error("Expected root element '" + rootNames.join("|") + "' but got '" + localName + "'");
        }

        const value: any = new rootSchema.type; // TODO: construct strategy
        this.elementStack.push({
            value: value,
            elementSchema: rootSchema,
            contextType: "root",
            type: rootSchema.type,
            propertyKey: null,
            keys: {},
        });

        this.setAttributes(value, rootSchema.type, el);
    }

    private setAttributes(value: any, type: Function, el: ElementAttributes) {
        for (let i = 0; i < el.length; i++) {
            const qName = el.getQName(i);
            if (qName === "xmlns" || qName.startsWith("xmlns:")) {
                continue;
            }

            const localName = el.getLocalName(i);
            const namespaceUri = el.getURI(i); // TODO: enforce namespace, default namespace

            const children: BaseSchema[] = Reflect.getMetadata("xml:type:children", type) || [];
            const childSchema = children.find((c: any) => c.xmlType === "attribute" && c.name === localName) as AttributeSchema;
            if (!childSchema) {
                // console.log("Skipping attribute " + localName + " (no schema)");
                continue;
            }

            if (childSchema.factory) {
                value[childSchema.propertyKey] = childSchema.factory[0](el.getValue(i), this);
            } else {
                value[childSchema.propertyKey] = this.convertValue(el.getValue(i), childSchema.type);
            }
        }
    }

    private pushIgnore() {
        this.elementStack.push({
            value: null,
            elementSchema: null,
            contextType: "ignore",
            type: null,
            propertyKey: null,
            keys: {},
        });
    }

    private pushValue(elementSchema: BaseSchema, type: any, propertyKey: string | null, el: ElementAttributes) {

        if (type === Number || type === Boolean || type === String || type === Date) {
            this.elementStack.push({
                value: undefined,
                elementSchema: elementSchema,
                contextType: "element",
                type: type,
                propertyKey: propertyKey,
                keys: {},
            });
        } else if (type === Array) {
            const arraySchema = elementSchema as ArraySchema;
            if (!arraySchema.nested) {
                throw new Error("Internal error. Cannot push non-nested array here");
            }

            const value: any = [];
            this.elementStack.push({
                value: value,
                elementSchema: elementSchema,
                contextType: "array",
                type: type,
                propertyKey: propertyKey,
                keys: {},
            });
        } else if (typeof type === "function") {
            // Complex object
            const value: any = new type; // TODO: construct strategy
            this.setAttributes(value, type, el);

            this.elementStack.push({
                value: value,
                elementSchema: elementSchema,
                contextType: "element",
                type: type,
                propertyKey: propertyKey,
                keys: {},
            });
        } else if (Array.isArray(type)) {
            throw new Error("Internal error: Shouldnt be array here");
        } else {
            throw new Error("Invalid schema type " + type);
        }
    }

    private convertValue(value: string, type: any) {
        if (type === String) {
            return value;
        } else if (type === Number) {
            try {
                var numberResult = Number(value).valueOf();
            } catch (e) {
                throw new Error("Cannot convert to number: " + value);
            }
            return numberResult;
        } else if (type === Date) {
            var dateResult = new Date(value);
            if (isNaN(dateResult.valueOf())) {
                throw new Error("Cannot convert to date: " + value);
            }
            return dateResult;
        } else if (type === Boolean) {
            if (value === "true") {
                return true;
            }
            if (value === "false") {
                return false;
            }

            throw new Error("Cannot convert value to boolean: " + value);
        } else {
            throw new Error("Unsupported conversion: " + type);
        }
    }
}

export class XMLDecoratorDeserializer {
    
    deserialize<T>(source: string, type: Function|Function[]): T {

        // array of types; and array of roots per type
        let rootSchemas: RootSchema[]
        if (Array.isArray(type)) {
            rootSchemas = [];
            for (let typeType of type) {
                var typeRootSchemas: RootSchema[] = Reflect.getMetadata("xml:root", typeType);
                if (!typeRootSchemas) {
                    throw new Error("Every root type must specify @XMLRoot decorator");
                }

                rootSchemas.push(...typeRootSchemas);
            }
        } else {
            rootSchemas = Reflect.getMetadata("xml:root", type);
            if (!rootSchemas) {
                throw new Error("Root type must specify @XMLRoot decorator");
            }
        }

        var reader = new XMLReader();
        var builder = new DeserializerBuilder(rootSchemas);

        reader.domBuilder = builder;

        var errors: Error[] = [];

        reader.errorHandler = {
            warning(msg: any) {
                errors.push(new Error(msg + " (" + builder.locator.lineNumber + ":" + builder.locator.columnNumber + ")"));
            },
            error(msg: any) {
                errors.push(new Error(msg + " (" + builder.locator.lineNumber + ":" + builder.locator.columnNumber + ")"));
            },
            fatalError(msg: any) {
                errors.push(new Error(msg + " (" + builder.locator.lineNumber + ":" + builder.locator.columnNumber + ")"));
            },
        };

        var defaultNSMap = { xml: "http://www.w3.org/XML/1998/namespace"};
        var entityMap = {"lt": "<", "gt": ">", "amp": "&", "quot": '"', "apos":"'"}

        reader.parse(source, defaultNSMap, entityMap);
        if (errors.length > 0) {
            throw errors[0];
        }

        return builder.result as T;
    }
}
