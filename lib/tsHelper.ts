import * as path from "path";
import * as fs from "fs";
import * as ts from "typescript";

function getExistPath(fileName: string, extension: string) {
  if (fs.existsSync(`${fileName}.${extension}`)) {
    return `${fileName}.${extension}`;
  } else if (fs.existsSync(`${fileName}/index.${extension}`)) {
    return `${fileName}/index.${extension}`;
  }

  return undefined;
}


/**
 * Given a file, return the list of files it imports as absolute paths.
 */
export function getImportsForFile(file: string, srcRoot: string) {
  // Follow symlink so directory check works.
  // file = fs.realpathSync(file)

  // if (fs.lstatSync(file).isDirectory()) {
  //   const index = path.join(file, "index.ts")
  //   if (fs.existsSync(index)) {
  //     // https://basarat.gitbooks.io/typescript/docs/tips/barrel.html
  //     console.warn(`Warning: Barrel import: ${path.relative(srcRoot, file)}`)
  //     file = index
  //   } else {
  //     throw new Error(`Warning: Importing a directory without an index.ts file: ${path.relative(srcRoot, file)}`)
  //   }
  // }

  const fileInfo = ts.preProcessFile(fs.readFileSync(file).toString());
  return (
    fileInfo.importedFiles
      .map((importedFile) => importedFile.fileName)
      // remove svg, css imports
      .filter(
        (fileName) =>
          !fileName.endsWith(".css") &&
          !fileName.endsWith(".svg") &&
          !fileName.endsWith(".json") &&
          !fileName.endsWith(".png") &&
          !fileName.endsWith(".jpg") &&
          !fileName.endsWith(".jpeg")
      )
      .filter(
        (fileName) => !fileName.endsWith(".js") && !fileName.endsWith(".jsx")
      ) // Assume .js/.jsx imports have a .d.ts available
      .filter((x) => /\//.test(x)) // remove node modules (the import must contain '/')
      .map((fileName) => {
        if (/(^\.\/)|(^\.\.\/)/.test(fileName)) {
          return path.join(path.dirname(file), fileName);
        }
        if (/^app/.test(fileName)) {
          return path.join(srcRoot, "..", fileName);
        }
        if (
          fileName.endsWith("shared/constants") ||
          fileName.endsWith("shared/utils/redux") ||
          fileName.endsWith("shared/utils/type") ||
          fileName.endsWith("shared/utils/test")
        ) {
          return path.join(srcRoot, fileName, "index");
        }
        if (
          /^(api|component|container|decorator|detector|di|exception|form|mapper|formMapper|model|repository|register|router|service|util|validator|view|shared|reduxStore)/.test(
            fileName
          )
        ) {
          return path.join(srcRoot, fileName);
        }
        return undefined;
      })
      .filter((fileName) => !!fileName)
      .map((fileName) => {
        let resultFileName = undefined;
        const extensionList = ['tsx', 'ts', 'js', 'd.ts', 's.tsx', 's.ts'];

        for (const extension of extensionList) {
          resultFileName = getExistPath(fileName, extension);
          if (resultFileName) {
            return resultFileName;
          }
        }

        console.warn(
            `Warning: Unresolved import ${path.relative(srcRoot, fileName)} ${fileName} ` +
            `in ${path.relative(srcRoot, file)}`
        );
        return null;
      })
      .filter((fileName) => !!fileName)
  );
}

/**
 * This class memoizes the list of imports for each file.
 */
export class ImportTracker {
  private imports = new Map<string, string[]>();

  constructor(private srcRoot: string) {}

  public getImports(file: string): string[] {
    if (this.imports.has(file)) {
      return this.imports.get(file);
    }
    const imports = getImportsForFile(file, this.srcRoot);
    this.imports.set(file, imports);
    return imports;
  }
}
