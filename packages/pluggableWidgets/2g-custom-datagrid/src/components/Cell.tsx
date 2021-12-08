import { createElement, ReactElement, ReactNode } from "react";

interface CellProps {
    content: ReactNode;
}

export const Cell = (props: CellProps): ReactElement => {
    return (
        <div className="dg-cell" role="cell">
            {props.content}
        </div>
    );
};
