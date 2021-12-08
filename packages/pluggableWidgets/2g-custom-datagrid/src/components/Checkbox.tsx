import { createElement, ReactElement } from "react";
import { ObjectItem } from "mendix";
import { MouseEvent } from "react";

export const Checkbox = (props: {
    name: string;
    checked: boolean;
    handleClick: (e: MouseEvent<HTMLInputElement>, item?: ObjectItem) => void;
    item?: ObjectItem;
}): ReactElement => {
    return (
        <input
            checked={props.checked}
            name={props.name}
            type="checkbox"
            onClick={(e: MouseEvent<HTMLInputElement>) => {
                e.stopPropagation();
                return props.handleClick(e, props.item);
            }}
        />
    );
};
