import classNames from "classnames";
import { ReactNode, createElement } from "react";
import { ButtonsTypeExt } from "../Datagrid";

/**
 * 2G custom buttons like default Mendix DataGrid
 *
 */
export function Button(button: ButtonsTypeExt, action: () => void) {
    switch (button.renderMode) {
        case "link":
            return linkButton(button, action);
        case "button":
            return defaultButton(button, action);
    }
}
function linkButton(button: ButtonsTypeExt, action: () => void): ReactNode {
    return (
        <a key={button.key} className={classNames("", "mx-link", button.btnClass)} onClick={action} href={"#"}>
            <span
                className={classNames("glyphicon", button.icon ? (button.icon.value as any).iconClass : "")}
                aria-hidden="true"
            />
            {button.caption ? button.caption : ""}
        </a>
    );
}
function defaultButton(button: ButtonsTypeExt, action: () => void): ReactNode {
    return (
        <button
            key={button.key}
            className={classNames("btn", "mx-button", "btn-" + button.buttonStyle, button.btnClass)}
            onClick={action}
        >
            <span
                className={classNames("glyphicon", button.icon ? (button.icon.value as any).iconClass : "")}
                aria-hidden="true"
            />
            {button.caption ? button.caption : ""}
        </button>
    );
}
