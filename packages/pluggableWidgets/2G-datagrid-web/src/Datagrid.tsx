import { createElement, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ButtonsType, ColumnsType, DatagridContainerProps } from "../typings/DatagridProps";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";

import { RemoteSortConfig, Table, TableColumn } from "./components/Table";
import {
    FilterFunction,
    FilterType,
    generateUUID,
    useFilterContext,
    useMultipleFiltering
} from "@mendix/piw-utils-internal/components/web";
import { isAvailable } from "@mendix/piw-utils-internal";
import { extractFilters } from "./utils/filters";
import { useCellRenderer } from "./utils/useCellRenderer";

import "./ui/Datagrid.scss";

export default function Datagrid(props: DatagridContainerProps): ReactElement {
    const id = useRef(`DataGrid${generateUUID()}`);

    const [sortParameters, setSortParameters] = useState<{ columnIndex: number; desc: boolean } | undefined>(undefined);
    /** Remote sorting
     *
     */
    const [remoteSortConfig, setRemoteSortConfig] = useState<RemoteSortConfig>({
        ascending: props.sortAscending?.value,
        property: props.sortAttribute?.value
    });
    const isInfiniteLoad = props.pagination === "virtualScrolling";
    const currentPage = isInfiniteLoad
        ? props.datasource.limit / props.pageSize
        : props.datasource.offset / props.pageSize;
    const viewStateFilters = useRef<FilterCondition | undefined>(undefined);
    const [filtered, setFiltered] = useState(false);
    const multipleFilteringState = useMultipleFiltering();
    const { FilterContext } = useFilterContext();
    const cellRenderer = useCellRenderer({ columns: props.columns, onClick: props.onClick });

    useEffect(() => {
        props.datasource.requestTotalCount(true);
        if (props.datasource.totalCount) {
            setTotalCount(props.datasource.totalCount);
        }
        if (props.datasource.limit === Number.POSITIVE_INFINITY) {
            props.datasource.setLimit(props.pageSize);
        }
    }, [props.datasource, props.pageSize]);

    useEffect(() => {
        if (props.datasource.filter && !filtered && !viewStateFilters.current) {
            viewStateFilters.current = props.datasource.filter;
        }
    }, [props.datasource, props.configurationAttribute, filtered]);

    const setPage = useCallback(
        (computePage: any) => {
            const newPage = computePage(currentPage);
            if (isInfiniteLoad) {
                props.datasource.setLimit(newPage * props.pageSize);
            } else {
                props.datasource.setOffset(newPage * props.pageSize);
            }
        },
        [props.datasource, props.pageSize, isInfiniteLoad, currentPage]
    );

    const customFiltersState = props.columns.map(() => useState<FilterFunction>());

    const filters = customFiltersState
        .map(([customFilter]) => customFilter?.getFilterCondition?.())
        .filter((filter): filter is FilterCondition => filter !== undefined)
        .concat(
            // Concatenating multiple filter state
            Object.keys(multipleFilteringState)
                .map((key: FilterType) => multipleFilteringState[key][0]?.getFilterCondition())
                .filter((filter): filter is FilterCondition => filter !== undefined)
        );

    if (filters.length > 0) {
        props.datasource.setFilter(filters.length > 1 ? and(...filters) : filters[0]);
    } else if (filtered) {
        props.datasource.setFilter(undefined);
    } else {
        props.datasource.setFilter(viewStateFilters.current);
    }

    if (props.sortingType === "local" && sortParameters) {
        props.datasource.setSortOrder([
            [props.columns[sortParameters.columnIndex].attribute!.id, sortParameters.desc ? "desc" : "asc"]
        ]);
    } else {
        props.datasource.setSortOrder(undefined);
    }

    const columns = useMemo(() => transformColumnProps(props.columns), [props.columns]);

    /**
     * Multiple filtering properties
     */
    const filterList = useMemo(
        () => props.filterList.reduce((filters, { filter }) => ({ ...filters, [filter.id]: filter }), {}),
        [props.filterList]
    );
    const multipleInitialFilters = useMemo(
        () =>
            props.filterList.reduce(
                (filters, { filter }) => ({
                    ...filters,
                    [filter.id]: extractFilters(filter, viewStateFilters.current)
                }),
                {}
            ),
        [props.filterList, viewStateFilters.current]
    );

    useEffect(() => {
        if (props.sortingType === "remote") {
            if (
                props.sortAscending?.value !== remoteSortConfig.ascending ||
                props.sortAttribute?.value !== remoteSortConfig.property
            ) {
                setRemoteSortConfig({
                    ascending: props.sortAscending?.value,
                    property: props.sortAttribute?.value
                });
            }
        }
    }, [props.sortAscending, props.sortAttribute]);
    useEffect(() => {
        if (props.sortingType === "remote") {
            let changed = false;
            // check if any property is set
            if (remoteSortConfig.property) {
                if (remoteSortConfig.ascending != null && remoteSortConfig.ascending !== props.sortAscending?.value) {
                    props.sortAscending?.setValue(remoteSortConfig.ascending);
                    changed = true;
                }
                if (remoteSortConfig.property && remoteSortConfig.property !== props.sortAttribute?.value) {
                    props.sortAttribute?.setValue(remoteSortConfig.property);
                    changed = true;
                }
            } else {
                if (props.sortAttribute?.value) {
                    props.sortAttribute?.setValue(undefined);
                    changed = true;
                }
            }
            if (changed) {
                props.onSortChangedAction?.execute();
            }
        }
    }, [remoteSortConfig]);
    /**
     * End Remote Sorting
     */
    const [totalCount, setTotalCount] = useState<number>();

    // /**
    //  * 2G custom button state
    //  */
    // const [selection, setSelection] = useState<ObjectItem[]>([]);
    // /**
    //  * Update the selected ObjectItme list.
    //  * @param item
    //  */
    // const updateSelection = (item: ObjectItem): void => {
    //     switch (props.selectionMode) {
    //         case "single":
    //             setSelection([item]);
    //             break;
    //         case "multi":
    //             const selectedItem = selection.indexOf(item);
    //             let newSelection: ObjectItem[] = [];
    //             if (selectedItem > -1) {
    //                 newSelection = selection.filter(x => x.id !== item.id);
    //             } else {
    //                 newSelection = [...selection, item];
    //             }
    //             for (const select of newSelection) {
    //                 console.log(select.id);
    //             }
    //             setSelection(newSelection);
    //             break;
    //     }
    // };
    return (
        <Table
            cellRenderer={cellRenderer}
            className={props.class}
            columns={columns}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            data={props.datasource.items ?? []}
            emptyPlaceholderRenderer={useCallback(
                (renderWrapper: any) =>
                    props.showEmptyPlaceholder === "custom" ? renderWrapper(props.emptyPlaceholder) : <div />,
                [props.emptyPlaceholder, props.showEmptyPlaceholder]
            )}
            filterRenderer={useCallback(
                (renderWrapper, columnIndex) => {
                    const { attribute, filter } = props.columns[columnIndex];
                    const [, filterDispatcher] = customFiltersState[columnIndex];
                    const initialFilters = extractFilters(attribute, viewStateFilters.current);

                    if (!attribute) {
                        return renderWrapper(filter);
                    }

                    return renderWrapper(
                        <FilterContext.Provider
                            value={{
                                filterDispatcher: prev => {
                                    setFiltered(true);
                                    filterDispatcher(prev);
                                    return prev;
                                },
                                singleAttribute: attribute,
                                singleInitialFilter: initialFilters
                            }}
                        >
                            {filter}
                        </FilterContext.Provider>
                    );
                },
                [FilterContext, customFiltersState, props.columns]
            )}
            filtersTitle={props.filterSectionTitle?.value}
            hasMoreItems={props.datasource.hasMoreItems ?? false}
            headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
            headerFilters={useMemo(
                () =>
                    props.showHeaderFilters ? (
                        <FilterContext.Provider
                            value={{
                                filterDispatcher: prev => {
                                    if (prev.filterType) {
                                        const [, filterDispatcher] = multipleFilteringState[prev.filterType];
                                        filterDispatcher(prev);
                                        setFiltered(true);
                                    }
                                    return prev;
                                },
                                multipleAttributes: filterList,
                                multipleInitialFilters
                            }}
                        >
                            {props.filtersPlaceholder}
                        </FilterContext.Provider>
                    ) : null,
                [FilterContext, customFiltersState, filterList, multipleInitialFilters, props.filtersPlaceholder]
            )}
            id={id.current}
            numberOfItems={totalCount}
            page={currentPage}
            pageSize={props.pageSize}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            rowClass={useCallback((value: any) => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
            setPage={setPage}
            setSortParameters={setSortParameters}
            settings={props.configurationAttribute}
            styles={props.style}
            valueForSort={useCallback(
                (value, columnIndex) => {
                    const column = props.columns[columnIndex];
                    return column.attribute ? column.attribute.get(value).value : "";
                },
                [props.columns]
            )}
            /**
             * Custom 2G props
             */
            buttons={transformButtonsType(props.buttons)}
            selectionMode={props.selectionMode}
            tableLabel={props.tableLabel}
            remoteSortConfig={remoteSortConfig}
            setRemoteSortConfig={setRemoteSortConfig}
            defaultTrigger={props.defaultTrigger}
        />
    );
}

export interface ButtonsTypeExt extends ButtonsType {
    key: number;
}
function transformButtonsType(buttons: ButtonsType[]): ButtonsTypeExt[] {
    return buttons.map(btn => {
        return {
            key: buttons.indexOf(btn),
            action: btn.action,
            buttonStyle: btn.buttonStyle,
            caption: btn.caption,
            actionNoContext: btn.actionNoContext,
            icon: btn.icon,
            renderMode: btn.renderMode
        } as ButtonsTypeExt;
    });
}

function transformColumnProps(props: ColumnsType[]): TableColumn[] {
    return props.map(prop => ({
        ...prop,
        header: prop.header && isAvailable(prop.header) ? prop.header.value ?? "" : "",
        sortable: prop.sortable && (prop.attribute?.sortable ?? false)
    }));
}
