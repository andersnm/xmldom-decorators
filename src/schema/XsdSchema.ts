import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from '../decorators';

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

export class ComplexType {
    @XMLAttribute()
    name?: string;

    @XMLElement({name: "sequence", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    sequence?: Sequence;

    @XMLArray({name: "attribute", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Attribute, nested: false})
    attributes?: Attribute[];

    @XMLElement({name: "choice", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    choice?: Choice;

    // complexContent, simpleContent, 
}

export class Restriction {
    @XMLArray({name: "enumeration", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Enumeration, nested: false})
    enumeration?: Enumeration[];

    @XMLAttribute()
    base?: string;
}

export class SimpleType {
    @XMLElement({name: "restriction", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    restriction?: Restriction;
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

    @XMLAttribute()
    type?: string;

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

    // attributeGroup
}
