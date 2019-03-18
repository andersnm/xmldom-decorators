import * as fs from 'fs';
import { XMLDecoratorDeserializer } from "xmldom-decorators";
import { Schema, QName, SimpleType, ComplexType, Element, Attribute } from "./xsdschema";

export class SchemaCollection {
    public schemas: Schema[] = [];

    public load(fileName: string) {
        const contents = fs.readFileSync(fileName, 'utf8') as string;
        const deser = new XMLDecoratorDeserializer();
        const schema = deser.deserialize<Schema>(contents, Schema);
    
        this.schemas.push(schema);

        const lastForwardSlash = fileName.lastIndexOf("/");
        const lastBackSlash = fileName.lastIndexOf("\\");
        let lastSlash = fileName.length;
        if (lastForwardSlash !== -1 && lastBackSlash === -1) {
            lastSlash = lastForwardSlash;
        } else if (lastForwardSlash === -1 && lastBackSlash !== -1) {
            lastSlash = lastBackSlash;
        } else if (lastForwardSlash !== -1 && lastBackSlash !== -1) {
            lastSlash = Math.max(lastForwardSlash, lastBackSlash);
        }

        const relativePath = fileName.substr(0, lastSlash + 1);

        for (let include of schema.imports) {
            if (!include.schemaLocation) {
                throw new Error("Include must specify schemaLocation");
            }

            const includeFileName = relativePath + include.schemaLocation;
            this.load(includeFileName);
        }
    }

    public get root(): Schema {
        return this.schemas[0];
    }

    public getSimpleType(name: QName): SimpleType|undefined {
        for (let schema of this.schemas) {
            if ((schema.targetNamespace || "") !== name.namespaceUri) {
                continue;
            }

            for (let simpleType of schema.simpleTypes) {
                if (simpleType.name === name.localName) {
                    return simpleType;
                }
            }
        }
    }

    public getComplexType(name: QName): ComplexType|undefined {
        for (let schema of this.schemas) {
            if ((schema.targetNamespace || "") !== name.namespaceUri) {
                continue;
            }

            for (let complexType of schema.complexTypes) {
                if (complexType.name === name.localName) {
                    return complexType;
                }
            }
        }
    }

    public getElement(name: QName): Element|undefined {
        for (let schema of this.schemas) {
            if ((schema.targetNamespace || "") !== name.namespaceUri) {
                continue;
            }

            for (let element of schema.elements) {
                if (element.name === name.localName) {
                    return element;
                }
            }
        }
    }

    public getAttribute(name: QName): Attribute|undefined {
        for (let schema of this.schemas) {
            if ((schema.targetNamespace || "") !== name.namespaceUri) {
                continue;
            }

            for (let attribute of schema.attributes) {
                if (attribute.name === name.localName) {
                    return attribute;
                }
            }
        }
    }
}
