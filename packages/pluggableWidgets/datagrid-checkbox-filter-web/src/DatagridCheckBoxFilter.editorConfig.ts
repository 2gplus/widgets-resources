import {
    ContainerProps,
    hidePropertiesIn,
    hidePropertyIn,
    Properties,
    StructurePreviewProps,
    TextProps
} from "@mendix/piw-utils-internal";
import {
    DatagridCheckBoxFilterPreviewProps,
} from "../typings/DatagridCheckBoxFilterProps";

export function getProperties(
    values: DatagridCheckBoxFilterPreviewProps,
    defaultProperties: Properties,
    platform: "web" | "desktop"
): Properties
{
    hidePropertyIn(defaultProperties, values, "screenReaderButtonCaption");
    if (platform === "web")
    {
        if (!values.advanced)
        {
            hidePropertiesIn(defaultProperties, values, ["onChange", "valueAttribute"]);
        }
    }
    else
    {
        hidePropertyIn(defaultProperties, values, "advanced");
    }
    return defaultProperties;
}

export const getPreview = (values: DatagridCheckBoxFilterPreviewProps): StructurePreviewProps =>
{
    const adjustableByUserContainer: any[] = [];
    return {
        type: "RowLayout",
        borders: true,
        borderRadius: 5,
        borderWidth: 1,
        columnSize: "grow",
        children: [
            {
                type: "RowLayout",
                columnSize: "grow",
                backgroundColor: "#FFFFFF",
                children: [
                    ...adjustableByUserContainer,
                    {
                        type: "Container",
                        padding: 8,
                        children: [
                            {
                                type: "Text",
                                fontColor: values.placeholder ? "#BBBBBB" : "#FFF",
                                italic: true,
                                content: values.placeholder ? values.placeholder : "Sample"
                            } as TextProps
                        ],
                        grow: 1
                    } as ContainerProps
                ]
            }
        ]
    };
};
