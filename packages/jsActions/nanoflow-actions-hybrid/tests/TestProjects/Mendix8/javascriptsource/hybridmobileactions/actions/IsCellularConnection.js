// This file was generated by Mendix Studio Pro.
//
// WARNING: Only the following code will be retained when actions are regenerated:
// - the import list
// - the code between BEGIN USER CODE and END USER CODE
// - the code between BEGIN EXTRA CODE and END EXTRA CODE
// Other code you write will be lost the next time you deploy the project.
/**
 * @returns {Promise.<boolean>}
 */
export async function IsCellularConnection() {
    // BEGIN USER CODE
    if (!navigator.connection) {
        throw Error("requires cordova-plugin-network-information");
    }
    switch (navigator.connection.type) {
        case Connection.CELL_2G:
            return true;
        case Connection.CELL_3G:
            return true;
        case Connection.CELL_4G:
            return true;
        case Connection.CELL:
            return true;
        default:
            return false;
    }
    // END USER CODE
}
