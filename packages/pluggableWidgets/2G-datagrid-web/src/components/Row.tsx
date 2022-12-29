import { TreeView } from "./TreeViewButton";
import { createElement, ReactNode, useState, Fragment } from "react";
import { ObjectItem, ListWidgetValue, ListExpressionValue } from "mendix";
import classNames from "classnames";
import { TreeViewPositionEnum } from "../../typings/DatagridProps";
export interface TableRowProps {
    rowClass: string;
    row: ObjectItem;
    index: number;
    columnCount: number;
    onClick: (item: ObjectItem) => void;
    children: ReactNode[];
    treeViewWidget?: ListWidgetValue;
    treeViewPosition: TreeViewPositionEnum;
    treeViewCondition?: ListExpressionValue<boolean>;
}

export function TableRow(props: TableRowProps): JSX.Element {
    const [treeViewEnabled, setTreeViewEnabled] = useState<boolean>(false);
    const getChildren = (): ReactNode[] => {
        const children = props.children;
        if (props.treeViewWidget) {
            let treeViewWidget: ReactNode;
            if (props.treeViewCondition === undefined || props.treeViewCondition.get(props.row).value) {
                treeViewWidget = (
                    <TreeView
                        classNames={classNames("td", { " td-borders": props.index === 0 })}
                        open={treeViewEnabled}
                        onChange={() => setTreeViewEnabled(!treeViewEnabled)}
                    />
                );
            } else {
                treeViewWidget = (
                    <div aria-hidden className={classNames("td", { "td-borders": props.index === 0 })}></div>
                );
            }

            switch (props.treeViewPosition) {
                case "left":
                    children.unshift(treeViewWidget);
                    break;
                case "Right":
                    children.push(treeViewWidget);
                    break;
            }
        }
        return children;
    };
    const style = {
        gridColumnStart: 1,
        gridColumnEnd: props.columnCount,
        display: "grid",
        gridTemplateColumns: "1fr"
    };
    const treeRender = () => {
        if (treeViewEnabled) {
            return (
                <div key={`tree_row_${props.row.id}`} className={classNames("tr tree-view-row")} style={style}>
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
