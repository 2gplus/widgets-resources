import { createElement, Dispatch, HTMLAttributes, ReactElement, SetStateAction, useEffect, useState } from "react";

export interface PaginationProps {
    canNextPage: boolean;
    canPreviousPage: boolean;
    gotoPage: (page: number) => void;
    nextPage: () => void;
    numberOfItems?: number;
    page: number;
    pageSize: number;
    previousPage: () => void;
    setPaginationIndex?: Dispatch<SetStateAction<number>>;
    labelNextPage?: string;
    labelPreviousPage?: string;
    labelFirstPage?: string;
    labelLastPage?: string;
    labelPagination?: string;
    labelPagingStatus?: string;
}

export function Pagination(props: PaginationProps): ReactElement | null {
    const numberOfPages =
        props.numberOfItems !== undefined ? Math.ceil(props.numberOfItems / props.pageSize) : undefined;
    const lastPage = numberOfPages !== undefined ? numberOfPages - 1 : 0;
    const hasLastPage = numberOfPages !== undefined;
    const initialItem = props.page * props.pageSize + 1;
    const lastItem =
        props.canNextPage || !props.numberOfItems ? (props.page + 1) * props.pageSize : props.numberOfItems;
    const setPageIndex = (page: number): void => {
        if (props.setPaginationIndex) {
            props.setPaginationIndex(page);
        }
    };
    let pagination = "";

    if (props.numberOfItems === 0) {
        return null;
    }

    const [paginationStatus, setPaginationStatus] = useState<string>(
        `${initialItem} "to" ${lastItem} ${
            hasLastPage ? ` "of" ${props.numberOfItems ?? (numberOfPages ?? 1) * props.pageSize}` : ""
        }`
    );
    useEffect(() => {
        const metaModel = async (): Promise<void> => {
            const response = await fetch(`metamodel.json?${mx.server.getCacheBust()}`);
            const metaModel = await response.json();
            const languageId = metaModel.languages.indexOf(mx.session.sessionData.locale.code);
            pagination = metaModel.systemTexts["mendix.lib.MxDataSource.status"][languageId];
            setPaginationStatus(
                pagination
                    .replace("{1}", String(initialItem))
                    .replace("{2}", String(lastItem))
                    .replace("{3}", String(props.numberOfItems ?? (numberOfPages ?? 1) * props.pageSize))
            );
        };
        metaModel().catch(console.error);
    }, [props.numberOfItems, props.pageSize, numberOfPages, props.page]);

    return (
        <div aria-label={props.labelPagination ?? "Pagination"} className="pagination-bar" role="pagination">
            <button
                className="btn pagination-button"
                disabled={props.page === 0}
                {...getEvents(() => {
                    props.gotoPage(0);
                    setPageIndex(0);
                })}
                aria-label={props.labelFirstPage ?? "Go to first page"}
            >
                <span aria-hidden className="glyphicon glyphicon-step-backward" />
            </button>
            <button
                className="btn pagination-button"
                disabled={!props.canPreviousPage}
                {...getEvents(() => {
                    props.previousPage();
                    setPageIndex(props.page - 1);
                })}
                aria-label={props.labelPreviousPage ?? "Go to previous page"}
            >
                <span aria-hidden className="glyphicon glyphicon-backward" />
            </button>
            <span className="sr-only sr-only-focusable">
                {props.labelPagingStatus ?? "Currently showing"} {paginationStatus}
            </span>
            <div aria-hidden className="paging-status">
                {paginationStatus}
            </div>
            <button
                aria-label={props.labelNextPage ?? "Go to next page"}
                className="btn pagination-button"
                disabled={!props.canNextPage}
                {...getEvents(() => {
                    props.nextPage();
                    setPageIndex(props.page + 1);
                })}
            >
                <span aria-hidden className="glyphicon glyphicon-forward" />
            </button>
            {hasLastPage && (
                <button
                    aria-label={props.labelLastPage ?? "Go to last page"}
                    className="btn pagination-button"
                    disabled={props.page === lastPage}
                    {...getEvents(() => {
                        props.gotoPage(lastPage);
                        setPageIndex(lastPage);
                    })}
                >
                    <span aria-hidden className="glyphicon glyphicon-step-forward" />
                </button>
            )}
        </div>
    );
}

function getEvents(action: () => void): Partial<HTMLAttributes<HTMLButtonElement>> {
    return {
        onClick: action,
        onKeyDown: e => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                action();
            }
        }
    };
}
