import { createElement, ReactElement } from "react";
import { ColumnsType, DefaultTriggerEnum } from "../../typings/DataGridProps";
import { ObjectItem, ListActionValue } from "mendix";
import { Cell } from "./Cell";
import { executeAction } from "@mendix/piw-utils-internal";
import { Checkbox } from "./Checkbox";
import { MouseEvent } from "react";

interface RowProps {
    columns: ColumnsType[];
    item: ObjectItem;
    onTrigger?: ListActionValue;
    defaultTrigger: DefaultTriggerEnum;
    selection: ObjectItem[];
    checkbox: boolean;
    handleCheckboxClick: (e: MouseEvent<HTMLInputElement>, item?: ObjectItem) => void;
}

export const Row = (props: RowProps): ReactElement => {
    const { onTrigger, item, defaultTrigger } = props;

    const triggerAction = onTrigger ? () => executeAction(onTrigger?.get(item)) : undefined;

    const cells = props.columns.map(column => {
        let content = getContent(column, props.item);
        return <Cell content={content} />;
    });

    if (props.checkbox) {
        const checked = props.selection.some(item => item?.id === props.item.id);
        cells.unshift(
            <Cell
                content={
                    <Checkbox
                        checked={checked}
                        handleClick={props.handleCheckboxClick}
                        name={props.item.id}
                        item={props.item}
                    />
                }
            />
        );
    }

    return (
        <div
            className="dg-row"
            onClick={defaultTrigger === "singleClick" ? triggerAction : undefined}
            onDoubleClick={defaultTrigger === "doubleClick" ? triggerAction : undefined}
            onKeyDown={onKeyDown(triggerAction)}
            role={triggerAction ? "button" : "row"}
        >
            {cells}
        </div>
    );
};

const getContent = (column: ColumnsType, row: ObjectItem) => {
    let content;
    if (column.showContentAs === "attribute") {
        content = column.attribute?.get(row)?.displayValue ?? "";
    } else if (column.showContentAs === "dynamicText") {
        content = column.dynamicText?.get(row)?.value ?? "";
    } else {
        content = column.content?.get(row);
    }
    return content;
};

const onKeyDown = (triggerAction?: () => void) => {
    if (triggerAction) {
        return (event: React.KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                triggerAction();
            }
        };
    }
    return undefined;
};
