import { createElement } from "react";
import classNames from "classnames";

export interface TreeViewProps {
    classNames?: string;
    open: boolean;
    onChange: () => void;
}

export function TreeView(props: TreeViewProps): JSX.Element {
    return (
        <div className={classNames("td", props.classNames)}>
            <a onClick={() => props.onChange()}>
                <span className={`glyphicon ${props.open ? "glyphicon-minus" : "glyphicon-plus"}`}></span>
            </a>
        </div>
    );
}
