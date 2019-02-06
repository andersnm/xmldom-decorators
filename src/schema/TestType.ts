import { XMLRoot, XMLElement, XMLArray, XMLAttribute } from '../decorators';

export class FrisparkType {
    @XMLAttribute()
    x: string = "";

    @XMLArray({itemType: () => Number, itemName: "num"})
    nums?: number[];

    @XMLArray({itemType: () => String, itemName: "num", nested: false })
    s?: string[];
}

@XMLRoot({name: "test", namespaceUri: "uri-x"})
export class TestType {
    @XMLElement()
    frispark: FrisparkType = new FrisparkType();

    @XMLElement()
    mektig: string = "";
}
