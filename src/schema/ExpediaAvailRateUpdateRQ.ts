import { XMLRoot, XMLElement, XMLArray, XMLAttribute } from '../decorators';

export class Authentication {
    @XMLAttribute()
    username: string = "";

    @XMLAttribute()
    password: string = "";
}

// TODO: declare namespace on type as default if element doesn't set
// @XMLType({namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06"})
export class DateRange {
    @XMLAttribute()
    from: Date = null as any;

    @XMLAttribute()
    to: Date = null as any;

    @XMLAttribute()
    sun?: boolean;

    @XMLAttribute()
    mon?: boolean;

    @XMLAttribute()
    tue?: boolean;

    @XMLAttribute()
    wed?: boolean;

    @XMLAttribute()
    thu?: boolean;

    @XMLAttribute()
    fri?: boolean;

    @XMLAttribute()
    sat?: boolean;
}

export class RatePerDay {
    @XMLAttribute() // decimal
    rate?: number;
}

export class RatePerOccupancy {
    @XMLAttribute() // decimal
    rate?: number;

    @XMLAttribute() // int
    occupancy?: number;
}

export class RatePerPerson {
    @XMLAttribute() // decimal
    rate?: number;
}

export class Rate {
    @XMLAttribute()
    currency: string = "";

    @XMLAttribute()
    rateChangeIndicator?: boolean;

    @XMLAttribute()
    lengthOfStay?: number;

    @XMLElement({name: "PerDay", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06" })
    perDay?: RatePerDay;

    @XMLArray({name: "PerOccupancy", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06", itemType: RatePerOccupancy })
    perOccupancy?: RatePerOccupancy[];

    @XMLElement({name: "PerPerson", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06" })
    perPerson?: RatePerPerson;
}

export class Restriction {
    @XMLAttribute()
    minLOS?: number;

    @XMLAttribute()
    maxLOS?: number;

    @XMLAttribute()
    closedToArrival?: boolean;

    @XMLAttribute()
    closedToDeparture?: boolean;
}

export class RatePlan {
    @XMLAttribute()
    id?: string;

    @XMLAttribute()
    closed?: boolean;

    @XMLArray({name: "Rate", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06", itemType: Rate, nested: false })
    rate?: Rate[];

    @XMLArray({name: "Restrictions", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06", itemType: Restriction, nested: false })
    restrictions?: Restriction[];
}

export class Inventory {
    @XMLAttribute()
    flexibleAllocation?: number;

    @XMLAttribute()
    totalInventoryAvailable?: number;
}

export class RoomType {
    @XMLAttribute()
    id?: string;

    @XMLElement({name: "Inventory", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06" })
    inventory?: Inventory;

    @XMLArray({name: "RatePlan", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06", itemType: RatePlan, nested: false })
    ratePlan?: RatePlan[];
}

export class AvailRateUpdate {
    @XMLArray({name: "DateRange", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06", itemType: DateRange, nested: false})
    dateRange: DateRange[] = null as any;

    @XMLArray({name: "RoomType", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06", itemType: RoomType, nested: false})
    roomType?: RoomType[];
}

export class Hotel {
    @XMLAttribute()
    id: number = 0;
}

@XMLRoot({namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06"})
export class AvailRateUpdateRQ {

    @XMLElement({name: "Authentication", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06"})
    authentication: Authentication = null as any;

    @XMLElement({name: "Hotel", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06"})
    hotel: Hotel = null as any;

    /*
    Legacy
    @XMLElement({name: "DateRange", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06"})
    dateRange?: any;

    @XMLElement({name: "RoomType", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06"})
    roomType?: any;*/

    @XMLArray({name: "AvailRateUpdate", namespaceUri: "http://www.expediaconnect.com/EQC/AR/2011/06", itemType: AvailRateUpdate, nested: false})
    availRateUpdate?: AvailRateUpdate[];
}
