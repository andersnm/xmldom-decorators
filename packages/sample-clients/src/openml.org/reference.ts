import { XMLRoot, XMLElement, XMLArray, XMLAttribute, XMLText } from "xmldom-decorators";

@XMLRoot({name: "data_set_description", namespaceUri: "http://openml.org/openml"})
export class data_set_description {
    @XMLElement({types: [{ name: "id", namespaceUri: "http://openml.org/openml" }]})
    id?: number;

    @XMLElement({types: [{ name: "name", namespaceUri: "http://openml.org/openml" }]})
    name: string = "";

    @XMLElement({types: [{ name: "version", namespaceUri: "http://openml.org/openml" }]})
    version?: string;

    @XMLElement({types: [{ name: "description", namespaceUri: "http://openml.org/openml" }]})
    description: string = "";

    @XMLElement({types: [{ name: "format", namespaceUri: "http://openml.org/openml" }]})
    format: string = "";

    @XMLArray({nested: false, itemTypes: [{namespaceUri: "http://openml.org/openml", itemType: () => String}]})
    creator?: string[];

    @XMLArray({nested: false, itemTypes: [{namespaceUri: "http://openml.org/openml", itemType: () => String}]})
    contributor?: string[];

    @XMLElement({types: [{ name: "collection_date", namespaceUri: "http://openml.org/openml" }]})
    collectionDate?: string;

    @XMLElement({types: [{ name: "upload_date", namespaceUri: "http://openml.org/openml" }]})
    uploadDate?: Date;

    @XMLElement({types: [{ name: "language", namespaceUri: "http://openml.org/openml" }]})
    language?: string;

    @XMLElement({types: [{ name: "licence", namespaceUri: "http://openml.org/openml" }]})
    licence?: string;

    @XMLElement({types: [{ name: "url", namespaceUri: "http://openml.org/openml" }]})
    url?: string;

    @XMLElement({types: [{ name: "file_id", namespaceUri: "http://openml.org/openml" }]})
    fileId?: number;

    @XMLElement({types: [{ name: "default_target_attribute", namespaceUri: "http://openml.org/openml" }]})
    defaultTargetAttribute?: string;

    @XMLElement({types: [{ name: "row_id_attribute", namespaceUri: "http://openml.org/openml" }]})
    rowIdAttribute?: string;

    @XMLArray({nested: false, itemTypes: [{name: "ignore_attribute", namespaceUri: "http://openml.org/openml", itemType: () => String}]})
    ignoreAttribute?: string[];

    @XMLElement({types: [{ name: "version_label", namespaceUri: "http://openml.org/openml" }]})
    versionLabel?: string;

    @XMLElement({types: [{ name: "citation", namespaceUri: "http://openml.org/openml" }]})
    citation?: string;

    @XMLArray({nested: false, itemTypes: [{namespaceUri: "http://openml.org/openml", itemType: () => String}]})
    tag?: string[];

    @XMLElement({types: [{ name: "visibility", namespaceUri: "http://openml.org/openml" }]})
    visibility?: string;

    @XMLElement({types: [{ name: "original_data_url", namespaceUri: "http://openml.org/openml" }]})
    originalDataUrl?: string;

    @XMLElement({types: [{ name: "paper_url", namespaceUri: "http://openml.org/openml" }]})
    paperUrl?: string;

    @XMLElement({types: [{ name: "update_comment", namespaceUri: "http://openml.org/openml" }]})
    updateComment?: string;

    @XMLElement({types: [{ name: "status", namespaceUri: "http://openml.org/openml" }]})
    status?: string;

    @XMLElement({types: [{ name: "processing_date", namespaceUri: "http://openml.org/openml" }]})
    processingDate?: string;

    @XMLElement({types: [{ name: "error", namespaceUri: "http://openml.org/openml" }]})
    error?: string;

    @XMLElement({types: [{ name: "warning", namespaceUri: "http://openml.org/openml" }]})
    warning?: string;

    @XMLElement({types: [{ name: "md5_checksum", namespaceUri: "http://openml.org/openml" }]})
    md5Checksum?: string;

}


