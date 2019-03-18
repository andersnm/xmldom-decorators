import { Schema, ComplexType, SimpleType, Element, SimpleContent, ComplexContent, QName, Choice, Sequence, Attribute, AttributeGroup } from "./xsdschema";

export class SchemaVisitor {
    public visitSchema(schema: Schema) {
        for (let item of schema.items) {
            if (item instanceof Element) {
                this.visitElement(item);
            } else if (item instanceof Attribute) {
                this.visitAttribute(item);
            } else if (item instanceof AttributeGroup) {
                this.visitAttributeGroup(item);
            } else if (item instanceof ComplexType) {
                this.visitComplexType(item);
            } else if (item instanceof SimpleType) {
                this.visitSimpleType(item);
            }
        }
    }

    public visitElement(element: Element) {
        if (element.complexType) {
            this.visitComplexType(element.complexType, element);
        } else if (element.simpleType) {
            this.visitSimpleType(element.simpleType);
        }
    }

    public visitComplexType(complexType: ComplexType, element?: Element) {
        if (complexType.attributes) {
            for (let attribute of complexType.attributes) {
                this.visitAttribute(attribute);
            }
        }

        if (complexType.attributeGroups) {
            for (let attributeGroup of complexType.attributeGroups) {
                this.visitAttributeGroup(attributeGroup);
            }
        }

        if (complexType.sequence) {
            this.visitSequence(complexType.sequence);
        } else if (complexType.choice) {
            this.visitChoice(complexType.choice);
        } else if (complexType.simpleContent) {
            this.visitSimpleContent(complexType.simpleContent);
        } else if (complexType.complexContent) {
            this.visitComplexContent(complexType.complexContent);
        } else {
            // throw new Error("complexType does not define any content" + JSON.stringify(complexType, null, 2));
        }    
    }

    public visitSimpleContent(simpleContent: SimpleContent) {
        // is @XMLText 
        if (!simpleContent.extension) {
            throw new Error("Expected extension in simpleContent");
        }

        if (simpleContent.extension.attributes) {
            for (let attribute of simpleContent.extension.attributes) {
                this.visitAttribute(attribute);
            }
        }

        if (simpleContent.extension.attributeGroups) {
            for (let attribute of simpleContent.extension.attributeGroups) {
                this.visitAttributeGroup(attribute);
            }
        }
    }

    public visitExtensionBase(base: QName) {

    }

    public visitComplexContent(complexContent: ComplexContent) {
        if (complexContent.extension) {
            if (!complexContent.extension.base) {
                throw new Error("Extension base must be set");                            
            }

            this.visitExtensionBase(complexContent.extension.base);

            if (complexContent.extension.attributes) {
                for (let attribute of complexContent.extension.attributes) {
                    this.visitAttribute(attribute);
                }
            }

            if (complexContent.extension.attributeGroups) {
                for (let attributeGroup of complexContent.extension.attributeGroups) {
                    this.visitAttributeGroup(attributeGroup);
                }
            }

            if (complexContent.extension.sequence) {
                this.visitSequence(complexContent.extension.sequence);
            }

            if (complexContent.extension.choice) {
                this.visitChoice(complexContent.extension.choice);
            }

        } else if (complexContent.restriction) {
            if (!complexContent.restriction.base) {
                throw new Error("Restriction base must be set");                            
            }

            // TODO: visitRestrictionBase?
            this.visitExtensionBase(complexContent.restriction.base);

            if (complexContent.restriction.attributes) {
                for (let attribute of complexContent.restriction.attributes) {
                    this.visitAttribute(attribute);
                }
            }

            if (complexContent.restriction.attributeGroups) {
                for (let attributeGroup of complexContent.restriction.attributeGroups) {
                    this.visitAttributeGroup(attributeGroup);
                }
            }

            if (complexContent.restriction.sequence) {
                this.visitSequence(complexContent.restriction.sequence);
            }

            if (complexContent.restriction.choice) {
                this.visitChoice(complexContent.restriction.choice);
            }
        } else {
            throw new Error("complexContent must have restriction or extension");
        }
    }

    public visitSequence(sequence: Sequence) {
        if (sequence.elements) {
            for (let e of sequence.elements) {
                this.visitElement(e);
            }
        }
    }

    public visitChoice(choice: Choice) {
        if (choice.elements) {
            for (let e of choice.elements) {
                this.visitElement(e);
            }
        }
    }
    
    public visitSimpleType(simpleType: SimpleType) {
        // OK
        if (simpleType.union) {
            if (simpleType.union.simpleType) {
                if (simpleType.union.simpleType.length === 0) {
                    throw new Error("Union with simpleType must have at least one element");
                }

                this.visitSimpleType(simpleType.union.simpleType[0]);
            } else if (simpleType.union.memberTypes) {
                if (simpleType.union.memberTypes.length === 0) {
                    throw new Error("Union with memberTypes must have at least one type");
                }
                // this.visitSimpleType(simpleType.union.memberTypes[0]);
            } else {
                throw new Error("Simpletype with empty union");
            }

        }
    }

    public visitAttribute(attribute: Attribute) {
        if (attribute.simpleType) {
            this.visitSimpleType(attribute.simpleType);
        }
    }

    public visitAttributeGroup(attributeGroup: AttributeGroup) {
        if (attributeGroup.attributes) {
            for (let attribute of attributeGroup.attributes) {
                this.visitAttribute(attribute);
            }
        }
    }
}
