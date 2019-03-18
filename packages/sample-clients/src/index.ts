import fetch from "node-fetch";
import { XMLDecoratorDeserializer } from "xmldom-decorators";
import { weatherdata } from "./met.no/reference";
import { data_set_description } from "./openml.org/reference";

async function locationForecast(lat: number, lng: number): Promise<void> {
    const res = await fetch(`https://api.met.no/weatherapi/locationforecast/1.9/?lat=${lat}&lon=${lng}&msl=70`);

    const xml = await res.text();

    const deser = new XMLDecoratorDeserializer();
    const o = deser.deserialize(xml, weatherdata);

    // console.log(xml);
    console.log(JSON.stringify(o, null, " "));
}

async function dataSetDescription(id: number) {
    const res = await fetch(`https://www.openml.org/api/v1/data/${id}`);
    const xml = await res.text();

    const deser = new XMLDecoratorDeserializer();
    const o = deser.deserialize(xml, data_set_description);

    // console.log(xml);
    console.log(JSON.stringify(o, null, " "));
}

if (process.argv[2] === "location") {
    locationForecast(60.1, 9.58);
} else if (process.argv[2] === "dataset") {
    dataSetDescription(61);
} else {
    console.log("Usage: sample-clients [ location | dataset ]")
}

// TODO: support soap, wsdl https://stackoverflow.com/questions/1958048/public-soap-web-services
