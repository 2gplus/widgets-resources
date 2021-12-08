import { MouseEvent, createElement, ReactElement } from "react";
import { ColumnsType } from "./../../typings/DataGridProps.d";
import { ObjectItem } from "mendix";
import { Cell } from "./Cell";
import { Checkbox } from "./Checkbox";

interface HeaderProps {
    columns: ColumnsType[];
    checkbox: boolean;
    selection: ObjectItem[];
    data: ObjectItem[];
    handleCheckboxClick: (e: MouseEvent<HTMLInputElement>, item?: ObjectItem) => void;
}

export const Header = (props: HeaderProps): ReactElement => {
    const headers = props.columns.map<ReactElement>(column => {
        return <Cell content={column.header?.value} />;
    });

    if (props.checkbox) {
        const checked = props.selection.length === props.data.length;
        headers.unshift(
            <Cell content={<Checkbox checked={checked} name="allSelect" handleClick={props.handleCheckboxClick} />} />
        );
    }

    return (
        <div className="dg-row header" role="row">
            {headers}
        </div>
    );
};
