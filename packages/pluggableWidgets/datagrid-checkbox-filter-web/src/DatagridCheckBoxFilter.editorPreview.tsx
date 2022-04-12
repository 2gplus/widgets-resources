import { createElement, ReactElement } from "react";
import { DatagridCheckBoxFilterPreviewProps } from "../typings/DatagridCheckBoxFilterProps";
import { FilterComponent } from "./components/FilterComponent";
import { parseStyle } from "@mendix/piw-utils-internal";

interface PreviewProps extends Omit<DatagridCheckBoxFilterPreviewProps, "class"> {
    className: string;
}

export function preview(props: PreviewProps): ReactElement {
    return (
        <FilterComponent
            className={props.className}
            defaultFilter={props.defaultFilter}
            delay={props.delay ?? 500}
            placeholder={props.placeholder}
            screenReaderButtonCaption={props.screenReaderButtonCaption}
            screenReaderInputCaption={props.screenReaderInputCaption}
            styles={parseStyle(props.style)}
        />
    );
}
