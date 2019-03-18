import { SimpleType } from "./xsdschema";

export interface SchemaMember {
    name: string;
    javaScriptName: string;
    namespaceUri: string|null; // only attributes can have null
    type: SchemaClass; // TODO: SchemaClass?
    xmlType: 'attribute' | 'element' | 'array' | 'text';
    minOccurs?: number;
    maxOccurs?: string;
}

export interface SchemaClass {
    type: "complexType" | "simpleType" | "builtinType" | "elementType";
    javaScriptType: string;
    simpleType?: SimpleType;
    name: string;
    namespaceUri: string;
    members: SchemaMember[];
}