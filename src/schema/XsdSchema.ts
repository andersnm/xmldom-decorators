import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from '../decorators';

export class Sequence {
    @XMLArray({name: "element", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Element, nested: false})
    element?: Element[];
}

export class ComplexType {
    @XMLElement({name: "sequence", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    sequence?: Sequence;
}

export class Element {
    @XMLAttribute()
    name?: string;

    @XMLAttribute()
    type?: string;

    @XMLElement({name: "complexType", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
    complexType?: ComplexType;
}

@XMLRoot({name: "schema", namespaceUri: "http://www.w3.org/2001/XMLSchema"})
export class Schema {

    @XMLArray({name: "element", namespaceUri: "http://www.w3.org/2001/XMLSchema", itemType: () => Element, nested: false})
    element?: Element[];
}
