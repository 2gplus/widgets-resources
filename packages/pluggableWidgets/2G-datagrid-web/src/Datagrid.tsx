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
import { Big } from "big.js";

export default function Datagrid(props: DatagridContainerProps): ReactElement {
    const id = useRef(`DataGrid${generateUUID()}`);

    const [sortParameters, setSortParameters] = useState<{ columnIndex: number; desc: boolean } | undefined>(undefined);
    /**
     * 2G Remote sorting
     */
    const [remoteSortConfig, setRemoteSortConfig] = useState<RemoteSortConfig>({
        ascending: props.sortAscending?.value,
        property: props.sortAttribute?.value
    });
    /**
     * End 2G Remote sorting
     */
    if (
        props.pagingType === "remote" &&
        (!props.pageNumber || !props.pagingAction || !props.pagingTotalCount || !props.pageSizeAttribute)
    ) {
        throw new Error(
            "Not all required attributes are filled, pagingAction, pagingCount, pageNumber and pageSizeAttribute are required when using remote paging..."
        );
    }
    const isInfiniteLoad = props.pagination === "virtualScrolling";
    const currentPage =
        props.pagingType === "default"
            ? isInfiniteLoad
                ? props.datasource.limit / props.pageSize
                : props.datasource.offset / props.pageSize
            : props.pageNumber && props.pageNumber.value
            ? props.pageNumber.value.toNumber()
            : 0;
    const pageSize =
        props.pagingType === "default"
            ? props.pageSize
            : props.pageSizeAttribute && props.pageSizeAttribute.value
            ? props.pageSizeAttribute.value.toNumber()
            : 0;
    const viewStateFilters = useRef<FilterCondition | undefined>(undefined);
    const [filtered, setFiltered] = useState(false);
    const multipleFilteringState = useMultipleFiltering();
    const { FilterContext } = useFilterContext();
    const cellRenderer = useCellRenderer({ columns: props.columns, onClick: props.onClick });

    useEffect(() => {
        switch (props.pagingType) {
            case "default":
                props.datasource.requestTotalCount(true);
                if (props.datasource.totalCount) {
                    setTotalCount(props.datasource.totalCount);
                    setHasMoreItems(props.datasource.hasMoreItems ?? false);
                }
                if (props.datasource.limit === Number.POSITIVE_INFINITY) {
                    props.datasource.setLimit(props.pageSize);
                }
                break;
            case "remote":
                if (props.pagingTotalCount && props.pagingTotalCount.value) {
                    const totalCountNumber = props.pagingTotalCount.value.toNumber();
                    if (totalCountNumber !== totalCount) {
                        setTotalCount(totalCountNumber);
                    }
                    setHasMoreItems(currentPage + 1 < Math.ceil(totalCountNumber / pageSize));
                }
                break;
        }
    }, [props.datasource, pageSize, currentPage]);
    useEffect(() => {
        if (props.datasource.filter && !filtered && !viewStateFilters.current) {
            viewStateFilters.current = props.datasource.filter;
        }
    }, [props.datasource, props.configurationAttribute, filtered]);

    const setPage = useCallback(
        (computePage: any) => {
            const newPage = computePage(currentPage);
            switch (props.pagingType) {
                case "default":
                    if (isInfiniteLoad) {
                        props.datasource.setLimit(newPage * props.pageSize);
                    } else {
                        props.datasource.setOffset(newPage * props.pageSize);
                    }
                    break;
                case "remote":
                    if (props.pageNumber && props.pagingAction && props.pagingAction.canExecute) {
                        props.pageNumber.setValue(new Big(newPage));
                        props.pagingAction.execute();
                        setHasMoreItems(newPage + 1 < Math.ceil((totalCount || 0) / pageSize));
                    }
                    break;
            }
        },
        [props.datasource, pageSize, isInfiniteLoad, currentPage]
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
    // const filterList = useMemo(
    //     () => props.filterList.reduce((filters, { filter }) => ({ ...filters, [filter.id]: filter }), {}),
    //     [props.filterList]
    // );
    // const multipleInitialFilters = useMemo(
    //     () =>
    //         props.filterList.reduce(
    //             (filters, { filter }) => ({
    //                 ...filters,
    //                 [filter.id]: extractFilters(filter, viewStateFilters.current)
    //             }),
    //             {}
    //         ),
    //     [props.filterList, viewStateFilters.current]
    // );

    /**
     * 2G Remote sorting
     */
    const updateRemoteSortConfig = (newConfig: RemoteSortConfig) => {
        let changed = false;
        // check if any property is set
        if (newConfig.property) {
            if (newConfig.ascending != null && newConfig.ascending !== props.sortAscending?.value) {
                props.sortAscending?.setValue(newConfig.ascending);
                changed = true;
            }
            if (newConfig.property && newConfig.property !== props.sortAttribute?.value) {
                props.sortAttribute?.setValue(newConfig.property);
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
    };

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
    /**
     * End 2G Remote Sorting
     */

    const [totalCount, setTotalCount] = useState<number>();
    const [hasMoreItems, setHasMoreItems] = useState<boolean>(false);

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
            hasMoreItems={hasMoreItems}
            headerWrapperRenderer={useCallback((_columnIndex: number, header: ReactElement) => header, [])}
            useHeaderFilters={props.showHeaderFilters}
            id={id.current}
            numberOfItems={totalCount}
            page={currentPage}
            pageSize={pageSize}
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
            updateRemoteSortConfig={updateRemoteSortConfig}
            defaultTrigger={props.defaultTrigger}
            pagingDisplayTypeEnum={props.pagingDisplayType}
            pagingTypeEnum={props.pagingType}
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
            ...btn
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
