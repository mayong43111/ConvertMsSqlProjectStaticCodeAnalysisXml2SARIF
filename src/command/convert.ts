import { ConvertOption } from "./types/convert-option";

export function convert(options?: ConvertOption) {

    if (!checkAndPostOptions(options)) {
        return;
    }
}

function checkAndPostOptions(options?: ConvertOption) {

    if (!options) {
        console.error(`options is null.`)
        return false;
    }
}