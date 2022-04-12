import { CSSProperties, ReactElement, useCallback, useEffect, useRef, useState,createElement } from "react";
import { debounce } from "@mendix/piw-utils-internal";

import classNames from "classnames";
import { DefaultFilterEnum } from "../../typings/DatagridCheckBoxFilterProps";

interface FilterComponentProps
{
    className?: string;
    defaultFilter: DefaultFilterEnum;
    delay: number;
    id?: string;
    placeholder?: string;
    screenReaderButtonCaption?: string;
    screenReaderInputCaption?: string;
    tabIndex?: number;
    styles?: CSSProperties;
    updateFilters?: (value: boolean | undefined, type: DefaultFilterEnum) => void;
    value?: boolean;
}

export function FilterComponent(props: FilterComponentProps): ReactElement
{
    const [type] = useState<DefaultFilterEnum>(props.defaultFilter);
    const [value, setValue] = useState<boolean | undefined>(undefined);
    const [valueInput, setValueInput] = useState<Number>(0);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() =>
    {
        if (props.value)
        {
            setValueInput(props.value ? 1 : 0);
            setValue(props.value);
        }
    }, [props.value]);

    useEffect(() =>
    {
        props.updateFilters?.(value, type);
    }, [value, type]);

    const onChange = useCallback(
        debounce((value?: boolean) => setValue(value), props.delay),
        [props.delay]
    );


    return (
        <div
            className={classNames("filter-container", props.className)}
            data-focusindex={props.tabIndex ?? 0}
            style={props.styles}
        >
            <input
                type={'checkbox'}
                aria-label={props.screenReaderInputCaption}
                onChange={e =>
                {
                    const value = e.target.checked;
                    setValueInput(value ? 1: 0);
                    onChange(value);
                }}
                placeholder={props.placeholder}
                ref={inputRef}
                checked={valueInput === 1}
            />
        </div>
    );
}
