import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from 'xmldom-decorators';
// import { ElementAttributes } from 'xmldom/sax';
import { DeserializerContext } from 'xmldom-decorators';
import { SerializerContext } from 'xmldom-decorators';

export interface QName {
    localName: string;
    namespaceUri: string;
}

function QNameReader(value: string, ctx: DeserializerContext): QName {
    const cpos = value.indexOf(":");
    const prefix = cpos !== -1 ? value.substr(0, cpos) : "";
    let namespaceUri = "";
    if (prefix) {
        namespaceUri = ctx.resolvePrefix(prefix);
    }

    return { localName: value.substr(cpos + 1), namespaceUri: namespaceUri };
}

function QNameWriter(value: QName, ctx: SerializerContext): string {
    return ctx.getQualifiedName(value.localName, value.namespaceUri);
}

function QNameArrayReader(value: string, ctx: DeserializerContext): QName[] {
    const parts = value.split(" ");
    const result: QName[] = [];
    for (var i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        const cpos = part.indexOf(":");
        const prefix = cpos !== -1 ? part.substr(0, cpos) : "";
        let namespaceUri = "";
        if (prefix) {
            namespaceUri = ctx.resolvePrefix(prefix);
        }

        result.push({ localName: part.substr(cpos + 1), namespaceUri: namespaceUri });
    }

    return result;
}

function QNameArrayWriter(value: QName[], ctx: SerializerContext): string {
    return value.map(v => ctx.getQualifiedName(v.localName, v.namespaceUri)).join(" ");
}

export class Sequence {
    @XMLArray({nested: false, itemTypes: [{name: "element", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Element}]})
    elements?: Element[];
    
    // Content: (annotation?, (element | group | choice | sequence | any)*)
}

export class Choice {
    @XMLArray({nested: false, itemTypes: [{name: "element", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Element}]})
    elements?: Element[];

    // Content: (annotation?, (element | group | choice | sequence | any)*)
}

export class SimpleContentExtension {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    base?: QName;

    @XMLArray({nested: false, itemTypes: [{name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute}]})
    attributes?: Attribute[];

    @XMLArray({nested: false, itemTypes: [{name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup}]})
    attributeGroups?: AttributeGroup[];

    // (annotation?, ((attribute | attributeGroup)*, anyAttribute?), assert*)
}

export class SimpleContent {
    @XMLElement({types: [{name: "extension", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    extension?: SimpleContentExtension;

    // (annotation?, (restriction | extension))
}

export class ComplexContentExtension {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    base?: QName;

    @XMLArray({nested: false, itemTypes: [{name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute}]})
    attributes?: Attribute[];

    @XMLArray({nested: false, itemTypes: [{name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup}]})
    attributeGroups?: AttributeGroup[];

    @XMLElement({types: [{name: "choice", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    choice?: Choice;

    @XMLElement({types: [{name: "sequence", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    sequence?: Sequence;

    // (annotation?, openContent?, ((group | all | choice | sequence)?, ((attribute | attributeGroup)*, anyAttribute?), assert*))
}

export class ComplexContentRestriction {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    base?: QName;

    @XMLArray({nested: false, itemTypes: [{name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute}]})
    attributes?: Attribute[];

    @XMLArray({nested: false, itemTypes: [{name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup}]})
    attributeGroups?: AttributeGroup[];

    @XMLElement({types: [{name: "choice", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    choice?: Choice;

    @XMLElement({types: [{name: "sequence", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    sequence?: Sequence;

    // (annotation?, openContent?, (group | all | choice | sequence)?, ((attribute | attributeGroup)*, anyAttribute?), assert*)
}

export class ComplexContent {
    @XMLElement({types: [{name: "extension", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    extension?: ComplexContentExtension;

    @XMLElement({types: [{name: "restriction", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    restriction?: ComplexContentRestriction;

    // (annotation?, (restriction | extension))
}

export class AttributeGroup {
    @XMLAttribute()
    name?: string;

    @XMLAttribute()
    ref?: string;

    @XMLArray({nested: false, itemTypes: [{name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute}]})
    attributes?: Attribute[];
}

export class ComplexType {
    @XMLAttribute()
    name?: string;

    @XMLElement({types: [{name: "choice", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    choice?: Choice;

    @XMLElement({types: [{name: "sequence", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    sequence?: Sequence;

    @XMLArray({nested: false, itemTypes: [{name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute}]})
    attributes?: Attribute[];

    @XMLArray({nested: false, itemTypes: [{name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup}]})
    attributeGroups?: AttributeGroup[];

    @XMLElement({types:[{name: "simpleContent", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    simpleContent?: SimpleContent;

    @XMLElement({types:[{name: "complexContent", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    complexContent?: ComplexContent;
}

export class SimpleTypeRestriction {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    base?: QName;

    @XMLArray({nested: false, itemTypes: [{name: "enumeration", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Enumeration}]})
    enumeration?: Enumeration[];

    // (annotation?, (simpleType?, (minExclusive | minInclusive | maxExclusive | maxInclusive | totalDigits | fractionDigits | length | minLength | maxLength | enumeration | whiteSpace | pattern | assertion | explicitTimezone | {any with namespace: ##other})*))
}

export class SimpleTypeUnion {
    @XMLAttribute({factory: [QNameArrayReader, QNameArrayWriter]})
    memberTypes?: QName[];

    @XMLArray({nested: false, itemTypes: [{name: "simpleType", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => SimpleType}]})
    simpleType?: SimpleType[];

    // (annotation?, simpleType*)
}

export class SimpleType {
    @XMLAttribute()
    name?: string;

    @XMLElement({types:[{name: "restriction", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    restriction?: SimpleTypeRestriction;

    @XMLElement({types:[{name: "union", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    union?: SimpleTypeUnion;

    // (annotation?, (restriction | list | union))
}

export class Enumeration {
    @XMLAttribute()
    value?: string;
}

export class Attribute {
    @XMLAttribute()
    name?: string;

    @XMLAttribute()
    targetNamespace?: string;

    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    type?: QName;

    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    ref?: QName;

    @XMLAttribute()
    use?: string;

    @XMLElement({types:[{name: "simpleType", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    simpleType?: SimpleType;
}

export class Element {
    @XMLAttribute()
    id?: string;

    @XMLAttribute()
    name?: string;

    @XMLAttribute()
    targetNamespace?: string;

    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    type?: QName;

    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    ref?: QName;

    @XMLAttribute()
    minOccurs?: number;

    @XMLAttribute()
    maxOccurs?: string; // TODO: number|string => decorator Object

    @XMLAttribute()
    nillable?: boolean;

    @XMLElement({types:[{name: "complexType", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    complexType?: ComplexType;

    @XMLElement({types:[{name: "simpleType", namespaceUri: "http://www.w3.org/2001/XMLSchema"}]})
    simpleType?: SimpleType;
}

export class Import {
    @XMLAttribute()
    schemaLocation?: string;

    @XMLAttribute()
    namespace?: string;
}

@XMLRoot({name: "schema", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
export class Schema {

    @XMLAttribute()
    targetNamespace?: string;

    @XMLAttribute()
    elementFormDefault?: string;

    @XMLAttribute()
    attributeFormDefault?: string;

    @XMLArray({nested: false, itemTypes:[
        {name: "include", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Import},
        {name: "import", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Import},
        {name: "element", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Element},
        {name: "complexType", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => ComplexType},
        {name: "simpleType", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => SimpleType},
        {name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute},
        {name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup}
    ]})
    items: (Import|Element|ComplexType|SimpleType|Attribute|AttributeGroup)[] = [];

    get imports(): Import[] {
        return this.items.filter((i): i is Import => i instanceof Import);
    }

    get elements(): Element[] {
        return this.items.filter((i): i is Element => i instanceof Element);
    }

    get complexTypes(): ComplexType[] {
        return this.items.filter((i): i is ComplexType => i instanceof ComplexType);
    }

    get simpleTypes(): SimpleType[] {
        return this.items.filter((i): i is SimpleType => i instanceof SimpleType);
    }

    get attributeGroups(): AttributeGroup[] {
        return this.items.filter((i): i is AttributeGroup => i instanceof AttributeGroup);
    }

    get attributes(): Attribute[] {
        return this.items.filter((i): i is Attribute => i instanceof Attribute);
    }
}
