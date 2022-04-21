import { createElement, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColumnsType, DatagridContainerProps } from "../typings/DatagridProps";
import { FilterCondition } from "mendix/filters";
import { and } from "mendix/filters/builders";

import { RemoteSortConfig, Table, TableColumn } from "./components/Table";
import classNames from "classnames";
import {
    FilterFunction,
    FilterType,
    generateUUID,
    useFilterContext,
    useMultipleFiltering
} from "@mendix/piw-utils-internal/components/web";
import { executeAction, isAvailable } from "@mendix/piw-utils-internal";
import { extractFilters } from "./utils/filters";

import "./ui/Datagrid.scss";

export default function Datagrid(props: DatagridContainerProps): ReactElement {
    const id = useRef(`DataGrid${generateUUID()}`);

    const [sortParameters, setSortParameters] = useState<{ columnIndex: number; desc: boolean } | undefined>(undefined);
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

    useEffect(() => {
        props.datasource.requestTotalCount(true);
        if (props.datasource.limit === Number.POSITIVE_INFINITY) {
            props.datasource.setLimit(props.pageSize);
        }
    }, [props.datasource, props.pageSize]);

    useEffect(() => {
        if (props.datasource.filter && !filtered && !viewStateFilters.current) {
            viewStateFilters.current = props.datasource.filter;
        }
    }, [props.datasource, props.configurationAttribute, filtered]);

    useEffect(() => {
        if (props.sortingType === "remote") {
            if (
                props.sortAscending?.value != remoteSortConfig.ascending ||
                props.sortAttribute?.value != remoteSortConfig.property
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
                if (remoteSortConfig.ascending != null && remoteSortConfig.ascending != props.sortAscending?.value) {
                    props.sortAscending?.setValue(remoteSortConfig.ascending);
                    changed = true;
                }
                if (remoteSortConfig.property && remoteSortConfig.property != props.sortAttribute?.value) {
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

    const setPage = useCallback(
        computePage => {
            const newPage = computePage(currentPage);
            if (isInfiniteLoad) {
                props.datasource.setLimit(newPage * props.pageSize);
            } else {
                props.datasource.setOffset(newPage * props.pageSize);
            }
        },
        [props.datasource, props.pageSize, isInfiniteLoad, currentPage]
    );

    const onConfigurationChange = useCallback(() => {
        props.onConfigurationChange?.execute();
    }, [props.onConfigurationChange]);

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

    if (sortParameters && props.sortingType === "local") {
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

    return (
        <Table
            cellRenderer={useCallback(
                (renderWrapper, value, columnIndex) => {
                    const column = props.columns[columnIndex];
                    let content;

                    if (column.showContentAs === "attribute") {
                        content = <span className="td-text">{column.attribute?.get(value)?.displayValue ?? ""}</span>;
                    } else if (column.showContentAs === "dynamicText") {
                        content = <span className="td-text">{column.dynamicText?.get(value)?.value ?? ""}</span>;
                    } else {
                        content = column.content?.get(value);
                    }

                    return renderWrapper(
                        content,
                        classNames(`align-column-${column.alignment}`, column.columnClass?.get(value)?.value),
                        props.onTrigger ? () => executeAction(props.onTrigger?.get(value)) : undefined,
                        props.defaultTrigger
                    );
                },
                [props.columns, props.defaultTrigger, props.onTrigger]
            )}
            className={props.class}
            buttons={props.buttons}
            tableLabel={props.tableLabel}
            columns={columns}
            columnsDraggable={props.columnsDraggable}
            columnsFilterable={props.columnsFilterable}
            columnsHidable={props.columnsHidable}
            columnsResizable={props.columnsResizable}
            columnsSortable={props.columnsSortable}
            data={props.datasource.items ?? []}
            emptyPlaceholderRenderer={useCallback(
                renderWrapper =>
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
            selectionMode={props.selectionMode}
            numberOfItems={props.datasource.totalCount}
            onSettingsChange={props.onConfigurationChange ? onConfigurationChange : undefined}
            page={currentPage}
            pageSize={props.pageSize}
            paging={props.pagination === "buttons"}
            pagingPosition={props.pagingPosition}
            rowClass={useCallback(value => props.rowClass?.get(value)?.value ?? "", [props.rowClass])}
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
            remoteSortConfig={remoteSortConfig}
            setRemoteSortConfig={setRemoteSortConfig}
        />
    );
}

function transformColumnProps(props: ColumnsType[]): TableColumn[] {
    return props.map(prop => ({
        ...prop,
        header: prop.header && isAvailable(prop.header) ? prop.header.value ?? "" : "",
        sortable: prop.sortable && (prop.attribute?.sortable ?? false)
    }));
}