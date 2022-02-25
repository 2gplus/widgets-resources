/**
 * This file was generated from Datagrid.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, DynamicValue, EditableValue, ListValue, ListActionValue, ListAttributeValue, ListExpressionValue, ListWidgetValue, WebIcon } from "mendix";
import { Big } from "big.js";

export type SortingTypeEnum = "local" | "remote";

export type ShowContentAsEnum = "attribute" | "dynamicText" | "customContent";

export type HidableEnum = "yes" | "hidden" | "no";

export type WidthEnum = "autoFill" | "autoFit" | "manual";

export type AlignmentEnum = "left" | "center" | "right";

export interface ColumnsType {
    showContentAs: ShowContentAsEnum;
    attribute?: ListAttributeValue<string | Big | boolean | Date>;
    content?: ListWidgetValue;
    dynamicText?: ListExpressionValue<string>;
    header?: DynamicValue<string>;
    sortProperty: string;
    filter?: ReactNode;
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    width: WidthEnum;
    size: number;
    alignment: AlignmentEnum;
    columnClass?: ListExpressionValue<string>;
}

export type PaginationEnum = "buttons" | "virtualScrolling";

export type PagingPositionEnum = "bottom" | "top" | "hide";

export type ShowEmptyPlaceholderEnum = "none" | "custom";

export type DefaultTriggerEnum = "singleClick" | "doubleClick";

export type SelectionModeEnum = "single" | "multi";

export type RenderModeEnum = "link" | "button";

export type ButtonStyleEnum = "default" | "inverse" | "primary" | "info" | "success" | "warning" | "danger";

export interface ButtonsType {
    caption: string;
    action?: ListActionValue;
    icon?: DynamicValue<WebIcon>;
    renderMode: RenderModeEnum;
    buttonStyle: ButtonStyleEnum;
}

export interface FilterListType {
    filter: ListAttributeValue<string | Big | boolean | Date>;
}

export interface ColumnsPreviewType {
    showContentAs: ShowContentAsEnum;
    attribute: string;
    content: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    dynamicText: string;
    header: string;
    sortProperty: string;
    filter: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    width: WidthEnum;
    size: number | null;
    alignment: AlignmentEnum;
    columnClass: string;
}

export interface ButtonsPreviewType {
    caption: string;
    action: {} | null;
    icon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; } | null;
    renderMode: RenderModeEnum;
    buttonStyle: ButtonStyleEnum;
}

export interface FilterListPreviewType {
    filter: string;
}

export interface DatagridContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    advanced: boolean;
    datasource: ListValue;
    sortingType: SortingTypeEnum;
    sortAttribute?: EditableValue<string>;
    sortAscending?: EditableValue<boolean>;
    onSortChangedAction?: ActionValue;
    columns: ColumnsType[];
    columnsFilterable: boolean;
    pageSize: number;
    pagination: PaginationEnum;
    pagingPosition: PagingPositionEnum;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder?: ReactNode;
    rowClass?: ListExpressionValue<string>;
    defaultTrigger: DefaultTriggerEnum;
    onTrigger?: ListActionValue;
    selectionMode: SelectionModeEnum;
    tableLabel?: DynamicValue<string>;
    buttons: ButtonsType[];
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    configurationAttribute?: EditableValue<string>;
    onConfigurationChange?: ActionValue;
    showHeaderFilters: boolean;
    filterList: FilterListType[];
    filtersPlaceholder?: ReactNode;
    filterSectionTitle?: DynamicValue<string>;
}

export interface DatagridPreviewProps {
    class: string;
    style: string;
    advanced: boolean;
    datasource: {} | { type: string } | null;
    sortingType: SortingTypeEnum;
    sortAttribute: string;
    sortAscending: string;
    onSortChangedAction: {} | null;
    columns: ColumnsPreviewType[];
    columnsFilterable: boolean;
    pageSize: number | null;
    pagination: PaginationEnum;
    pagingPosition: PagingPositionEnum;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    rowClass: string;
    defaultTrigger: DefaultTriggerEnum;
    onTrigger: {} | null;
    selectionMode: SelectionModeEnum;
    tableLabel: string;
    buttons: ButtonsPreviewType[];
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    configurationAttribute: string;
    onConfigurationChange: {} | null;
    showHeaderFilters: boolean;
    filterList: FilterListPreviewType[];
    filtersPlaceholder: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    filterSectionTitle: string;
}
