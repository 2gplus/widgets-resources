import classNames from "classnames";
import { ReactNode, createElement, MouseEventHandler } from "react";
import { ButtonsTypeExt } from "../Datagrid";

/**
 * 2G custom buttons like default Mendix DataGrid
 *
 */

export function Button(
    button: ButtonsTypeExt,
    action: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
): ReactNode {
    switch (button.renderMode) {
        case "link":
            return linkButton(button, action);
        case "button":
            return defaultButton(button, action);
    }
}
function linkButton(button: ButtonsTypeExt, action: MouseEventHandler<HTMLAnchorElement>): ReactNode {
    return (
        <a
            key={button.key}
            className={classNames("", "mx-link", button.btnClass)}
            onClick={action}
            href={"#"}
            title={button.tooltip?.value}
        >
            {renderIcon(button)}
            {button.caption ? button.caption : ""}
        </a>
    );
}
function defaultButton(button: ButtonsTypeExt, action: MouseEventHandler<HTMLButtonElement>): ReactNode {
    return (
        <button
            key={button.key}
            className={classNames("btn", "mx-button", "btn-" + button.buttonStyle, button.btnClass, "button-tooltip")}
            onClick={action}
            title={button.tooltip?.value}
        >
            {renderIcon(button)}
            {button.caption ? button.caption : ""}
        </button>
    );
}
function renderIcon(button: ButtonsTypeExt): ReactNode {
    return button.iconClass ? (
        <span className={classNames(button.iconClass)} aria-hidden="true" />
    ) : button.icon ? (
        <span
            className={classNames("glyphicon", button.icon ? (button.icon.value as any).iconClass : "")}
            aria-hidden="true"
        />
    ) : null;
}
