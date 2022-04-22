import classNames from "classnames";
import { ButtonsType } from "../../typings/DatagridProps";
import { ReactNode, createElement } from "react";

/**
 * 2G custom buttons like default Mendix DataGrid
 *
 */
export function Button(button: ButtonsType, action: () => void) {
    switch (button.renderMode) {
        case "link":
            return linkButton(button, action);
        case "button":
            return defaultButton(button, action);
    }
}
function linkButton(button: ButtonsType, action: () => void): ReactNode {
    return (
        <a key={null} className={classNames("", "mx-link")} onClick={action} href={"#"}>
            <span
                className={classNames("glyphicon", button.icon ? (button.icon.value as any).iconClass : "")}
                aria-hidden="true"
            />
            {button.caption ? button.caption : ""}
        </a>
    );
}
function defaultButton(button: ButtonsType, action: () => void): ReactNode {
    return (
        <button key={null} className={classNames("btn", "mx-button", "btn-" + button.buttonStyle)} onClick={action}>
            <span
                className={classNames("glyphicon", button.icon ? (button.icon.value as any).iconClass : "")}
                aria-hidden="true"
            />
            {button.caption ? button.caption : ""}
        </button>
    );
}
