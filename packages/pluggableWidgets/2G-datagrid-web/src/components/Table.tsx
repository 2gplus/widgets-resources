import {
    createElement,
    CSSProperties,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import { ColumnSelector } from "./ColumnSelector";
import { Header } from "./Header";
import {
    AlignmentEnum,
    ColumnsPreviewType,
    DataObjectsType,
    DefaultTriggerEnum,
    PagingDisplayTypeEnum,
    PagingTypeEnum,
    SelectionModeEnum,
    TreeViewPositionEnum,
    WidthEnum
} from "../../typings/DatagridProps";
import { Big } from "big.js";
import classNames from "classnames";
import {
    DynamicValue,
    EditableValue,
    ListWidgetValue,
    ListExpressionValue,
    ObjectItem,
    ListAttributeValue,
    ListActionValue
} from "mendix";
import { SortingRule, useSettings } from "../utils/settings";
import { ColumnResizer } from "./ColumnResizer";
import { InfiniteBody, Pagination } from "@mendix/piw-utils-internal/components/web";
import { ButtonsTypeExt } from "../Datagrid";
import { Button } from "../utils/Button";
import { executeAction } from "@mendix/piw-utils-internal";
import { TableRow } from "./Row";

export type TableColumn = Omit<
    ColumnsPreviewType,
    "attribute" | "columnClass" | "content" | "dynamicText" | "filter" | "showContentAs" | "tooltip"
>;

export type CellRenderer<T extends ObjectItem = ObjectItem> = (
    renderWrapper: (
        children: ReactNode,
        className?: string,
        onClick?: () => void,
        ctrlClick?: () => void
    ) => ReactElement,
    value: T,
    columnIndex: number
) => ReactElement;

export interface TableProps<T extends ObjectItem> {
    cellRenderer: CellRenderer<T>;
    className: string;
    columns: TableColumn[];
    columnsFilterable: boolean;
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    data: T[];
    emptyPlaceholderRenderer?: (renderWrapper: (children: ReactNode) => ReactElement) => ReactElement;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    filtersTitle?: string;
    hasMoreItems: boolean;
    headerFilters?: ReactNode;
    useHeaderFilters: boolean;
    headerWrapperRenderer: (columnIndex: number, header: ReactElement) => ReactElement;
    id?: string;
    numberOfItems?: number;
    paging: boolean;
    page: number;
    pageSize: number;
    pagingPosition: string;
    preview?: boolean;
    rowClass?: (value: T) => string;
    setPage?: (computePage: (prevPage: number) => number) => void;
    setSortParameters?: (sort?: { columnIndex: number; desc: boolean }) => void;
    settings?: EditableValue<string>;
    styles?: CSSProperties;
    valueForSort: (value: T, columnIndex: number) => string | Big | boolean | Date | undefined;
    /**
     * Custom 2G props
     */
    defaultTrigger?: DefaultTriggerEnum;
    buttons: ButtonsTypeExt[];
    selectionMode: SelectionModeEnum;
    remoteSortConfig?: RemoteSortConfig;
    updateRemoteSortConfig?: (config: RemoteSortConfig) => void;
    onIsStarted: () => void;
    tableLabel?: DynamicValue<string>;
    pagingTypeEnum: PagingTypeEnum;
    pagingDisplayTypeEnum: PagingDisplayTypeEnum;
    treeViewEnabled: boolean;
    treeViewPosition: TreeViewPositionEnum;
    treeViewwidgets?: ListWidgetValue;
    treeViewCondition?: ListExpressionValue<boolean>;
    rowOnClickHandler?: (e: any, isDoubleClick: boolean, value: ObjectItem) => void;
    externalSelectionHandler?: { updateAction: ListActionValue; attribute: ListAttributeValue<boolean> };
    dataAttributes?: DataObjectsType[];
}

export interface RemoteSortConfig {
    property?: string;
    ascending?: boolean;
}

export interface ColumnWidth {
    [key: string]: number | undefined;
}

export interface ColumnProperty {
    id: string;
    alignment: AlignmentEnum;
    header: string;
    hidden: boolean;
    canHide: boolean;
    canDrag: boolean;
    canResize: boolean;
    canSort: boolean;
    customFilter: ReactNode;
    width: WidthEnum;
    weight: number;
    clickEvents: boolean;
}

export function Table<T extends ObjectItem>(props: TableProps<T>): ReactElement {
    const isInfinite = !props.paging;
    const [isDragging, setIsDragging] = useState(false);
    const [dragOver, setDragOver] = useState("");
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [hiddenColumns, setHiddenColumns] = useState<string[]>(
        (props.columns
            .map((c, i) =>
                props.columnsHidable && c.hidable === "hidden" && !props.preview ? i.toString() : undefined
            )
            .filter(Boolean) as string[]) ?? []
    );
    const [sortBy, setSortBy] = useState<SortingRule[]>([]);
    const [columnsWidth, setColumnsWidth] = useState<ColumnWidth>(
        Object.fromEntries(props.columns.map((_c, index) => [index.toString(), undefined]))
    );
    /**
     * 2G custom button state
     */
    const [selection, setSelection] = useState<ObjectItem[]>([]);

    /**
     * 2G remote sort config
     */
    useEffect(() => {
        if (props.remoteSortConfig && props.remoteSortConfig.property) {
            const column = props.columns.find(c => c.sortProperty === props.remoteSortConfig?.property);
            if (column) {
                const index = props.columns.indexOf(column).toString();
                const desc = !(props.remoteSortConfig.ascending ?? false);
                if (!(sortBy.length === 1 && sortBy[0].desc === desc && sortBy[0].id === index)) {
                    setSortBy([{ id: index, desc }]);
                }
            }
        }
    }, [props.remoteSortConfig]);

    useEffect(() => {
        if (props.updateRemoteSortConfig) {
            if (sortBy.length > 0) {
                props.updateRemoteSortConfig({
                    ascending: !sortBy[0].desc,
                    property: props.columns[Number.parseInt(sortBy[0].id, 10)].sortProperty
                });
            } else {
                props.updateRemoteSortConfig({});
            }
        }
    }, [sortBy, props.updateRemoteSortConfig]);
    /**
     * End 2G remote sort config
     */

    const { updateSettings } = useSettings(
        props.settings,
        props.columns,
        columnOrder,
        setColumnOrder,
        hiddenColumns,
        setHiddenColumns,
        sortBy,
        setSortBy,
        columnsWidth,
        setColumnsWidth
    );

    useEffect(() => {
        updateSettings();
        /* Settings have been applied so we can mark as start */
        props.onIsStarted();
    }, [columnOrder, hiddenColumns, sortBy]);

    useEffect(() => {
        const [sortProperties] = sortBy;
        if (sortProperties && "id" in sortProperties && "desc" in sortProperties) {
            props.setSortParameters?.({
                columnIndex: Number(sortProperties.id),
                desc: sortProperties.desc ?? false
            });
        } else {
            props.setSortParameters?.(undefined);
        }
    }, [sortBy, props.setSortParameters]);

    const filterRenderer = useCallback(
        (children: ReactNode) => (
            <div className="filter" style={{ pointerEvents: isDragging ? "none" : undefined }}>
                {children}
            </div>
        ),
        [isDragging]
    );
    const tableColumns: ColumnProperty[] = useMemo(
        () =>
            props.columns.map((column, index) => ({
                id: index.toString(),
                accessor: "item",
                alignment: column.alignment,
                header: column.header,
                hidden: column.hidable === "hidden",
                canHide: column.hidable !== "no",
                canDrag: column.draggable,
                canResize: column.resizable,
                canSort: column.sortable,
                customFilter: props.columnsFilterable ? props.filterRenderer(filterRenderer, index) : null,
                width: column.width,
                weight: column.size ?? 1,
                clickEvents: column.clickEvents
            })),
        [props.columns, props.filterRenderer, props.columnsFilterable, filterRenderer]
    );

    const visibleColumns = useMemo(
        () => tableColumns.filter(c => !hiddenColumns.includes(c.id)).sort((a, b) => sortColumns(columnOrder, a, b)),
        [tableColumns, hiddenColumns, columnOrder]
    );

    const renderCell = useCallback(
        (column: ColumnProperty, value: T, rowIndex: number) =>
            visibleColumns.find(c => c.id === column.id) || props.preview
                ? props.cellRenderer(
                      (children, className) => {
                          return (
                              <div
                                  key={`row_${value.id}_cell_${column.id}`}
                                  className={classNames("td", { "td-borders": rowIndex === 0 }, className, {
                                      clickable: !!props.rowOnClickHandler && column.clickEvents,
                                      "hidden-column-preview": props.preview && props.columnsHidable && column.hidden
                                  })}
                                  onClick={(e: any) => {
                                      if (props.rowOnClickHandler && column.clickEvents) {
                                          props.rowOnClickHandler(e, false, value);
                                      }
                                  }}
                                  onDoubleClick={(e: any) => {
                                      if (props.rowOnClickHandler && column.clickEvents) {
                                          props.rowOnClickHandler(e, true, value);
                                      }
                                  }}
                                  onKeyDown={(e: any) => {
                                      if (
                                          props.rowOnClickHandler &&
                                          column.clickEvents &&
                                          (e.key === "Enter" || e.key === " ")
                                      ) {
                                          e.preventDefault();
                                          props.rowOnClickHandler(e, false, value);
                                      }
                                  }}
                                  role={props.rowOnClickHandler && column.clickEvents ? "button" : "cell"}
                                  tabIndex={props.rowOnClickHandler && column.clickEvents ? 0 : undefined}
                              >
                                  {children}
                              </div>
                          );
                      },
                      value,
                      Number(column.id)
                  )
                : null,
        [props.cellRenderer, props.columnsHidable, props.preview, visibleColumns]
    );

    const rows = useMemo(() => props.data.map(item => ({ item })), [props.data]);

    const pagination = props.paging ? (
        <Pagination
            canNextPage={props.hasMoreItems}
            canPreviousPage={props.page !== 0}
            gotoPage={(page: number) => props.setPage && props.setPage(() => page)}
            nextPage={() => props.setPage && props.setPage(prev => prev + 1)}
            numberOfItems={props.numberOfItems}
            page={props.page}
            pageSize={props.pageSize}
            previousPage={() => props.setPage && props.setPage(prev => prev - 1)}
        />
    ) : null;

    const cssGridStyles = useMemo(() => {
        const columnSizes = visibleColumns
            .map(c => {
                const columnResizedSize = columnsWidth[c.id];
                if (columnResizedSize) {
                    return `${columnResizedSize}px`;
                }
                switch (c.width) {
                    case "autoFit":
                        return "fit-content(100%)";
                    case "manual":
                        return `${c.weight}fr`;
                    default:
                        return "1fr";
                }
            })
            .join(" ");
        return {
            gridTemplateColumns:
                (props.treeViewEnabled && props.treeViewPosition === "left" ? "fit-content(50px) " : "") +
                columnSizes +
                (props.treeViewEnabled && props.treeViewPosition === "Right" ? " fit-content(50px)" : "") +
                (props.columnsHidable ? " fit-content(50px)" : "")
        };
    }, [columnsWidth, visibleColumns, props.columnsHidable]);
    /**
     * Update the selected ObjectItme list.
     * @param item
     */
    const updateSelection = (item: ObjectItem): void => {
        switch (props.selectionMode) {
            case "single":
                setSelection([item]);
                break;
            case "multi":
            case "external":
                if (props.externalSelectionHandler) {
                    const action = props.externalSelectionHandler.updateAction.get(item);
                    if (action && action.canExecute) {
                        executeAction(action);
                    }
                }
                const selectedItem = selection.indexOf(item);
                let newSelection: ObjectItem[] = [];
                if (selectedItem > -1) {
                    newSelection = selection.filter(x => x.id !== item.id);
                } else {
                    newSelection = [...selection, item];
                }
                setSelection(newSelection);

                break;
        }
    };
    // Function returns whether the ObjectItem is selected
    const isRowSelected = (item: ObjectItem): "selected" | "" => {
        switch (props.selectionMode) {
            case "external":
                return props.externalSelectionHandler?.attribute.get(item)?.value ? "selected" : "";
            case "multi":
            case "single":
            default:
                return selection.find(x => x.id === item.id) ? "selected" : "";
        }
    };
    const tableLabel = (): ReactNode => {
        if (props.tableLabel?.value) {
            return (
                <div className={"table-label"}>
                    <h4>{props.tableLabel?.value}</h4>
                </div>
            );
        }
        return null;
    };
    const tableLine = (): ReactNode => {
        if (props.tableLabel?.value) {
            return <hr className={"table-header-line"} />;
        }
        return null;
    };
    return (
        <div className={props.className} style={props.styles}>
            {props.useHeaderFilters ? (
                <div className="header-filters" role="rowgroup" aria-label={props.filtersTitle}>
                    {props.columnsFilterable
                        ? tableColumns.map(column => {
                              return column.customFilter;
                          })
                        : props.headerFilters}
                </div>
            ) : null}
            <div className="table-header" role="rowgroup" style={{ display: "flex" }}>
                {tableLabel()}
                {mapButtons(props.buttons, selection)}
                {props.pagingPosition === "top" && pagination}
                {tableLine()}
            </div>
            <div className="table" role="table">
                <InfiniteBody
                    className="table-content"
                    hasMoreItems={props.hasMoreItems}
                    isInfinite={isInfinite}
                    role="rowgroup"
                    setPage={props.setPage}
                    style={cssGridStyles}
                >
                    <div className="tr" role="row">
                        {props.treeViewEnabled && props.treeViewPosition === "left" && (
                            <div aria-label={"label"} className="th" role="columnheader" title={""}></div>
                        )}
                        {visibleColumns.map(column =>
                            props.headerWrapperRenderer(
                                Number(column.id),
                                <Header
                                    key={`headers_column_${column.id}`}
                                    className={`align-column-${column.alignment}`}
                                    column={column}
                                    draggable={props.columnsDraggable}
                                    dragOver={dragOver}
                                    filterable={!props.useHeaderFilters && props.columnsFilterable}
                                    hidable={props.columnsHidable}
                                    isDragging={isDragging}
                                    preview={props.preview}
                                    resizable={props.columnsResizable}
                                    resizer={
                                        <ColumnResizer
                                            onResizeEnds={updateSettings}
                                            setColumnWidth={(width: number) =>
                                                setColumnsWidth(prev => {
                                                    prev[column.id] = width;
                                                    return { ...prev };
                                                })
                                            }
                                        />
                                    }
                                    setColumnOrder={(newOrder: string[]) => setColumnOrder(newOrder)}
                                    setDragOver={setDragOver}
                                    setIsDragging={setIsDragging}
                                    setSortBy={setSortBy}
                                    sortable={props.columnsSortable}
                                    sortBy={sortBy}
                                    visibleColumns={visibleColumns}
                                />
                            )
                        )}
                        {props.columnsHidable && (
                            <ColumnSelector
                                columns={tableColumns}
                                hiddenColumns={hiddenColumns}
                                id={props.id}
                                setHiddenColumns={setHiddenColumns}
                            />
                        )}
                        {!props.columnsHidable && props.treeViewEnabled && props.treeViewPosition === "Right" && (
                            <div aria-label={"label"} className="th" role="columnheader" title={""}></div>
                        )}
                    </div>
                    {rows.map((row, rowIndex) => {
                        return (
                            <TableRow
                                key={`row_${row.item.id}`}
                                onClick={() => updateSelection(row.item)}
                                row={row.item}
                                index={rowIndex}
                                columnCount={
                                    visibleColumns.length +
                                    (props.treeViewEnabled ? (props.treeViewPosition === "left" ? 1 : 1) : 0)
                                }
                                rowClass={classNames(["tr", props.rowClass?.(row.item), isRowSelected(row.item)])}
                                treeViewWidget={props.treeViewwidgets}
                                treeViewPosition={props.treeViewPosition}
                                treeViewCondition={props.treeViewCondition}
                                dataAttributes={props.dataAttributes}
                            >
                                {visibleColumns.map(cell => renderCell(cell, row.item, rowIndex))}
                                {(!props.treeViewEnabled || props.treeViewPosition === "left") && props.columnsHidable && (
                                    <div
                                        aria-hidden
                                        className={classNames("td column-selector", {
                                            "td-borders": rowIndex === 0
                                        })}
                                    />
                                )}
                            </TableRow>
                        );
                    })}
                    {(props.data.length === 0 || props.preview) &&
                        props.emptyPlaceholderRenderer &&
                        props.emptyPlaceholderRenderer(children => (
                            <div
                                className={classNames("td", "td-borders td-empty-placeholder")}
                                style={{
                                    gridColumn: `span ${
                                        props.columns.length +
                                        (props.treeViewEnabled ? (props.treeViewPosition === "left" ? 2 : 1) : 0)
                                    }`
                                }}
                            >
                                <div className="empty-placeholder">{children}</div>
                            </div>
                        ))}
                </InfiniteBody>
            </div>
            <div className="table-footer" role="rowgroup">
                {props.pagingPosition === "bottom" && pagination}
            </div>
        </div>
    );
}

function sortColumns(columnsOrder: string[], columnA: ColumnProperty, columnB: ColumnProperty): number {
    let columnAValue = columnsOrder.findIndex(c => c === columnA.id);
    let columnBValue = columnsOrder.findIndex(c => c === columnB.id);
    if (columnAValue < 0) {
        columnAValue = Number(columnA.id);
    }
    if (columnBValue < 0) {
        columnBValue = Number(columnB.id);
    }
    return columnAValue < columnBValue ? -1 : columnAValue > columnBValue ? 1 : 0;
}

function mapButtons(buttons: ButtonsTypeExt[], selection: ObjectItem[]): ReactNode {
    return (
        <div className="table-actions" style={{ flex: 1 }}>
            {buttons.map(btn => {
                const renderBtn = (btn: ButtonsTypeExt, selection: ObjectItem[]): boolean => {
                    switch (btn.checkAuth) {
                        case "Attribute":
                            return btn.checkAuthAttribute?.value ?? false;
                        case "False":
                            return true;
                        case "True":
                            return (
                                // @ts-ignore
                                (btn.actionNoContext && btn.actionNoContext.isAuthorized) ||
                                (btn.checkAuth &&
                                    btn.action &&
                                    selection &&
                                    Array.isArray(selection) &&
                                    // @ts-ignore
                                    selection.find(x => btn.action.get(x).isAuthorized))
                            );
                    }
                };
                if (renderBtn(btn, selection)) {
                    if (btn.action) {
                        return Button(btn, e => {
                            e.preventDefault();
                            if (selection && selection.length > 0) {
                                for (const entry of selection) {
                                    // @ts-ignore
                                    executeAction(btn.action.get(entry));
                                }
                            }
                        });
                    } else if (btn.actionNoContext) {
                        return Button(btn, e => {
                            e.preventDefault();
                            executeAction(btn.actionNoContext);
                        });
                    }
                }
                return null;
            })}
        </div>
    );
}
