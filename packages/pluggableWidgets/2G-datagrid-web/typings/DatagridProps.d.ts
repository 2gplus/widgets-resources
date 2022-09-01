/**
 * This file was generated from Datagrid.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix UI Content Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import {
    ActionValue,
    DynamicValue,
    EditableValue,
    ListValue,
    ListActionValue,
    ListAttributeValue,
    ListExpressionValue,
    ListWidgetValue,
    WebIcon
} from "mendix";
import { Big } from "big.js";

export type SelectionModeEnum = "single" | "multi";

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
    tooltip?: ListExpressionValue<string>;
    filter?: ReactNode;
    sortProperty: string;
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    width: WidthEnum;
    size: number;
    alignment: AlignmentEnum;
    columnClass?: ListExpressionValue<string>;
    wrapText: boolean;
}

export type PaginationEnum = "buttons" | "virtualScrolling";

export type PagingTypeEnum = "default" | "remote";

export type PagingPositionEnum = "bottom" | "top";

export type ShowEmptyPlaceholderEnum = "none" | "custom";

export type DefaultTriggerEnum = "singleClick" | "doubleClick";

export type PagingDisplayTypeEnum = "objectBased" | "pageBased";

export interface FilterListType {
    filter: ListAttributeValue<string | Big | boolean | Date>;
}

export type CheckAuthEnum = "True" | "Attribute" | "False";

export type RenderModeEnum = "link" | "button";

export type ButtonStyleEnum = "default" | "inverse" | "primary" | "info" | "success" | "warning" | "danger";

export interface ButtonsType {
    caption: string;
    action?: ListActionValue;
    actionNoContext?: ActionValue;
    tooltip: string;
    icon?: DynamicValue<WebIcon>;
    checkAuth: CheckAuthEnum;
    checkAuthAttribute?: DynamicValue<boolean>;
    renderMode: RenderModeEnum;
    btnClass: string;
    iconClass: string;
    buttonStyle: ButtonStyleEnum;
}

export interface ColumnsPreviewType {
    showContentAs: ShowContentAsEnum;
    attribute: string;
    content: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    dynamicText: string;
    header: string;
    tooltip: string;
    filter: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    sortProperty: string;
    sortable: boolean;
    resizable: boolean;
    draggable: boolean;
    hidable: HidableEnum;
    width: WidthEnum;
    size: number | null;
    alignment: AlignmentEnum;
    columnClass: string;
    wrapText: boolean;
}

export interface FilterListPreviewType {
    filter: string;
}

export interface ButtonsPreviewType {
    caption: string;
    action: {} | null;
    actionNoContext: {} | null;
    tooltip: string;
    icon: { type: "glyph"; iconClass: string } | { type: "image"; imageUrl: string } | null;
    checkAuth: CheckAuthEnum;
    checkAuthAttribute: string;
    renderMode: RenderModeEnum;
    btnClass: string;
    iconClass: string;
    buttonStyle: ButtonStyleEnum;
}

export interface DatagridContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    advanced: boolean;
    datasource: ListValue;
    selectionMode: SelectionModeEnum;
    sortingType: SortingTypeEnum;
    sortAttribute?: EditableValue<string>;
    sortAscending?: EditableValue<boolean>;
    onSortChangedAction?: ActionValue;
    columns: ColumnsType[];
    columnsFilterable: boolean;
    pageSize: number;
    pagination: PaginationEnum;
    pagingType: PagingTypeEnum;
    pagingPosition: PagingPositionEnum;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder?: ReactNode;
    rowClass?: ListExpressionValue<string>;
    onClick?: ListActionValue;
    defaultTrigger: DefaultTriggerEnum;
    pagingAction?: ActionValue;
    pagingDisplayType: PagingDisplayTypeEnum;
    pagingTotalCount?: EditableValue<Big>;
    pageNumber?: EditableValue<Big>;
    pageSizeAttribute?: EditableValue<Big>;
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    configurationAttribute?: EditableValue<string>;
    showHeaderFilters: boolean;
    filterList: FilterListType[];
    filtersPlaceholder?: ReactNode;
    filterSectionTitle?: DynamicValue<string>;
    tableLabel?: DynamicValue<string>;
    buttons: ButtonsType[];
}

export interface DatagridPreviewProps {
    className: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    advanced: boolean;
    datasource: {} | { type: string } | null;
    selectionMode: SelectionModeEnum;
    sortingType: SortingTypeEnum;
    sortAttribute: string;
    sortAscending: string;
    onSortChangedAction: {} | null;
    columns: ColumnsPreviewType[];
    columnsFilterable: boolean;
    pageSize: number | null;
    pagination: PaginationEnum;
    pagingType: PagingTypeEnum;
    pagingPosition: PagingPositionEnum;
    showEmptyPlaceholder: ShowEmptyPlaceholderEnum;
    emptyPlaceholder: { widgetCount: number; renderer: ComponentType<{ caption?: string }> };
    rowClass: string;
    onClick: {} | null;
    defaultTrigger: DefaultTriggerEnum;
    pagingAction: {} | null;
    pagingDisplayType: PagingDisplayTypeEnum;
    pagingTotalCount: string;
    pageNumber: string;
    pageSizeAttribute: string;
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
    tableLabel: string;
    buttons: ButtonsPreviewType[];
}
