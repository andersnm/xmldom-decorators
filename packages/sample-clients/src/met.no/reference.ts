import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from "xmldom-decorators";

@XMLRoot({name: "", namespaceUri: ""})
export class LocationTypeForestFire {
    @XMLAttribute()
    unit: string = "";

    @XMLAttribute()
    value: string = "";

}

@XMLRoot({name: "", namespaceUri: ""})
export class LocationTypeSymbol {
    @XMLAttribute()
    id: string = "";

    @XMLAttribute()
    name: string = "";

    @XMLAttribute()
    number: number = 0;

}

@XMLRoot({name: "", namespaceUri: ""})
export class LocationTypeWeather {
    @XMLAttribute()
    name: string = "";

    @XMLAttribute()
    number: number = 0;

    @XMLAttribute()
    id: string = "";

    @XMLAttribute()
    symbol: number = 0;

}

@XMLRoot({name: "", namespaceUri: ""})
export class LocationTypeSnowDepth {
    @XMLAttribute()
    cm: number = 0;

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "", namespaceUri: ""})
export class LocationTypeStateOfTheSea {
    @XMLAttribute()
    number: number = 0;

    @XMLAttribute()
    meter: string = "";

    @XMLAttribute()
    name: string = "";

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "windspeed", namespaceUri: ""})
export class Windspeed {
    @XMLAttribute()
    mps: number = 0;

    @XMLAttribute()
    name: string = "";

    @XMLAttribute()
    beaufort: number = 0;

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "", namespaceUri: ""})
export class LocationTypeWindDirection {
    @XMLAttribute()
    deg: number = 0;

    @XMLAttribute()
    name: string = "";

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "score", namespaceUri: ""})
export class Score {
    @XMLAttribute()
    unit: string = "";

    @XMLAttribute()
    overall: number = 0;

    @XMLAttribute({name: "very_good"})
    veryGood: number = 0;

    @XMLAttribute()
    good: number = 0;

    @XMLAttribute()
    mediocre: number = 0;

}

@XMLRoot({name: "tidalwater", namespaceUri: ""})
export class Tidalwater {
    @XMLAttribute()
    unit: string = "";

    @XMLAttribute()
    tidal: number = 0;

    @XMLAttribute()
    weathercorrection: number = 0;

}

@XMLRoot({name: "unit_value", namespaceUri: ""})
export class UnitValue {
    @XMLAttribute()
    unit: string = "";

    @XMLAttribute()
    value: number = 0;

}

@XMLRoot({name: "uv", namespaceUri: ""})
export class Uv {
    @XMLElement({types: [{ name: "uvi_clear" }]})
    uviClear: UnitValue = new UnitValue();

    @XMLElement({types: [{ name: "uvi_partly_cloudy" }]})
    uviPartlyCloudy: UnitValue = new UnitValue();

    @XMLElement({types: [{ name: "uvi_cloudy" }]})
    uviCloudy: UnitValue = new UnitValue();

    @XMLElement({types: [{ name: "uvi_forecast" }]})
    uviForecast: UnitValue = new UnitValue();

    @XMLElement({types: [{ name: "ozon" }]})
    ozon: UnitValue = new UnitValue();

    @XMLElement({types: [{ name: "snowcover" }]})
    snowcover: UnitValue = new UnitValue();

    @XMLElement({types: [{ name: "cloudcover" }]})
    cloudcover: UnitValue = new UnitValue();

    @XMLElement({types: [{ name: "albedo" }]})
    albedo: UnitValue = new UnitValue();

    @XMLElement({types: [{ name: "solar_zenith" }]})
    solarZenith: UnitValue = new UnitValue();

}

@XMLRoot({name: "cloudiness", namespaceUri: ""})
export class Cloudiness {
    @XMLAttribute()
    eights: number = 0;

    @XMLAttribute()
    percent: string = "";

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "temperature", namespaceUri: ""})
export class Temperature {
    @XMLAttribute()
    unit: string = "";

    @XMLAttribute()
    value: number = 0;

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "precipitation", namespaceUri: ""})
export class Precipitation {
    @XMLAttribute()
    unit: string = "";

    @XMLAttribute()
    value: number = 0;

    @XMLAttribute()
    minvalue: number = 0;

    @XMLAttribute()
    maxvalue: number = 0;

    @XMLAttribute()
    probability: number = 0;

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "pressure", namespaceUri: ""})
export class Pressure {
    @XMLAttribute()
    unit: string = "";

    @XMLAttribute()
    value: number = 0;

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "groundcover", namespaceUri: ""})
export class Groundcover {
    @XMLAttribute()
    number: number = 0;

    @XMLAttribute()
    name: string = "";

    @XMLAttribute()
    id: string = "";

}

@XMLRoot({name: "locationType", namespaceUri: ""})
export class LocationType {
    @XMLAttribute()
    id: string = "";

    @XMLAttribute()
    name: string = "";

    @XMLAttribute()
    stationid: number = 0;

    @XMLAttribute()
    country: string = "";

    @XMLAttribute()
    county: string = "";

    @XMLAttribute()
    latitude: string = "";

    @XMLAttribute()
    longitude: string = "";

    @XMLAttribute()
    altitude: string = "";

    @XMLElement({types: [{ name: "groundCover" }]})
    groundCover?: Groundcover;

    @XMLElement({types: [{ name: "pressure" }]})
    pressure?: Pressure;

    @XMLElement({types: [{ name: "maximumPrecipitation" }]})
    maximumPrecipitation?: Precipitation;

    @XMLElement({types: [{ name: "highestTemperature" }]})
    highestTemperature?: Temperature;

    @XMLElement({types: [{ name: "lowestTemperature" }]})
    lowestTemperature?: Temperature;

    @XMLElement({types: [{ name: "precipitation" }]})
    precipitation?: Precipitation;

    @XMLElement({types: [{ name: "fog" }]})
    fog?: Cloudiness;

    @XMLElement({types: [{ name: "cloudiness" }]})
    cloudiness?: Cloudiness;

    @XMLElement({types: [{ name: "lowClouds" }]})
    lowClouds?: Cloudiness;

    @XMLElement({types: [{ name: "mediumClouds" }]})
    mediumClouds?: Cloudiness;

    @XMLElement({types: [{ name: "highClouds" }]})
    highClouds?: Cloudiness;

    @XMLElement({types: [{ name: "temperature" }]})
    temperature?: Temperature;

    @XMLElement({types: [{ name: "dewpointTemperature" }]})
    dewpointTemperature?: Temperature;

    @XMLElement({types: [{ name: "minTemperature" }]})
    minTemperature?: Temperature;

    @XMLElement({types: [{ name: "minTemperatureDay" }]})
    minTemperatureDay?: Temperature;

    @XMLElement({types: [{ name: "minTemperatureNight" }]})
    minTemperatureNight?: Temperature;

    @XMLElement({types: [{ name: "maxTemperature" }]})
    maxTemperature?: Temperature;

    @XMLElement({types: [{ name: "maxTemperatureDay" }]})
    maxTemperatureDay?: Temperature;

    @XMLElement({types: [{ name: "maxTemperatureNight" }]})
    maxTemperatureNight?: Temperature;

    @XMLElement({types: [{ name: "uv" }]})
    uv?: Uv;

    @XMLElement({types: [{ name: "tidalwater" }]})
    tidalwater?: Tidalwater;

    @XMLElement({types: [{ name: "currentDirection" }]})
    currentDirection?: UnitValue;

    @XMLElement({types: [{ name: "maxWaveHeight" }]})
    maxWaveHeight?: UnitValue;

    @XMLElement({types: [{ name: "surfaceTemperature" }]})
    surfaceTemperature?: UnitValue;

    @XMLElement({types: [{ name: "waveDirection" }]})
    waveDirection?: UnitValue;

    @XMLElement({types: [{ name: "wavePeriod" }]})
    wavePeriod?: UnitValue;

    @XMLElement({types: [{ name: "waveHeight" }]})
    waveHeight?: UnitValue;

    @XMLElement({types: [{ name: "humidity" }]})
    humidity?: UnitValue;

    @XMLElement({types: [{ name: "bias" }]})
    bias?: UnitValue;

    @XMLElement({types: [{ name: "numberofobservations" }]})
    numberofobservations?: UnitValue;

    @XMLElement({types: [{ name: "meanabsoluteerror" }]})
    meanabsoluteerror?: UnitValue;

    @XMLElement({types: [{ name: "score" }]})
    score?: Score;

    @XMLElement({types: [{ name: "windDirection" }]})
    windDirection?: LocationTypeWindDirection;

    @XMLElement({types: [{ name: "windSpeed" }]})
    windSpeed?: Windspeed;

    @XMLElement({types: [{ name: "windGust" }]})
    windGust?: Windspeed;

    @XMLElement({types: [{ name: "maxWindSpeed" }]})
    maxWindSpeed?: Windspeed;

    @XMLElement({types: [{ name: "areaMaxWindSpeed" }]})
    areaMaxWindSpeed?: Windspeed;

    @XMLElement({types: [{ name: "stateOfTheSea" }]})
    stateOfTheSea?: LocationTypeStateOfTheSea;

    @XMLElement({types: [{ name: "snowDepth" }]})
    snowDepth?: LocationTypeSnowDepth;

    @XMLElement({types: [{ name: "weather" }]})
    weather?: LocationTypeWeather;

    @XMLElement({types: [{ name: "symbol" }]})
    symbol?: LocationTypeSymbol;

    @XMLElement({types: [{ name: "forest-fire" }]})
    forestFire?: LocationTypeForestFire;

    @XMLElement({types: [{ name: "windProbability" }]})
    windProbability?: UnitValue;

    @XMLElement({types: [{ name: "temperatureProbability" }]})
    temperatureProbability?: UnitValue;

    @XMLElement({types: [{ name: "symbolProbability" }]})
    symbolProbability?: UnitValue;

}

@XMLRoot({name: "timeType", namespaceUri: ""})
export class TimeType {
    @XMLAttribute()
    from: Date = new Date(-8640000000000000);

    @XMLAttribute()
    to: Date = new Date(-8640000000000000);

    @XMLAttribute()
    datatype: string = "";

    @XMLArray({nested: false, itemTypes: [{itemType: () => LocationType}]})
    location: LocationType[] = [];

}

@XMLRoot({name: "productType", namespaceUri: ""})
export class ProductType {
    @XMLAttribute()
    class: string = "";

    @XMLArray({nested: false, itemTypes: [{itemType: () => TimeType}]})
    time: TimeType[] = [];

}

@XMLRoot({name: "modelType", namespaceUri: ""})
export class ModelType {
    @XMLAttribute()
    name: string = "";

    @XMLAttribute()
    termin: string = "";

    @XMLAttribute()
    runended: string = "";

    @XMLAttribute()
    nextrun: string = "";

    @XMLAttribute()
    from: string = "";

    @XMLAttribute()
    to: string = "";

}

@XMLRoot({name: "metaType", namespaceUri: ""})
export class MetaType {
    @XMLAttribute()
    licenseurl: string = "";

    @XMLArray({nested: false, itemTypes: [{itemType: () => ModelType}]})
    model: ModelType[] = [];

}

@XMLRoot({name: "weatherdata", namespaceUri: ""})
export class weatherdata {
    @XMLAttribute()
    created: Date = new Date(-8640000000000000);

    @XMLElement({types: [{ name: "meta" }]})
    meta?: MetaType;

    @XMLArray({nested: false, itemTypes: [{itemType: () => ProductType}]})
    product?: ProductType[];

}


