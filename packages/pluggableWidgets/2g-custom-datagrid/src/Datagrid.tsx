import { createElement, ReactElement } from "react";
import { DatagridContainerProps } from "../typings/DataGridProps";
import { Table } from "./components/Table";

import "./ui/Datagrid.scss";
import { ObjectItem } from "mendix";

const Datagrid = (props: DatagridContainerProps): ReactElement => {
    let data: ObjectItem[] = [];
    if (props.datasource.items) {
        data = props.datasource.items;
    }

    return (
        <div>
            <div className="dg-list-actions"></div>
            <Table
                className={props.class}
                columns={props.columns}
                data={data}
                onTrigger={props.onTrigger}
                defaultTrigger={props.defaultTrigger}
                selectionMode={props.selectionMode}
            />
        </div>
    );
};

export default Datagrid;
