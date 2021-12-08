import { createElement, ReactElement, useState } from "react";
import { ColumnsType, DefaultTriggerEnum, SelectionModeEnum } from "../../typings/DataGridProps";
import { ObjectItem, ListActionValue } from "mendix";
import { getGridTemplateColumns } from "../utils";
import { Header } from "./Header";
import { Row } from "./Row";
import { MouseEvent } from "react";

export interface TableProps {
    data: ObjectItem[];
    className: string;
    columns: ColumnsType[];
    onTrigger?: ListActionValue;
    defaultTrigger: DefaultTriggerEnum;
    selectionMode: SelectionModeEnum;
}

export const Table = (props: TableProps): ReactElement => {
    const isMultiSelect = props.selectionMode === "multi";
    const gridTemplateColumns = getGridTemplateColumns(props.columns, isMultiSelect);
    const [selection, setSelection] = useState<ObjectItem[]>([]);

    const handleCheckboxClick = (e: MouseEvent<HTMLInputElement>, item?: ObjectItem) => {
        const { name, checked } = e.currentTarget;
        console.log(item);
        if (checked) {
            if (name === "allSelect") {
                setSelection(props.data);
            } else if (item !== undefined) {
                setSelection([...selection, item]);
            }
        } else {
            if (name === "allSelect") {
                setSelection([]);
            } else if (item !== undefined) {
                console.log(item.id);
                let s = selection.filter(s => s.id !== item.id);
                setSelection(s);
            }
        }
    };

    const rows: ReactElement[] = props.data.map(row => {
        return (
            <Row
                checkbox={isMultiSelect}
                columns={props.columns}
                handleCheckboxClick={handleCheckboxClick}
                selection={selection}
                defaultTrigger={props.defaultTrigger}
                item={row}
                onTrigger={props.onTrigger}
            />
        );
    });

    return (
        <div className={"dg-grid " + props.className} role="table">
            <div className="dg-content" role="rowgroup" style={{ gridTemplateColumns }}>
                <Header
                    columns={props.columns}
                    checkbox={isMultiSelect}
                    handleCheckboxClick={handleCheckboxClick}
                    selection={selection}
                    data={props.data}
                />
                {rows}
            </div>
        </div>
    );
};
