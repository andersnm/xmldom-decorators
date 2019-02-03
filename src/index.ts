import { XMLRoot, XMLElement, XMLArray, XMLAttribute, RootSchema, PropertySchema } from './decorators';
import { XMLDecoratorDeserializer } from './deserializer';
import { XMLDecoratorSerializer } from './serializer';
import { AvailRateUpdateRQ } from './schema/ExpediaAvailRateUpdateRQ';
import { TestType } from './schema/TestType';

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
                </Rate
                <Restrictions minLOS="1" />
            </RatePlan>
        </RoomType>
    </AvailRateUpdate>
</AvailRateUpdateRQ>`;

// const xml = '<x:test xmlns:x="uri-x" attr="name" name="value"><mektig>inside</mektig></x:test>';
const xml = '<x:test xmlns:x="uri-x" attr="name" name="value">text<frispark x="y"><s>a</s><s>b</s><s>c</s><nums><nume>1</nume> <num>2</num> </nums><joda/></frispark><mektig>inside</mektig></x:test>';
var deser = new XMLDecoratorDeserializer();
var ser = new XMLDecoratorSerializer();

const ex = deser.deserialize(expedia, AvailRateUpdateRQ) as AvailRateUpdateRQ;
console.log("result", JSON.stringify(ex, null, "  "));
console.log(ser.serialize(ex, AvailRateUpdateRQ));

const o = deser.deserialize(xml, TestType);
console.log(JSON.stringify(o, null, "  "));
console.log(ser.serialize(o, TestType));
