import path, { join } from "path";

export function generateFullNameWithNumber(targetPath: string, extname: string, index: number, defaultBaseName: string): string {

    if (path.extname(targetPath).toLowerCase() == extname.toLowerCase()) {
        const basename = `${path.basename(targetPath, extname)}_${index}${extname}`;
        return path.join(path.dirname(targetPath), basename)
    } else {
        return path.join(targetPath, `${defaultBaseName}${extname}`)
    }
}