import { BaseSchema, ElementSchema, ArraySchema, RootSchema, ArrayItemOptions, isAttributeSchema, isTextSchema, isElementSchema, isArraySchema } from "./decorators";
import { DOMImplementation, XMLSerializer } from "@xmldom/xmldom";
import { getArrayItemName } from "./deserializer";

export interface SerializerContext {
    getQualifiedName(elementName: string, namespaceUri: string): string;
}

export class XMLDecoratorSerializer implements SerializerContext {
    private factory: DOMImplementation = new DOMImplementation();
    private document: Document|null = null;
    private prefixCounter: number = 0;
    private prefixMap: {[key: string]: string} = {};

    public serialize(data: any, type: Function, defaultNSPrefixMap?: any, elementName?: string, namespaceUri?: string): string {
        this.prefixCounter = 0;
        this.prefixMap = { ...(defaultNSPrefixMap || {"": ""}) };

        const xmlRootSchemas: RootSchema[] = Reflect.getMetadata("xml:root", type);

        if (!xmlRootSchemas) {
            throw new Error("Root type must specify @XMLRoot decorator");
        }

        if (xmlRootSchemas.length > 1 && !elementName) {
            throw new Error("Element name parameter is required when root type specifies multiple @XMLRoot decorators.");
        }

        let xmlSchema: RootSchema|null = null;
        if (xmlRootSchemas.length == 1 && !elementName) {
            xmlSchema = xmlRootSchemas[0];
        } else {
            for (let schema of xmlRootSchemas) {
                if (elementName === schema.name && (namespaceUri ? namespaceUri : "") == schema.namespaceUri) {
                    xmlSchema = schema;
                    break;
                }
            }
        }

        if (!xmlSchema) {
            throw new Error("Root type does not specify a @XMLRoot decorator for " + elementName);
        }

        // const xmlSchema = xmlRootSchemas[0];
        this.document = this.factory.createDocument(xmlSchema.namespaceUri, this.getQualifiedName(xmlSchema.name, xmlSchema.namespaceUri || ""), null);
        this.serializeObject(null, type, data, xmlSchema.name, xmlSchema.namespaceUri || "");

        if (!this.document) {
            throw new Error("Internal error. Document is null.");
        }

        const serializer = new XMLSerializer();
        const result = serializer.serializeToString(this.document);
        this.document = null;
        return result;
    }

    private getQualifiedAttributeName(attributeName: string, namespaceUri: string|null): string {
        // null namespaceUri = scoped to element, no prefix
        if (namespaceUri === null) {
            return attributeName;
        }

        return this.getQualifiedName(attributeName, namespaceUri);
    }

    public getQualifiedName(elementName: string, namespaceUri: string): string {
        if (!this.prefixMap.hasOwnProperty(namespaceUri)) {
            this.prefixMap[namespaceUri] = "p" + this.prefixCounter;
            this.prefixCounter++;
        }

        var prefix = this.prefixMap[namespaceUri];
        return prefix.length > 0 ? (prefix + ":" + elementName) : elementName;
    }

    private serializeObject(parentNode: Node|null, type: Function, data: any, elementName: string, namespaceUri: string) {
        if (!this.document) {
            throw new Error("Internal error. Document is null.");
        }

        let element: Element;
        if (parentNode === null) {
            element = this.document.documentElement;
        } else {
            element = this.document.createElementNS(namespaceUri, this.getQualifiedName(elementName, namespaceUri));
            parentNode.appendChild(element);
        }

        const children: BaseSchema[] = Reflect.getMetadata("xml:type:children", type) || [];
        for (let child of children) {
            if (isAttributeSchema(child)) {
                let value: any = data[child.propertyKey];
                if (value !== undefined) {
                    if (child.factory) {
                        value = child.factory[1](value, this);
                    } else {
                        value = this.convertValue(value, child.type);
                    }
                }

                if (value !== undefined) {
                    const attrName = this.getQualifiedAttributeName(child.name, child.namespaceUri);
                    element.setAttributeNS(child.namespaceUri, attrName, value);
                }
            } else if (isTextSchema(child)) {
                const value = this.convertValue(data[child.propertyKey], child.type);
                if (value !== undefined) {
                    element.appendChild(this.document.createTextNode(value));
                }
            }
        }

        for (let child of children) {
            if (isElementSchema(child)) {
                const value = data[child.propertyKey];
                if (value === undefined) {
                    // TODO: Throw if not optional
                    continue;
                }

                const elementItemType = this.getArrayItemType(child.types, value);
                if (!elementItemType || !elementItemType.itemType) {
                    throw new Error("Internal error " + JSON.stringify(child));
                }

                const elementType = elementItemType.itemType();
                this.serializeElement(element, elementItemType.name || elementType.name, elementItemType.namespaceUri || "", elementType, value);
            } else if (isArraySchema(child)) {
                const value = data[child.propertyKey];
                if (value === undefined) {
                    // TODO: Throw if not optional
                    continue;
                }

                this.serializeArray(element, child, value);
            }
        }
    }
    
    private convertValue(value: any, type: any) {
        if (value === undefined) {
            return;
        }

        if (type === String) {
            return value;
        } else if (type === Number) {
            return value.toString(); 
        } else if (type === Boolean) {
            return value.toString();
        } else if (type === Date) {
            return (value as Date).toISOString();
        } else {
            throw new Error("Cannot convert value " + value + " of " + type);
        }
    }

    private serializeElement(parentNode: Node, name: string, namespaceUri: string, elementType: Function, data: any) {

        if (!this.document || !elementType) {
            throw new Error("Internal error.");
        }

        if (elementType === Number || elementType === Boolean || elementType === String || elementType === Date) {
            this.serializeValueElement(parentNode, name, namespaceUri, elementType, data);
        } else if (typeof elementType === "function") {
            this.serializeObject(parentNode, elementType, data, name, namespaceUri);
        } else {
            throw new Error("Cannot serialize type " + elementType);
        }
    }
    
    private serializeValueElement(parentNode: Node, name: string, namespaceUri: string, elementType: Function, data: any) {
        if (!this.document) {
            throw new Error("Internal error.");
        }

        const element = this.document.createElementNS(namespaceUri, this.getQualifiedName(name, namespaceUri));
        element.appendChild(this.document.createTextNode(this.convertValue(data, elementType)));
        parentNode.appendChild(element);
    }

    private getArrayItemType(itemTypes: ArrayItemOptions[], dataItem: any): ArrayItemOptions|null {
        // First check if the data constructor matches any of the item types
        for (let schemaItemType of itemTypes) {
            if (!schemaItemType.itemType) {
                throw new Error("itemType must be specified. " +  + JSON.stringify(schemaItemType));
            }

            if (dataItem.constructor === schemaItemType.itemType()) {
                return schemaItemType;
            }
        }

        for (let schemaItemType of itemTypes) {
            if (!schemaItemType.itemType) {
                throw new Error("itemType must be specified. " +  + JSON.stringify(schemaItemType));
            }

            if (itemTypes.length === 1) {
                return schemaItemType;
            }

            if (!schemaItemType.isType) {
                throw new Error("When serializing a value with multiple types, the value must have a matching constructor or specify a callback for isType. " + JSON.stringify(schemaItemType));
            }

            if (schemaItemType.isType(dataItem)) {
                return schemaItemType;
            }
        }

        return null;
    }

    private serializeArray(parentNode: Node, schema: ArraySchema, data: any[]) {
        if (!this.document || schema.namespaceUri === null) {
            throw new Error("Internal error.");
        }

        if (schema.nested) {
            var nestedNode = this.document.createElementNS(schema.namespaceUri, this.getQualifiedName(schema.name, schema.namespaceUri));
            parentNode.appendChild(nestedNode);
            parentNode = nestedNode;
        }
        
        for (var i = 0; i < data.length; i++) {
            const dataItem = data[i];
            const dataItemType: ArrayItemOptions|null = this.getArrayItemType(schema.itemTypes, dataItem);

            if (!dataItemType) {
                throw new Error("Cannot find type for array item index " + i);
            }

            if (!dataItemType.itemType) {
                throw new Error("Cannot find itemType for array item index " + i);
            }

            const itemName = getArrayItemName(schema, dataItemType);

            this.serializeElement(parentNode, dataItemType.name || itemName, dataItemType.namespaceUri || "", dataItemType.itemType(), data[i]);
        }
    }
}
