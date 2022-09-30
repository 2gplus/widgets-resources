import { createElement, ReactElement, useCallback } from "react";
import { ColumnsPreviewType, DatagridPreviewProps } from "../typings/DatagridProps";

import { Table, TableColumn } from "./components/Table";
import { parseStyle } from "@mendix/piw-utils-internal";
import { Selectable } from "mendix/preview/Selectable";
import { ObjectItem, GUID } from "mendix";
import classNames from "classnames";

export function preview(props: DatagridPreviewProps): ReactElement {
    const data: ObjectItem[] = Array.from({ length: props.pageSize ?? 5 }).map((_, index) => ({
        id: String(index) as GUID
    }));
    const columns: ColumnsPreviewType[] =
        props.columns.length > 0
            ? props.columns
            : [
                  {
                      header: "Column",
                      tooltip: "",
                      attribute: "[No attribute selected]",
                      width: "autoFill",
                      columnClass: "",
                      filter: { renderer: () => <div />, widgetCount: 0 },
                      resizable: false,
                      showContentAs: "attribute",
                      content: { renderer: () => <div />, widgetCount: 0 },
                      dynamicText: "Dynamic Text",
                      draggable: false,
                      hidable: "no",
                      size: 1,
                      sortable: false,
                      alignment: "left",
                      wrapText: false,
                      sortProperty: "property"
                  }
              ];

    const selectableWrapperRenderer = useCallback(
        (columnIndex: number, header: ReactElement) => {
            const column = columns[columnIndex];
            return (
                <Selectable
                    key={`selectable_column_${columnIndex}`}
                    caption={column.header.trim().length > 0 ? column.header : "[Empty caption]"}
                    object={column}
                >
                    {header}
                </Selectable>
            );
        },
        [columns]
    );

    return (
        <Table
            cellRenderer={useCallback(
                (renderWrapper, _, columnIndex) => {
                    const column = columns[columnIndex];
                    const className = classNames(`align-column-${column.alignment}`, { "wrap-text": column.wrapText });
                    let content;
                    switch (column.showContentAs) {
                        case "attribute":
                            content = renderWrapper(
                                <span className="td-text">
                                    {"["}
                                    {column.attribute.length > 0 ? column.attribute : "No attribute selected"}
                                    {"]"}
                                </span>,
                                className
                            );
                            break;
                        case "dynamicText":
                            content = renderWrapper(<span className="td-text">{column.dynamicText}</span>, className);
                            break;
                        case "customContent":
                            content = (
                                <column.content.renderer>{renderWrapper(null, className)}</column.content.renderer>
                            );
                    }

                    return selectableWrapperRenderer(columnIndex, content);
                },
                [columns]
            )}
            className={props.className}
            columns={transformColumnProps(columns)}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            data={data}
            emptyPlaceholderRenderer={useCallback(
                renderWrapper => (
                    <props.emptyPlaceholder.renderer caption="Empty list message: Place widgets here">
                        {renderWrapper(null)}
                    </props.emptyPlaceholder.renderer>
                ),
                [props.emptyPlaceholder]
            )}
            filterRenderer={useCallback(
                (renderWrapper, columnIndex) => {
                    const column = columns[columnIndex];
                    return column.filter ? (
                        <column.filter.renderer caption="Place filter widget here">
                            {renderWrapper(null)}
                        </column.filter.renderer>
                    ) : (
                        renderWrapper(null)
                    );
                },
                [columns]
            )}
            hasMoreItems={false}
            useHeaderFilters={false}
            headerWrapperRenderer={selectableWrapperRenderer}
            numberOfItems={5}
            page={0}
            pageSize={props.pageSize ?? 5}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            preview
            styles={parseStyle(props.style)}
            valueForSort={useCallback(() => undefined, [])}
            buttons={[]}
            selectionMode={"single"}
            defaultTrigger={"singleClick"}
            pagingDisplayTypeEnum={"objectBased"}
            pagingTypeEnum={"default"}
            treeViewEnabled={false}
        />
    );
}

export function getPreviewCss(): string {
    return require("./ui/DatagridPreview.scss");
}

function transformColumnProps(props: ColumnsPreviewType[]): TableColumn[] {
    return props.map(prop => ({
        ...prop,
        header: (prop.header?.trim().length ?? 0) === 0 ? "[Empty caption]" : prop.header,
        draggable: false,
        resizable: false
    }));
}
