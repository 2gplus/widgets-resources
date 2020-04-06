import { AttributeTypes, WidgetXml, Property } from "./WidgetXml";
import PluginError from "plugin-error";
import { extractProperties } from "./xmlHelpers";

export function generateForWidget(widgetXml: WidgetXml, widgetName: string) {
    if (!widgetXml?.widget?.properties) {
        throw new Error("[XML] XML doesn't contains <properties> element");
    }

    if (widgetXml.widget.$.pluginWidget !== "true") {
        throw new Error("[XML] Attribute pluginWidget=true not found. Please review your XML");
    }

    if (widgetXml.widget.$.hasOwnProperty("supportedPlatform") && widgetXml.widget.$.supportedPlatform === "All") {
        throw new PluginError("Typing generation", {
            message: "[XML] We are unable to handle widget`s XML for both platforms yet..",
        });
    }

    const mobile = widgetXml.widget.$.supportedPlatform ? widgetXml.widget.$.supportedPlatform === "Native" : false;

    const properties = (widgetXml.widget.properties.length > 0
        ? extractProperties(widgetXml.widget.properties[0])
        : []
    ).filter((prop) => prop && prop.$ && prop.$.key);

    const childTypes = Array.of<string>();
    const mainTypes = properties
        .map((prop) => {
            let name = prop.$.key;
            if (
                (prop.$.required && prop.$.required === "false" && prop.$.type !== "object") ||
                prop.$.type === "action"
            ) {
                name += "?";
            }
            const type = translateType(prop, childTypes, false, mobile);
            return `    ${name}: ${type};`;
        })
        .join("\n");
    const modelerTypes = !mobile
        ? properties
              .map((prop) => {
                  let name = prop.$.key;
                  if (prop.$.required && prop.$.required === "false" && prop.$.type !== "object") {
                      name += "?";
                  }
                  const type = translateType(prop, childTypes, true, mobile);
                  return `    ${name}: ${type};`;
              })
              .join("\n")
        : [];
    const modelerVisibilityMap = !mobile
        ? properties
              .map((prop) => {
                  if (prop.$.type !== "object") {
                      return `    ${prop.$.key}: boolean;`;
                  } else {
                      return `    ${extractVisibilityMap(prop, childTypes)} | boolean;`;
                  }
              })
              .join("\n")
        : [];
    const hasAction = !!(
        !mobile &&
        (properties.filter((prop) => prop.$.type === "action").length > 0 ||
            properties.filter((prop) => prop.$.type === "object").map((prop) => extractVisibilityMap(prop, [])).length >
                0)
    );
    const hasContainment =
        properties.filter((prop) => prop.$.type === "widgets").length > 0 ||
        properties.filter((prop) => prop.$.type === "widgets").map((prop) => extractVisibilityMap(prop, [])).length > 0;

    const propertyImports = findImports(mainTypes, childTypes);
    let imports = !mobile
        ? `
import { CSSProperties } from "react";${
              hasAction
                  ? `
import { ActionPreview } from "@mendix/pluggable-widgets-typing-generator/dist/typings";`
                  : ""
          }`
        : "";
    imports += propertyImports;
    if (hasContainment) {
        imports += `
import { ${!mobile ? "Component, " : ""}ReactNode } from "react";`;
    }

    const previewContents = !mobile
        ? `

export interface ${widgetName}PreviewProps {
    class: string;
    style: string;
    styleObject: CSSProperties;
${modelerTypes}
}

export interface VisibilityMap {
${modelerVisibilityMap}
}`
        : "";
    const commonProps = !mobile
        ? `class: string;
    style?: CSSProperties;
    tabIndex: number;`
        : "style: Style[];";
    return `/**
 * This file was generated from ${widgetName}.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Team
 */${imports}

interface CommonProps${mobile ? "<Style>" : ""} {
    name: string;
    ${commonProps}
}${childTypes.length > 0 ? "\n\n" + childTypes.join("\n\n") : ""}

export interface ${mobile ? widgetName : widgetName + "Container"}Props${mobile ? "<Style>" : ""} extends CommonProps${
        mobile ? "<Style>" : ""
    } {
${mainTypes}
}${previewContents}
`;
}

/**
 * Translate the XML property type for Javascript type
 * @param prop
 * @param childTypes
 * @param preview
 * @param isMobile
 * @param isChild
 * @returns {string}
 */
const translateType = (
    prop: Property,
    childTypes: string[],
    preview: boolean = false,
    isMobile: boolean = false,
    isChild: boolean = false
): string => {
    switch (prop.$.type) {
        case "attribute":
            if (!prop.attributeTypes || prop.attributeTypes.length === 0) {
                throw new PluginError("Typing generation", {
                    message: "[XML] Attribute property requires attributeTypes element",
                });
            }
            return preview && !isChild ? "string" : `EditableValue<${findTypes(prop.attributeTypes[0])}>`;
        case "expression":
            if (!prop.returnType || prop.returnType.length === 0) {
                throw new PluginError("Typing generation", {
                    message: "[XML] Expression property requires returnType element",
                });
            }
            const type = translateAttributeType(prop.returnType[0].$.type);
            return preview && !isChild ? type : `DynamicValue<${type}>`;
        case "action":
            return preview ? "ActionPreview" : "ActionValue";
        case "translatableString":
        case "textTemplate":
            return preview && !isChild ? "string" : "DynamicValue<string>";
        case "integer":
            return "number";
        case "decimal":
            return "BigJs.Big";
        case "icon":
            return isMobile ? "DynamicValue<NativeIcon>" : preview && !isChild ? "WebIcon" : "DynamicValue<WebIcon>";
        case "image":
            return isMobile ? "DynamicValue<NativeImage>" : preview && !isChild ? "WebImage" : "DynamicValue<WebImage>";
        case "enumeration":
            return generateEnums(prop, !preview ? childTypes : []);
        case "object":
            if (prop.$.hasOwnProperty("isList")) {
                if (prop.$.isList) {
                    return `${generateChildProps(prop, childTypes, preview, isMobile)}[]`;
                }
            }
            return "any";
        case "boolean":
        case "string":
            return prop.$.type;
        case "widgets":
            if (prop.$.hasOwnProperty("dataSource")) {
                return `(item: ObjectItem) => ${
                    preview ? "({ widgetCount: number; renderer: Component })" : "ReactNode"
                }`;
            }
            return preview ? "{ widgetCount: number; renderer: Component }" : "ReactNode";
        case "file":
            return preview && !isChild ? "FileValue" : "DynamicValue<FileValue>";
        case "datasource":
            if (prop.$.hasOwnProperty("isList")) {
                if (prop.$.isList) {
                    return "ListValue";
                }
            }
            return "";
        default:
            return "any";
    }
};

/**
 * Generate enum types with options
 * @param prop
 * @param childTypes
 * @returns {string}
 */
const generateEnums = (prop: Property, childTypes: string[]): string => {
    if (
        !prop.enumerationValues ||
        prop.enumerationValues.length === 0 ||
        !prop.enumerationValues[0].enumerationValue ||
        prop.enumerationValues[0].enumerationValue.length === 0
    ) {
        throw new PluginError("Typing generation", {
            message: "[XML] Enumeration property requires enumerations element",
        });
    }
    const typeName = capitalizeFirstLetter(prop.$.key) + "Enum";
    const types = prop.enumerationValues[0].enumerationValue.map((type) => `"${type.$.key}"`);
    childTypes.push(`export type ${typeName} = ${types.join(" | ")};`);
    return typeName;
};

/**
 * Generate child properties for Object List
 * @param prop
 * @param childTypes
 * @param preview
 * @param isMobile
 * @returns {string}
 */
const generateChildProps = (prop: Property, childTypes: string[], preview = false, isMobile = false): string => {
    if (!prop.properties || prop.properties.length === 0) {
        throw new PluginError("Typing generation", {
            message: "[XML] Object property requires <properties> element",
        });
    }
    const properties = extractProperties(prop.properties[0]);
    const hasDynamicProps = preview
        ? properties
              .map((prop) => translateType(prop, [], preview, isMobile, true))
              .some((type) => type.includes("DynamicValue") || type.includes("EditableValue"))
        : false;
    const typeName = capitalizeFirstLetter(prop.$.key) + (hasDynamicProps ? "PreviewType" : "Type");
    if (!preview || (preview && hasDynamicProps)) {
        childTypes.push(`export interface ${typeName} {
${properties
    .map((prop) => {
        let name = prop.$.key;
        if (
            (prop.$.required && prop.$.required === "false" && prop.$.type !== "object") ||
            (prop.$.type === "action" && !preview)
        ) {
            name += "?";
        }
        const type = translateType(prop, childTypes, preview, isMobile);
        return `    ${name}: ${type};`;
    })
    .join("\n")}
}`);
    }
    return typeName;
};

/**
 * Capitalize the first letter of a text
 * @param text
 * @returns {text}
 */
const capitalizeFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Parse all the attributes to find all available types
 * @param attributeTypes
 * @returns {string}
 */
const findTypes = (attributeTypes: AttributeTypes): string => {
    if (!attributeTypes.attributeType || attributeTypes.attributeType.length === 0) {
        throw new PluginError("Typing generation", {
            message: "[XML] Attribute property requires attributeTypes element",
        });
    }
    let types = attributeTypes.attributeType
        .filter((type) => type.$ && type.$.name)
        .map((type) => type.$.name)
        .map((type) => translateAttributeType(type));
    const uniqueTypes = new Set();
    types.forEach((type) => {
        !uniqueTypes.has(type) ? uniqueTypes.add(type) : null;
    });
    return Array.from(uniqueTypes).join(` | `);
};

/**
 * Translate all the available XML attribute types for Javascript types
 * @param type
 * @returns {string}
 */
const translateAttributeType = (type: string): string => {
    switch (type) {
        case "Boolean":
            return "boolean";
        case "DateTime":
            return "Date";
        case "AutoNumber":
        case "Decimal":
        case "Integer":
        case "Long":
            return "BigJs.Big";
        case "HashString":
        case "String":
        case "Enum":
            return "string";
        default:
            return "any";
    }
};

/**
 * Extract the visibility map for Mendix Studio
 * @param prop
 * @param childTypesVisibility
 * @returns {string}
 */
const extractVisibilityMap = (prop: Property, childTypesVisibility: string[]): string => {
    if (!prop.properties || prop.properties.length === 0) {
        throw new PluginError("Typing generation", {
            message: "[XML] Object property requires <properties> element",
        });
    }
    const properties = extractProperties(prop.properties[0]);
    const name = `${capitalizeFirstLetter(prop.$.key)}VisibilityType`;
    if (prop.$.hasOwnProperty("isList")) {
        if (prop.$.isList) {
            childTypesVisibility.push(`export interface ${name} {
${properties.map((p) => `    ${p.$.key}: boolean;`).join("\n")}
}`);
        }
    }
    return `${prop.$.key}: ${name}[]`;
};

/**
 * Find all imports based on the types
 * @param mainTypes
 * @param childTypes
 * @returns {string}
 */
function findImports(mainTypes: string, childTypes: string[]): string {
    let types = mainTypes;
    if (childTypes && childTypes.length > 0) {
        types += childTypes.join("\n");
    }

    const imports = [
        "ActionValue",
        "DynamicValue",
        "EditableValue",
        "FileValue",
        "ListValue",
        "NativeIcon",
        "NativeImage",
        "ObjectItem",
        "WebIcon",
        "WebImage",
    ].filter((type) => types.includes(type));

    return imports && imports.length > 0
        ? `
import { ${imports.join(", ")} } from "mendix";`
        : "";
}
