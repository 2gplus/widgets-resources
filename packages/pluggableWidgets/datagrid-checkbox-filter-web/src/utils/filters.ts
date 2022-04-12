import { DefaultFilterEnum } from "../../typings/DatagridCheckBoxFilterProps";
import { FilterValue } from "@mendix/piw-utils-internal/components/web";

export type DefaultFilterValue = {
    type: DefaultFilterEnum;
    value: boolean;
};

export function translateFilters(filters?: FilterValue[]): DefaultFilterValue | undefined {
    if (filters && filters.length === 1) {
        const [filter] = filters;
        let type: DefaultFilterEnum = "equal";
        return {
            type,
            value: filter.value
        };
    }
    return undefined;
}
