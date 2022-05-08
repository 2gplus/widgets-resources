import {
    CSSProperties,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
    createElement
} from "react";
import { ColumnSelector } from "./ColumnSelector";
import { Header } from "./Header";
import {
    AlignmentEnum,
    ColumnsPreviewType,
    DefaultTriggerEnum,
    SelectionModeEnum,
    WidthEnum
} from "../../typings/DatagridProps";
import { Big } from "big.js";
import classNames from "classnames";
import { EditableValue, ObjectItem, DynamicValue } from "mendix";
import { SortingRule, useSettings } from "../utils/settings";
import { ColumnResizer } from "./ColumnResizer";
import { InfiniteBody, Pagination } from "@mendix/piw-utils-internal/components/web";
import { Button } from "../utils/Button";
import { executeAction } from "@mendix/piw-utils-internal/dist/functions";
import { ButtonsTypeExt } from "../Datagrid";

export type TableColumn = Omit<
    ColumnsPreviewType,
    "attribute" | "columnClass" | "content" | "dynamicText" | "filter" | "showContentAs" | "tooltip"
>;

export type CellRenderer<T extends ObjectItem = ObjectItem> = (
    renderWrapper: (children: ReactNode, className?: string, onClick?: () => void) => ReactElement,
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
    defaultTrigger: DefaultTriggerEnum;
    buttons: ButtonsTypeExt[];
    selectionMode: SelectionModeEnum;
    remoteSortConfig?: RemoteSortConfig;
    updateRemoteSortConfig?: (config: RemoteSortConfig) => void;
    tableLabel?: DynamicValue<string>;
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
    }, [sortBy]);
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

    useEffect(() => updateSettings(), [columnOrder, hiddenColumns, sortBy]);

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
                weight: column.size ?? 1
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
                      (children, className, onClick) => {
                          let singleClick;
                          let doubleClick;
                          switch (props.defaultTrigger) {
                              case "singleClick":
                                  singleClick = onClick;
                                  break;
                              case "doubleClick":
                                  doubleClick = onClick;
                          }
                          return (
                              <div
                                  key={`row_${value.id}_cell_${column.id}`}
                                  className={classNames("td", { "td-borders": rowIndex === 0 }, className, {
                                      clickable: !!onClick,
                                      "hidden-column-preview": props.preview && props.columnsHidable && column.hidden
                                  })}
                                  onClick={singleClick}
                                  onDoubleClick={doubleClick}
                                  onKeyDown={
                                      onClick
                                          ? e => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    onClick();
                                                }
                                            }
                                          : undefined
                                  }
                                  role={onClick ? "button" : "cell"}
                                  tabIndex={onClick ? 0 : undefined}
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
            gridTemplateColumns: columnSizes + (props.columnsHidable ? " fit-content(50px)" : "")
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
                const selectedItem = selection.indexOf(item);
                let newSelection: ObjectItem[] = [];
                if (selectedItem > -1) {
                    newSelection = selection.filter(x => x.id !== item.id);
                } else {
                    newSelection = [...selection, item];
                }
                for (const select of newSelection) {
                    console.log(select.id);
                }
                setSelection(newSelection);
                break;
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
            <div className="table" role="table">
                <div className="table-header" role="rowgroup">
                    {tableLabel()}
                    {mapButtons(props.buttons, selection)}
                    {props.pagingPosition === "top" && pagination}
                    {tableLine()}
                </div>
                {props.headerFilters && (
                    <div className="header-filters" role="rowgroup" aria-label={props.filtersTitle}>
                        {props.headerFilters}
                    </div>
                )}
                <InfiniteBody
                    className="table-content"
                    hasMoreItems={props.hasMoreItems}
                    isInfinite={isInfinite}
                    role="rowgroup"
                    setPage={props.setPage}
                    style={cssGridStyles}
                >
                    <div className="tr" role="row">
                        {visibleColumns.map(column =>
                            props.headerWrapperRenderer(
                                Number(column.id),
                                <Header
                                    key={`headers_column_${column.id}`}
                                    className={`align-column-${column.alignment}`}
                                    column={column}
                                    draggable={props.columnsDraggable}
                                    dragOver={dragOver}
                                    filterable={props.columnsFilterable}
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
                    </div>
                    {rows.map((row, rowIndex) => {
                        return (
                            <div
                                onClick={() => updateSelection(row.item)}
                                key={`row_${row.item.id}`}
                                className={classNames(
                                    "tr",
                                    props.rowClass?.(row.item),
                                    selection.find(x => x.id === row.item.id) ? "selected" : ""
                                )}
                                role="row"
                            >
                                {visibleColumns.map(cell => renderCell(cell, row.item, rowIndex))}
                                {props.columnsHidable && (
                                    <div
                                        aria-hidden
                                        className={classNames("td column-selector", { "td-borders": rowIndex === 0 })}
                                    />
                                )}
                            </div>
                        );
                    })}
                    {(props.data.length === 0 || props.preview) &&
                        props.emptyPlaceholderRenderer &&
                        props.emptyPlaceholderRenderer(children => (
                            <div
                                className={classNames("td", "td-borders")}
                                style={{
                                    gridColumn: `span ${props.columns.length + (props.columnsHidable ? 1 : 0)}`
                                }}
                            >
                                <div className="empty-placeholder">{children}</div>
                            </div>
                        ))}
                </InfiniteBody>
                <div className="table-footer" role="rowgroup">
                    {props.pagingPosition === "bottom" && pagination}
                </div>
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
        <div className="table-actions">
            {buttons.map(btn => {
                const action = btn.action;
                if (action) {
                    return Button(btn, e => {
                        e.preventDefault();
                        if (selection && selection.length > 0) {
                            for (const entry of selection) {
                                executeAction(action.get(entry));
                            }
                        }
                    });
                }
                const actionNoContext = btn.actionNoContext;
                if (actionNoContext) {
                    return Button(btn, e => {
                        e.preventDefault();
                        executeAction(actionNoContext);
                    });
                }
                return null;
            })}
        </div>
    );
}
