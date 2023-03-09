import { createElement, useCallback } from "react";
import { CellRenderer } from "../components/Table";
import { ColumnsType } from "../../typings/DatagridProps";
import classNames from "classnames";
import { ObjectItem } from "mendix";
interface CellRendererHookProps {
    columns: ColumnsType[];
    onClick: (e: any, dblEvent: boolean, context?: ObjectItem) => void;
}

export function useCellRenderer({ onClick, columns }: CellRendererHookProps): CellRenderer {
    const renderer: CellRenderer = (renderWrapper, value, columnIndex) => {
        const column = columns[columnIndex];
        const title = column.tooltip && column.tooltip.get(value)?.value;
        let content;

        if (column.showContentAs === "attribute") {
            content = (
                <span title={title} className="td-text">
                    {column.attribute?.get(value)?.displayValue ?? ""}
                </span>
            );
        } else if (column.showContentAs === "dynamicText") {
            content = (
                <span title={title} className="td-text">
                    {column.dynamicText?.get(value)?.value ?? ""}
                </span>
            );
        } else {
            content = column.content?.get(value);
        }

        return renderWrapper(
            content,
            classNames(`align-column-${column.alignment}`, column.columnClass?.get(value)?.value, {
                "wrap-text": column.wrapText
            })
        );
    };

    return useCallback(renderer, [columns, onClick]);
}
