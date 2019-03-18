#!/usr/bin/env node
import { SchemaMapper } from './schemascanner'
import { formatClasses } from './classformatter';

if (process.argv.length < 3) {
    console.log("Usage: xsd filename.xsd");
    process.exit(1);
}

const mapper = new SchemaMapper();
mapper.load(process.argv[2]);

const classes = mapper.getClasses();
console.log(formatClasses(classes));
