// import { XMLRoot, XMLElement, XMLArray, XMLAttribute, RootSchema, PropertySchema } from './decorators';
import { XMLDecoratorDeserializer } from './deserializer';
import { XMLDecoratorSerializer } from './serializer';
// import { AvailRateUpdateRQ, AvailRateUpdateRS } from './schema/ExpediaAvailRateUpdate';
import { TestType } from './schema/TestType';
// import { Schema } from './schema/XsdSchema';

// export { XMLDecoratorSerializer } from './serializer';
export { XMLDecoratorDeserializer } from './deserializer';
export { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText, RootOptions, ElementOptions, AttributeOptions, ArrayOptions } from './decorators';
/*
const expedia = 
`<AvailRateUpdateRQ xmlns="http://www.expediaconnect.com/EQC/AR/2011/06">
    <Authentication username="Hello" password="World" />
    <Hotel id="123" />
    <AvailRateUpdate>
        <DateRange from="2018-01-01Z" sun="true" />
        <DateRange from="2018-01-01Z" sun="true" />
        <RoomType id="1">
            <RatePlan id="2">
                <Rate>
                    <PerDay rate="100" />
                </Rate>
                <Restrictions minLOS="1" />
            </RatePlan>
        </RoomType>
    </AvailRateUpdate>
</AvailRateUpdateRQ>`;
*/
// const xml = '<x:test xmlns:x="uri-x" attr="name" name="value"><mektig>inside</mektig></x:test>';
let xml = '<x:test xmlns:x="uri-x" attr="name" name="value">text<frispark x="y"><s>a</s><s>b</s><s>c</s><nums><nume>1</nume> <num>2</num> </nums><joda/></frispark><mektig>inside</mektig></x:test>';
var deser = new XMLDecoratorDeserializer();
var ser = new XMLDecoratorSerializer();
/*
const ex = deser.deserialize(expedia, AvailRateUpdateRQ) as AvailRateUpdateRQ;
console.log("result", JSON.stringify(ex, null, "  "));
console.log(ser.serialize(ex, AvailRateUpdateRQ));
*/
let o = deser.deserialize(xml, TestType);
console.log(JSON.stringify(o, null, "  "));

xml = ser.serialize(o, TestType, {'': 'my', 'uri-x':'x'});
console.log(xml);
o = deser.deserialize(xml, TestType);
console.log(JSON.stringify(o, null, "  "));

/*
const result: AvailRateUpdateRS = {
    success: {
        warning: [
            {
                code: 321,
                value: "There was a warning"
            },
            {
                code: 3210,
                value: "There was a warning 2"
            }
        ]
    },
    error: [
        {
            code: 123,
            value: "There was an error"
        }
    ]
};

console.log(ser.serialize(result, AvailRateUpdateRS));


var deser = new XMLDecoratorDeserializer();
var ser = new XMLDecoratorSerializer();

const xsd = `<schema xmlns="http://www.w3.org/2001/XMLSchema">
    <element name="Root">
        <complexType>
            <sequence>
                <element name="test" type="xs:string"/>
                <element name="test" type="xs:string"/>
            </sequence>
        </complexType>
    </element>
</schema>`;

var schema = deser.deserialize(xsd, Schema);
console.log(JSON.stringify(schema))
*/
