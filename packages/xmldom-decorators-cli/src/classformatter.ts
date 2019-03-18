import { EOL } from "os";
import { SchemaClass, SchemaMember } from "./classtypes";

export function formatClasses(classes: SchemaClass[]): string {
    const output: string[] = [];

    output.push("import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from \"xmldom-decorators\";" + EOL + EOL)
    
    const reverse = new Array(...classes).reverse();

    for (let cls of reverse) {
        formatClass(cls, output);
    }

    return output.join("");
}

function formatAttributeDecorator(m: SchemaMember) {
    const options = [];

    if (m.javaScriptName !== m.name) {
        options.push("name: \"" + m.name + "\"");
    }

    if (m.namespaceUri !== null) {
        options.push("namespaceUri: \"" + m.namespaceUri + "\"");
    }

    if (options.length > 0) {
        return "{" + options.join(", ") + "}";
    }

    return "";
}

function formatElementDecorator(m: SchemaMember) {
    let options = [];

    // if (m.javaScriptName !== m.name) {
        options.push("name: \"" + m.name + "\"");
    // }

    if (m.namespaceUri !== "") {
        options.push("namespaceUri: \"" + m.namespaceUri + "\"");
    }

    if (options.length > 0) {
        return "{types: [{ " + options.join(", ")  + " }]}";
    }

    return "";
}

function formatDefault(m: SchemaMember): string {

    if (m.minOccurs == 0) {
        return "";
    }

    if (isArrayElement(m)) {
        return " = []";
    }

    if (m.type.javaScriptType === "String") {
        return " = \"\"";
    }

    if (m.type.javaScriptType === "Number") {
        return " = 0";
    }

    if (m.type.javaScriptType === "Date") {
        return " = new Date(-8640000000000000)";
    }

    if (m.type.type === "complexType") {
        return " = new " + m.type.javaScriptType + "()";
    }

    return "";
}

function isArrayElement(e: SchemaMember): boolean {
    if (e.maxOccurs === undefined) {
        return false;
    }

    if (e.maxOccurs === "unbounded") {
        return true;
    }

    const i = parseInt(e.maxOccurs);
    if (isNaN(i))
        return false;
    
    return i > 1;
}

function formatOptional(m: SchemaMember): string {
    if (m.minOccurs === 0) {
        return "?";
    }

    return "";
}

function formatArrayDecorator(m: SchemaMember) {
    const options = [];
    if (m.name !== m.javaScriptName) {
        options.push("name: \"" + m.name + "\"");
    }

    if (m.namespaceUri !== "") {
        options.push("namespaceUri: \"" + m.namespaceUri + "\"");
    }

    // "namespaceUri: \"" + m.namespaceUri + "\", itemType: () => " + m.type.javaScriptType
    options.push("itemType: () => " + m.type.javaScriptType);
    return "{" + options.join(", ") + "}";
}

const typeMap: { [key:string]: string} = {
    "Number": "number",
    "String": "string",
    "Boolean": "boolean",
    "Date": "Date",
};

function getTypeScriptType(e: SchemaClass) {
    if (e.type === "builtinType") {
        return typeMap[e.javaScriptType];
    }

    return e.javaScriptType;
}

export function formatClass(e: SchemaClass, output: string[]) {

    output.push("@XMLRoot({name: \"" + e.name + "\", namespaceUri: \"" + e.namespaceUri + "\"})" + EOL);
    output.push("export class " + e.javaScriptType + " {" + EOL);
    for (let m of e.members) {
        if (m.xmlType === "attribute") {
            output.push("    @XMLAttribute(" + formatAttributeDecorator(m) + ")" + EOL);
            output.push("    " + m.javaScriptName + formatOptional(m) + ": " + getTypeScriptType(m.type) + formatDefault(m) + ";" + EOL + EOL);
        } else if (m.xmlType === "element" && !isArrayElement(m)) {
            output.push("    @XMLElement(" + formatElementDecorator(m) + ")" + EOL);
            output.push("    " + m.javaScriptName + formatOptional(m) + ": " + getTypeScriptType(m.type) + formatDefault(m) + ";" + EOL + EOL);
        } else if (m.xmlType === "element" && isArrayElement(m)) {
            output.push("    @XMLArray({nested: false, itemTypes: [" + formatArrayDecorator(m) + "]})" + EOL);
            output.push("    " + m.javaScriptName + formatOptional(m) + ": " + getTypeScriptType(m.type) + "[]" + formatDefault(m) + ";" + EOL + EOL);
        } else if (m.xmlType === "text") {
            output.push("    @XMLText()" + EOL);
            output.push("    " + m.javaScriptName + formatOptional(m) + ": " + getTypeScriptType(m.type) + formatDefault(m) + ";" + EOL + EOL);
        } else {
            throw new Error("Unhandled xmlType " + m.xmlType);
        }
    }
    output.push("}" + EOL + EOL);
}