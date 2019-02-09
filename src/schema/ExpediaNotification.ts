import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from '../decorators';

@XMLRoot({namespaceUri: "http://schemas.xmlsoap.org/soap/envelope/"})
export class SOAPEnvelope {
    @XMLElement({name: "Header", namespaceUri: "http://schemas.xmlsoap.org/soap/envelope/" })
    header: SOAPHeader = new SOAPHeader();

    @XMLElement({name: "Body", namespaceUri: "http://schemas.xmlsoap.org/soap/envelope/" })
    body: SOAPBody = new SOAPBody();
}

export class SOAPBody {
    @XMLElement({name: "OTA_HotelResNotifRQ", namespaceUri: "http://www.opentravel.org/OTA/2003/05" })
    otaHotelResNotifRQ?: OTA_HotelResNotifRQ;

    @XMLElement({name: "OTA_HotelResModifyNotifRQ", namespaceUri: "http://www.opentravel.org/OTA/2003/05" })
    otaHotelResModifyNotifRQ?: OTA_HotelResModifyNotifRQ;

    @XMLElement({name: "OTA_CancelRQ", namespaceUri: "http://www.opentravel.org/OTA/2003/05" })
    otaCancelRQ?: OTA_CancelRQ;
}

export class SOAPHeader {
    @XMLElement({name: "Interface", namespaceUri: "http://www.newtrade.com/expedia/R14/header"})
    headerInterface?: Interface;
}

export class Interface {
    @XMLAttribute({name: "Name"})
    name?: string;

    @XMLAttribute({name: "Version"})
    version?: number;

    @XMLElement({name: "PayloadInfo", namespaceUri: "http://www.newtrade.com/expedia/R14/header"})
    payloadInfo?: PayloadInfo;
}

export class PayloadInfo {
    @XMLAttribute({name: "RequestId"})
    requestId?: string;

    @XMLAttribute({name: "RequestorId"})
    requestorId?: string;

    @XMLAttribute({name: "ResponderId"})
    responderId?: string;

    @XMLAttribute({name: "ExpirationDateTime"})
    expirationDateTime?: Date;

    @XMLAttribute({name: "Location"})
    location?: string;

    @XMLElement({name: "CommDescriptor", namespaceUri: "http://www.newtrade.com/expedia/R14/header"})
    commDescriptor?: CommDescriptor;

    @XMLElement({name: "PayloadDescriptor", namespaceUri: "http://www.newtrade.com/expedia/R14/header"})
    payloadDescriptor: PayloadDescriptor = new PayloadDescriptor();
}

export class PayloadDescriptor {
    @XMLAttribute({name: "Name"})
    name?: string;

    @XMLAttribute({name: "Version"})
    version?: string;

    @XMLElement({name: "PayloadReference", namespaceUri: "http://www.newtrade.com/expedia/R14/header"})
    payloadReference?: PayloadReference;
}


export class PayloadReference {
    @XMLAttribute({name: "SupplierHotelCode"})
    supplierHotelCode?: string;

    @XMLAttribute({name: "DistributorHotelId"})
    distributorHotelId?: string;
}

export class CommDescriptor {
    @XMLElement({name: "Authentication", namespaceUri: "http://www.newtrade.com/expedia/R14/header"})
    authentication?: Authentication;

    @XMLAttribute({name: "SourceId"})
    sourceId: string = "";

    @XMLAttribute({name: "DestinationId"})
    destinationId: string = "";

    @XMLAttribute({name: "RetryIndicator"})
    retryIndicator?: boolean;
}

export class Authentication {
    @XMLAttribute({name: "Username"})
    userName?: string;

    @XMLAttribute({name: "Password"})
    password?: string;
}

export class OTA_HotelResNotifRQ {
}

export class OTA_HotelResModifyNotifRQ {
}

export class OTA_CancelRQ {
}
