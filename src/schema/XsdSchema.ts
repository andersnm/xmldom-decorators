import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from '../decorators';
import { ElementAttributes } from 'xmldom/sax';
import { DeserializerContext } from '../deserializer';
import { SerializerContext } from '../serializer';

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
    @XMLArray({name: "element", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Element, nested: false})
    elements?: Element[];
    
    // Content: (annotation?, (element | group | choice | sequence | any)*)
}

export class Choice {
    @XMLArray({name: "element", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Element, nested: false})
    elements?: Element[];

    // Content: (annotation?, (element | group | choice | sequence | any)*)
}

export class SimpleContentExtension {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    base?: QName;

    @XMLArray({name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute, nested: false})
    attributes?: Attribute[];

    @XMLArray({name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup, nested: false})
    attributeGroups?: AttributeGroup[];

    // (annotation?, ((attribute | attributeGroup)*, anyAttribute?), assert*)
}

export class SimpleContent {
    @XMLElement({name: "extension", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    extension?: SimpleContentExtension;

    // (annotation?, (restriction | extension))
}

export class ComplexContentExtension {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    base?: QName;

    @XMLArray({name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute, nested: false})
    attributes?: Attribute[];

    @XMLArray({name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup, nested: false})
    attributeGroups?: AttributeGroup[];

    @XMLElement({name: "choice", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    choice?: Choice;

    @XMLElement({name: "sequence", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    sequence?: Sequence;

    // (annotation?, openContent?, ((group | all | choice | sequence)?, ((attribute | attributeGroup)*, anyAttribute?), assert*))
}

export class ComplexContentRestriction {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    base?: QName;

    @XMLArray({name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute, nested: false})
    attributes?: Attribute[];

    @XMLArray({name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup, nested: false})
    attributeGroups?: AttributeGroup[];

    @XMLElement({name: "choice", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    choice?: Choice;

    @XMLElement({name: "sequence", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    sequence?: Sequence;

    // (annotation?, openContent?, (group | all | choice | sequence)?, ((attribute | attributeGroup)*, anyAttribute?), assert*)
}

export class ComplexContent {
    @XMLElement({name: "extension", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    extension?: ComplexContentExtension;

    @XMLElement({name: "restriction", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    restriction?: ComplexContentRestriction;

    // (annotation?, (restriction | extension))
}

export class AttributeGroup {
    @XMLAttribute()
    name?: string;

    @XMLAttribute()
    ref?: string;

    @XMLArray({name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute, nested: false})
    attributes?: Attribute[];
}

export class ComplexType {
    @XMLAttribute()
    name?: string;

    @XMLElement({name: "sequence", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    sequence?: Sequence;

    @XMLArray({name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute, nested: false})
    attributes?: Attribute[];

    @XMLElement({name: "choice", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    choice?: Choice;

    @XMLElement({name: "simpleContent", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    simpleContent?: SimpleContent;

    @XMLElement({name: "complexContent", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    complexContent?: ComplexContent;

    @XMLArray({name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup, nested: false})
    attributeGroup?: AttributeGroup[];
}

export class SimpleTypeRestriction {
    @XMLAttribute({ factory: [ QNameReader, QNameWriter ]})
    base?: QName;

    @XMLArray({name: "enumeration", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Enumeration, nested: false})
    enumeration?: Enumeration[];

    // (annotation?, (simpleType?, (minExclusive | minInclusive | maxExclusive | maxInclusive | totalDigits | fractionDigits | length | minLength | maxLength | enumeration | whiteSpace | pattern | assertion | explicitTimezone | {any with namespace: ##other})*))
}

export class SimpleTypeUnion {
    @XMLAttribute({factory: [QNameArrayReader, QNameArrayWriter]})
    memberTypes?: QName[];

    @XMLArray({name: "simpleType", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => SimpleType, nested: false})
    simpleType?: SimpleType[];

    // (annotation?, simpleType*)
}

export class SimpleType {
    @XMLAttribute()
    name?: string;

    @XMLElement({name: "restriction", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    restriction?: SimpleTypeRestriction;

    @XMLElement({name: "union", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
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

    @XMLElement({name: "simpleType", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    simpleType?: SimpleType;
}

export class Element {
    @XMLAttribute()
    id?: string;

    @XMLAttribute()
    name?: string;

    @XMLAttribute()
    targetNamespace?: string;

    @XMLAttribute()
    type?: string;

    @XMLAttribute()
    ref?: string;

    @XMLAttribute()
    minOccurs?: number;

    @XMLAttribute()
    maxOccurs?: string; // TODO: number|string => decorator Object

    @XMLAttribute()
    nillable?: boolean;

    @XMLElement({name: "complexType", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    complexType?: ComplexType;

    @XMLElement({name: "simpleType", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
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

    @XMLArray({name: "import", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Import, nested: false})
    imports?: Import[];

    // TODO: is the order of (Element|ComplexType|SimpleType) significant?
    @XMLArray({name: "element", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Element, nested: false})
    elements?: Element[];

    @XMLArray({name: "complexType", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => ComplexType, nested: false})
    complexTypes?: ComplexType[];

    @XMLArray({name: "simpleType", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => SimpleType, nested: false})
    simpleTypes?: SimpleType[];

    @XMLArray({name: "attributeGroup", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => AttributeGroup, nested: false})
    attributeGroup?: AttributeGroup[];
}
