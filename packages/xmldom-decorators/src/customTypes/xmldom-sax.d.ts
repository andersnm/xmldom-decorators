// Type definitions for xmldom/sax internals (XMLReader). These APIs are not officially documented.

declare module '@xmldom/xmldom/lib/sax' {
    var XMLReader: XMLReaderStatic;

    interface XMLReaderStatic {
        new(): XMLReader;
    }

    interface XMLReader {
        domBuilder: DOMBuilder;
        errorHandler: any;
        parse(source: string, defaultNSMap: any, entityMap: any): void;
    }

    interface ElementAttributes extends Array<ElementAttribute> {
        length: number;
        setTagName(tagName: string): void;
        addValue(qName: string, value: string, offset: number): void;
        getLocalName(i: number): string;
        getLocator(i: number): string;
        getQName(i: number): string;
        getURI(i: number): string;
        getValue(i: number): string;
    }

    interface ElementAttribute {
        qName: string;
        value: string;
        offset: number;
    }

    interface DOMBuilder {
        locator: Locator|null;
        currentElement: any;
        doc: any;
        startDocument(): void;
        endDocument(): void;
        characters(xt: string, start: number, length: number): void;
        startElement(ns: string, localName: string, tagName: string, el: ElementAttributes): void;
        endElement(ns: string, localName: string, tagName: string): void;
        startPrefixMapping(nsPrefix: string, value: string): void;
        endPrefixMapping(prefix: string): void;
        comment(source: string, start: number, length: number): void;
        startCDATA(): void;
        endCDATA(): void;
        startDTD(name: string, pubid: string, sysid: string): void;
        endDTD(): void;
        processingInstruction(p1: string, p2: string): void;
    }

    interface Locator {
        lineNumber: number;
        columnNumber: number;
    }

}
