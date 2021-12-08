import { ColumnsType } from "../typings/DataGridProps";

export const getGridTemplateColumns = (columns: ColumnsType[], multiSelect: boolean) => {
    let result = columns
        .map(c => {
            switch (c.width) {
                case "autoFit":
                    return "fit-content(100%)";
                case "manual":
                    return `${c.size}fr`;
                default:
                    return "1fr";
            }
        })
        .join(" ");
    if (multiSelect) {
        result = `fit-content(100%) ${result}`;
    }
    return result;
};
