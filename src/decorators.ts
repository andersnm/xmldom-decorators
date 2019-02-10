import "reflect-metadata";
import { DeserializerContext } from "./deserializer";
import { SerializerContext } from "./serializer";

export interface BaseSchema {
    /**
     * The unqualified XML node name. Must not specify a prefix.
     */
    name: string;

    /**
     * The XML namespace URI for this node. Only attributes can have null namespaceUri.
     * Default for elements: "". Empty string.
     * Default for attributes: null. Implies it belongs to the element.
     */
    namespaceUri: string|null;

    xmlType: "root" | "element" | "attribute" | "array" | "text";
    type: any;
}

export interface RootSchema extends BaseSchema {
    xmlType: "root";
}

export interface ValueSchema extends BaseSchema {
    xmlType: "element" | "attribute" | "array" | "text";
    enum: object|null;
}

type FactoryReader = (value: string, ctx: DeserializerContext) => any;
type FactoryWriter = (value: any, ctx: SerializerContext) => string;
type FactoryTuple = [FactoryReader, FactoryWriter];

export interface PropertySchema extends ValueSchema {
    xmlType: "element" | "attribute" | "array" | "text";
    propertyKey: string;
    factory?: FactoryTuple;
}

export type TypeGetter = () => Function;

export interface ArraySchema extends PropertySchema {
    xmlType: "array";

    /**
     * Only applicable to arrays wrapped in a container element. Defaults to itemType().name if null.
     */
    itemName: string|null;

    /**
     * A method which returns the array item type.
     * (The item type cannot be derived from the decorator metadata. The item type is a callback to support cyclic references to types defined later in the file)
     */
    itemType: TypeGetter;

    /**
     * Indicates whether the array is wrapped in a container XML element. 
     */
    nested: boolean;
}

export function XMLRoot(opts: Partial<RootSchema> = {}) {
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

export function XMLElement<T>(opts: Partial<PropertySchema> = {}) {
    return function(target: T, propertyKey: string) {
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        if (type === Array) {
            throw new Error("Use @XMLArray with itemType on arrays");
        }

        let targetChildren: PropertySchema[] = Reflect.getMetadata("xml:type:children", target.constructor) || [];
        if (targetChildren.length === 0) {
            Reflect.defineMetadata("xml:type:children", targetChildren, target.constructor);
        }

        targetChildren.push({
            propertyKey: propertyKey,
            name: opts.name || propertyKey || "",
            namespaceUri: opts.namespaceUri || "",
            type: type,
            xmlType: "element",
            enum: opts.enum || null,
        });
    }
}

export function XMLAttribute(opts: Partial<PropertySchema> = {}) {
    return function(target: any, propertyKey: string) {
        let type = Reflect.getMetadata("design:type", target, propertyKey);
        let targetChildren: PropertySchema[] = Reflect.getMetadata("xml:type:children", target.constructor) || [];
        if (targetChildren.length === 0) {
            Reflect.defineMetadata("xml:type:children", targetChildren, target.constructor);
        }
        
        targetChildren.push({
            propertyKey: propertyKey,
            name: opts.name || propertyKey || "",
            namespaceUri: opts.namespaceUri || null,
            factory: opts.factory,
            type: type,
            xmlType: "attribute",
            enum: opts.enum || null,
        });
    }
}

export function XMLArray(opts: Partial<ArraySchema> = {}) {
    return function(target: any, propertyKey: string) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        if (type !== Array) {
            throw new Error("@XMLArray can only be specified on arrays");
        }

        if (opts.itemType === undefined) {
            throw new Error("@XMLArray requires itemType");
        }

        const targetChildren: PropertySchema[] = Reflect.getMetadata("xml:type:children", target.constructor) || [];
        if (targetChildren.length === 0) {
            Reflect.defineMetadata("xml:type:children", targetChildren, target.constructor);
        }
        
        const name = opts.name || propertyKey;
        const nested = opts.nested !== undefined ? opts.nested : true;

        let itemName;
        if (nested) {
            itemName = opts.itemName || null; // default to itemType().name later if null
        } else {
            itemName = name;
        }
        
        const arraySchema: ArraySchema = {
            propertyKey: propertyKey,
            name: name,
            namespaceUri: opts.namespaceUri || "",
            type: type,
            xmlType: "array",
            enum: null,
            itemName: itemName,
            itemType: opts.itemType,
            nested: nested,
        };

        targetChildren.push(arraySchema);
    }
}

export function XMLText(opts: Partial<any> = {}) {
    return function(target: any, propertyKey: string) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);

        const targetChildren: PropertySchema[] = Reflect.getMetadata("xml:type:children", target.constructor) || [];
        if (targetChildren.length === 0) {
            Reflect.defineMetadata("xml:type:children", targetChildren, target.constructor);
        }
        
        const name = opts.name || propertyKey;
        
        const arraySchema: PropertySchema = {
            propertyKey: propertyKey,
            name: name,
            namespaceUri: opts.namespaceUri || "",
            type: type,
            xmlType: "text",
            enum: null,
        };

        targetChildren.push(arraySchema);
    }
}
