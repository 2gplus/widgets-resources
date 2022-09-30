import { TreeView } from "./TreeViewButton";
import { createElement, ReactNode, useState, Fragment } from "react";
import { ObjectItem, ListWidgetValue } from "mendix";
import classNames from "classnames";
export interface TableRowprops {
    rowClass: string;
    row: ObjectItem;
    index: number;
    columnCount: number;
    onClick: (item: ObjectItem) => void;
    children: ReactNode[];
    treeViewWidget?: ListWidgetValue;
}

export function TableRow(props: TableRowprops): JSX.Element {
    const [treeViewEnabled, setTreeViewEnabled] = useState<boolean>(false);
    const getChildren = () => {
        const children = props.children;
        if (props.treeViewWidget) {
            children.push(
                <TreeView
                    classNames={classNames({ "td-borders": props.index === 0 })}
                    open={treeViewEnabled}
                    onChange={() => setTreeViewEnabled(!treeViewEnabled)}
                />
            );
        }
        return children;
    };
    const style = {
        gridColumnStart: 1,
        gridColumnEnd: props.columnCount + 1,
        display: "grid",
        gridTemplateColumns: "1fr"
    };
    const treeRender = () => {
        if (treeViewEnabled) {
            return (
                <div key={`tree_row_${props.row.id}`} className={classNames("tree-view-row")} style={style}>
                    {props.treeViewWidget?.get(props.row)}
                </div>
            );
        }
    };

    return (
        <Fragment>
            <div
                onClick={() => props.onClick(props.row)}
                key={`row_${props.row.id}`}
                className={props.rowClass}
                role="row"
            >
                {getChildren()}
            </div>
            {treeRender()}
        </Fragment>
    );
}
