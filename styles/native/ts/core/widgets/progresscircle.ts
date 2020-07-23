import { brand, contrast, font } from "../variables";
import { ProgressCircleType }           from "../../types/widgets";
import { TextBox }                      from "./textbox";
/*

DISCLAIMER:
Do not change this file because it is core styling.
Customizing core files will make updating Atlas much more difficult in the future.
To customize any core styling, copy the part you want to customize to styles/native/app/ so the core styling is overwritten.

==========================================================================
    Progress Circle

    Default Class For Mendix Progress Circle Widget
========================================================================== */
export const com_mendix_widget_native_progresscircle_ProgressCircle: ProgressCircleType = {
    container: {
        // All ViewStyle properties are allowed
    },
    circle: {
        // Only the size & borderWidth & borderColor properties are allowed
        size: 80,
        borderWidth: 0,
    },
    fill: {
        // Only the width & backgroundColor & lineCapRounded properties are allowed
        backgroundColor: brand.primary,
        width: 5, // Thickness,
        lineCapRounded: true,
    },
    text: {
        // All TextStyle properties are allowed
        color: contrast.regular,
        fontSize: font.size,
        fontWeight: font.weightSemiBold,
        fontFamily: font.family,
    },
    validationMessage: {
        // All TextStyle properties are allowed
        ...TextBox.validationMessage
    },
};
