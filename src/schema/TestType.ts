import { XMLRoot, XMLElement, XMLArray, XMLAttribute } from '../decorators';

export class FrisparkType {
    @XMLAttribute()
    x: string = "";

    @XMLArray({itemTypes: [{itemType: () => Number, name: "num"}]})
    nums?: number[];

    @XMLArray({itemTypes: [{itemType: () => String}], nested: false })
    s?: string[];
}

@XMLRoot({name: "test", namespaceUri: "uri-x"})
export class TestType {
    @XMLElement()
    frispark: FrisparkType = new FrisparkType();

    @XMLElement()
    mektig: string = "";
}
