/**
 * This file was generated from DatagridCheckBoxFilter.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";

export type DefaultFilterEnum = "equal";

export interface DatagridCheckBoxFilterContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    advanced: boolean;
    defaultValue?: DynamicValue<boolean>;
    defaultFilter: DefaultFilterEnum;
    placeholder?: DynamicValue<string>;
    delay: number;
    valueAttribute?: EditableValue<boolean>;
    onChange?: ActionValue;
    screenReaderButtonCaption?: DynamicValue<string>;
    screenReaderInputCaption?: DynamicValue<string>;
}

export interface DatagridCheckBoxFilterPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    advanced: boolean;
    defaultValue: string;
    defaultFilter: DefaultFilterEnum;
    placeholder: string;
    delay: number | null;
    valueAttribute: string;
    onChange: {} | null;
    screenReaderButtonCaption: string;
    screenReaderInputCaption: string;
}
