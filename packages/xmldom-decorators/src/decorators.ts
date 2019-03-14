import "reflect-metadata";
import { DeserializerContext } from "./deserializer";
import { SerializerContext } from "./serializer";

type FactoryReader = (value: string, ctx: DeserializerContext) => any;
type FactoryWriter = (value: any, ctx: SerializerContext) => string;
type FactoryTuple = [FactoryReader, FactoryWriter];
type TypeGetter = () => Function;
type IsTypeGetter = (o: any) => boolean;

export interface RootOptions {
    name?: string;
    namespaceUri?: string;
}

export interface ElementOptions {
    types?: ArrayItemOptions[];
}

export interface ArrayOptions {
    /**
     * Container element name. Only used when nested is true.
     */
    name?: string;

    /**
     * Container element namespace URI. Only used when nested is true.
     */
    namespaceUri?: string;

    /**
     * Indicates whether the array is wrapped in a container XML element. 
     */
    nested?: boolean;

    itemTypes?: ArrayItemOptions[];
}

export interface ArrayItemOptions {
    name?: string;
    namespaceUri?: string;

    /**
     * A method which returns the array item type.
     * (The item type cannot be derived from the decorator metadata. The item type is a callback to support cyclic references to types defined later in the file)
     */
    itemType?: TypeGetter;

    /**
     * A method which returns whether the JavaScript object resolves to the item type.
     */
    isType?: IsTypeGetter;
}

export interface AttributeOptions {
    name?: string;
    namespaceUri?: string;
    enum?: object|null;
    factory?: FactoryTuple;
    type?: Function;
}

export interface TextOptions {
}

export interface BaseSchema {
    xmlType: "root" | "element" | "attribute" | "array" | "text";
}

export interface RootSchema extends BaseSchema {
    xmlType: "root";

    /**
     * The unqualified XML node name. Must not specify a prefix.
     */
    name: string;

    /**
     * The XML namespace URI for this node. Default for elements: "". Empty string.
     */
    namespaceUri: string|null;

    type: any;
}

export interface ElementSchema extends BaseSchema {
    xmlType: "element";
    propertyKey: string;
    types: ArrayItemOptions[];
}

export interface TextSchema extends BaseSchema {
    xmlType: "text";
    propertyKey: string;
    type: Function;
}

export interface AttributeSchema extends BaseSchema {
    xmlType: "attribute";
    propertyKey: string;

    /**
     * The unqualified XML node name. Must not specify a prefix.
     */
    name: string;

    /**
     * The XML namespace URI for this node.
     * Default for attributes: null. Implies it belongs to the element.
     */
    namespaceUri: string|null;

    factory?: FactoryTuple; // only used by attributes

    type: Function;
}

export interface ArraySchema extends BaseSchema {
    xmlType: "array";
    propertyKey: string;

    /**
     * The unqualified XML node name. Must not specify a prefix.
     */
    name: string;

    /**
     * The XML namespace URI for this node. Default for elements: "". Empty string.
     */
    namespaceUri: string|null;

    /**
     * Indicates whether the array is wrapped in a container XML element. 
     */
    nested: boolean;

    itemTypes: ArrayItemOptions[];
}

export function XMLRoot(opts: RootOptions = {}) {
    return function(target: Function) {
        const rootSchema: RootSchema = {
            name: opts.name || target.name,
            namespaceUri: opts.namespaceUri || "",
            xmlType: "root",
            type: target,
        };

        let targetSchema: RootSchema[] = Reflect.getMetadata("xml:root", target) || [];
        if (targetSchema.length === 0) {
            Reflect.defineMetadata("xml:root", targetSchema, target);
        }

        targetSchema.push(rootSchema);
    }
}

export function XMLElement<T>(opts: ElementOptions = {}) {
    return function(target: T, propertyKey: string) {
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        if (type === Array) {
            throw new Error("Use @XMLArray on arrays");
        }

        let targetChildren: BaseSchema[] = Reflect.getMetadata("xml:type:children", target.constructor) || [];
        if (targetChildren.length === 0) {
            Reflect.defineMetadata("xml:type:children", targetChildren, target.constructor);
        }

        targetChildren.push({
            propertyKey: propertyKey,
            xmlType: "element",
            enum: null, // opts.enum || null,
            types: !!opts.types ? getItemTypes(opts.types, type) : [{ itemType: () => type, name: propertyKey, namespaceUri: "" }],
        } as ElementSchema);
    }
}

export function XMLAttribute(opts: AttributeOptions = {}) {
    return function(target: any, propertyKey: string) {
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        if ((!opts.type && !opts.factory) && type === Object) {
            throw new Error("@XMLAttribute must specify type or factory on " + propertyKey + " in " + target.constructor.name);
        }

        let targetChildren: BaseSchema[] = Reflect.getMetadata("xml:type:children", target.constructor) || [];
        if (targetChildren.length === 0) {
            Reflect.defineMetadata("xml:type:children", targetChildren, target.constructor);
        }
        
        targetChildren.push({
            propertyKey: propertyKey,
            factory: opts.factory,
            name: opts.name || propertyKey || "",
            namespaceUri: opts.namespaceUri || null,
            type: opts.type || type,
            xmlType: "attribute",
            enum: opts.enum || null,
        } as AttributeSchema);
    }
}

function getItemTypes(types: ArrayItemOptions[], fallbackType: Function): ArrayItemOptions[] {
    // Throw if types have duplicate names; the name is the xml disambiguator
    // TODO: check default names too (later)
    for (let type of types) {
        if (type.name && types.find(t => t !== type && t.name === type.name)) {
            throw new Error("Cannot have duplicate item type name " + type.name);
        }
    }

    // If there is a single type without itemType, use the default fallback type from decorator metadata
    return types.map(t => ({
        name: t.name || null, // null means to calculate a default when needed
        namespaceUri: t.namespaceUri || "",
        isType: t.isType,
        itemType: t.itemType || (types.length === 1 ? () => fallbackType : undefined),
    } as ArrayItemOptions));
}

export function XMLArray(opts: ArrayOptions = {}) {
    return function(target: any, propertyKey: string) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        if (type !== Array) {
            throw new Error("@XMLArray can only be specified on arrays");
        }

        const targetChildren: BaseSchema[] = Reflect.getMetadata("xml:type:children", target.constructor) || [];
        if (targetChildren.length === 0) {
            Reflect.defineMetadata("xml:type:children", targetChildren, target.constructor);
        }
        
        const name = opts.name || propertyKey;
        const nested = opts.nested !== undefined ? opts.nested : true;

        const arraySchema: ArraySchema = {
            propertyKey: propertyKey,
            name: name,
            namespaceUri: opts.namespaceUri || "",
            xmlType: "array",
            nested: nested,
            itemTypes: !!opts.itemTypes ? getItemTypes(opts.itemTypes, type) : [],
        };

        targetChildren.push(arraySchema);
    }
}

export function isArraySchema(schema: BaseSchema): schema is ArraySchema {
    return schema.xmlType == "array";
}

export function isRootSchema(schema: BaseSchema): schema is RootSchema {
    return schema.xmlType == "root";
}

export function isElementSchema(schema: BaseSchema): schema is ElementSchema {
    return schema.xmlType == "element";
}

export function isAttributeSchema(schema: BaseSchema): schema is AttributeSchema {
    return schema.xmlType == "attribute";
}

export function isTextSchema(schema: BaseSchema): schema is TextSchema {
    return schema.xmlType == "text";
}

export function XMLText(opts: TextOptions = {}) {
    return function(target: any, propertyKey: string) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);

        const targetChildren: BaseSchema[] = Reflect.getMetadata("xml:type:children", target.constructor) || [];
        if (targetChildren.length === 0) {
            Reflect.defineMetadata("xml:type:children", targetChildren, target.constructor);
        }
        
        const textSchema: TextSchema = {
            propertyKey: propertyKey,
            type: type,
            xmlType: "text",
        };

        targetChildren.push(textSchema);
    }
}
