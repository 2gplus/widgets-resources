import { createElement, ReactElement, ReactNode } from "react";
import { InfiniteBody, Pagination } from "@mendix/piw-utils-internal/components/web";
import { ObjectItem } from "mendix";
import classNames from "classnames";
import { InfiniteBodyWidth } from "./InfiniteBodyWidth";

export interface GalleryProps<T extends ObjectItem> {
    className?: string;
    desktopItems: number;
    desktopItemsDynamic: boolean;
    emptyPlaceholderRenderer?: (renderWrapper: (children: ReactNode) => ReactElement) => ReactElement;
    emptyMessageTitle?: string;
    filters?: ReactNode;
    filtersTitle?: string;
    hasMoreItems: boolean;
    items: T[];
    itemRenderer: (
        renderWrapper: (children: ReactNode, className?: string, onClick?: () => void) => ReactElement,
        item: T
    ) => ReactNode;
    numberOfItems?: number;
    paging: boolean;
    verticalScroll: boolean;
    page: number;
    pageSize: number;
    paginationPosition?: "below" | "above";
    preview?: boolean;
    phoneItems: number;
    phoneItemsDynamic: boolean;
    setPage?: (computePage: (prevPage: number) => number) => void;
    tabletItems: number;
    tabletItemsDynamic: boolean;
    tabIndex?: number;
}

export function Gallery<T extends ObjectItem>(props: GalleryProps<T>): ReactElement {
    const pagination = props.paging ? (
        <div className="widget-gallery-pagination">
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
        </div>
    ) : null;
    const infiniteChildren =
        props.items.length > 0 && props.itemRenderer
            ? props.items.map(item =>
                  props.itemRenderer((children, className, onClick) => {
                      return (
                          <div
                              key={`item_${item.id}`}
                              className={classNames("widget-gallery-item", className, {
                                  "widget-gallery-clickable": !!onClick
                              })}
                              onClick={onClick}
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
                              role={onClick ? "button" : "listitem"}
                              tabIndex={onClick ? 0 : undefined}
                          >
                              {children}
                          </div>
                      );
                  }, item)
              )
            : [];
    const getColumnWidth = (items: number, dynamic: boolean): number => {
        let retVal = items;
        if (dynamic && !props.hasMoreItems && infiniteChildren.length < items) {
            retVal = infiniteChildren.length;
        }
        return retVal;
    };
    const infiniteClassNames = (): string[] => {
        const retVal = ["widget-gallery-items"];
        if (!props.paging && props.verticalScroll) {
            retVal.push("horizontal-scroll");
        }
        retVal.push(`widget-auto-column-lg-${getColumnWidth(props.desktopItems, props.desktopItemsDynamic)}`);
        retVal.push(`widget-auto-column-md-${getColumnWidth(props.tabletItems, props.tabletItemsDynamic)}`);
        retVal.push(`widget-auto-column-sm-${getColumnWidth(props.phoneItems, props.phoneItemsDynamic)}`);
        return retVal;
    };
    return (
        <div className={classNames("widget-gallery", props.className)} data-focusindex={props.tabIndex || 0}>
            {props.paginationPosition === "above" && pagination}
            <div className="widget-gallery-filter" role="section" aria-label={props.filtersTitle}>
                {props.filters}
            </div>

            {infiniteChildren.length > 0 &&
                (props.verticalScroll ? (
                    <InfiniteBodyWidth
                        className={classNames(infiniteClassNames())}
                        hasMoreItems={props.hasMoreItems}
                        setPage={props.setPage}
                        isInfinite={!props.paging}
                        role="list"
                    >
                        {infiniteChildren}
                    </InfiniteBodyWidth>
                ) : (
                    <InfiniteBody
                        className={classNames(infiniteClassNames())}
                        hasMoreItems={props.hasMoreItems}
                        setPage={props.setPage}
                        isInfinite={!props.paging}
                        role="list"
                    >
                        {" "}
                        {infiniteChildren}
                    </InfiniteBody>
                ))}
            {(props.items.length === 0 || props.preview) &&
                props.emptyPlaceholderRenderer &&
                props.emptyPlaceholderRenderer(children => (
                    <div className="widget-gallery-empty" role="section" aria-label={props.emptyMessageTitle}>
                        <div className="empty-placeholder">{children}</div>
                    </div>
                ))}
            {props.paginationPosition === "below" && pagination}
        </div>
    );
}
