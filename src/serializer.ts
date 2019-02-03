import { PropertySchema, ArraySchema } from "./decorators";
import { DOMImplementation, XMLSerializer } from "xmldom";

export class XMLDecoratorSerializer {
    factory: DOMImplementation = new DOMImplementation();
    document: Document|null = null;

    public serialize(data: any, type: Function): string {
		const xmlRootSchemas = Reflect.getMetadata("xml:root", type);
		if (!xmlRootSchemas) {
			throw new Error("Root type must specify @xmlRoot decorator");
        }

        // TODO: find matching schema
 		const xmlSchema = xmlRootSchemas[0];
        this.document = this.factory.createDocument(xmlSchema.namespaceUri, xmlSchema.name, null);
 		this.serializeObject(null, type, data, xmlSchema.name, xmlSchema.namespaceUri);

        if (!this.document) {
            throw new Error("Internal error. Document is null.");
        }

        const serializer = new XMLSerializer();
        const result = serializer.serializeToString(this.document);
        this.document = null;
        return result;
    }

	private serializeObject(parentNode: Node|null, type: Function, data: any, elementName: string, namespaceUri: string) {
        if (!this.document) {
            throw new Error("Internal error. Document is null.");
        }

        let element: Element;
        if (parentNode === null) {
            element = this.document.documentElement;
        } else {
            if (!this.document) {
                throw new Error("Internal error. Document is null.");
            }
    
            element = this.document.createElementNS(namespaceUri, elementName);
            parentNode.appendChild(element);
        }

		const children: PropertySchema[] = Reflect.getMetadata("xml:type:children", type) || [];
		for (let child of children) {
			if (child.xmlType === "attribute") {
                const value = this.convertValue(data[child.propertyKey], child.type);
                if (value !== undefined) {
                    element.setAttributeNS(child.namespaceUri, child.name, value);
                }
			}
		}

		for (let child of children) {
            const value = data[child.propertyKey];
            if (value === undefined) {
                continue;
            }

			if (child.xmlType === "element") {
				this.serializeElement(element, child, value);
			} else if (child.xmlType === "array") {
				this.serializeArray(element, child as ArraySchema, value);
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
            throw new Error("Cannot convert value " + value);
        }
    }

	private serializeElement(parentNode: Node, schema: PropertySchema, data: any) {
        if (!this.document) {
            throw new Error("Internal error. Document is null.");
        }

        if (schema.type === Number || schema.type === Boolean || schema.type === String || schema.type === Date) {
            this.serializeValueElement(parentNode, schema, data);
		} else if (typeof schema.type === "function") {
			this.serializeObject(parentNode, schema.type, data, schema.name, schema.namespaceUri);
		} else {
			throw new Error("Canot serialize type " + schema.type);
		}
    }
    
	private serializeValueElement(parentNode: Node, schema: PropertySchema, data: any) {
        if (!this.document) {
            throw new Error("Internal error. Document is null.");
        }

        const element = this.document.createElementNS(schema.namespaceUri, schema.name);
        element.appendChild(this.document.createTextNode(this.convertValue(data, schema.type)));
        parentNode.appendChild(element);
    }

	private serializeArray(parentNode: Node, schema: ArraySchema, data: any[]) {
        if (!this.document) {
            throw new Error("Internal error. Document is null.");
        }

        if (schema.nested) {
            var nestedNode = this.document.createElementNS(schema.namespaceUri, schema.name);
            parentNode.appendChild(nestedNode);
            parentNode = nestedNode;
		}

		const itemSchema: PropertySchema = {
			...schema,
			type: schema.itemType,
			name: schema.itemName,
		};
		
		for (var i = 0; i < data.length; i++) {
			this.serializeElement(parentNode, itemSchema, data[i]);
		}
	}
}
