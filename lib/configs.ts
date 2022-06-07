import * as path from "path";

const strictNullCheckConfigs = require(path.resolve(
  process.cwd(),
  "strict-null-check.config.js"
));

export const configs = {
  appRootPath: strictNullCheckConfigs.appRootPath,
  tsconfigPath: strictNullCheckConfigs.tsconfigPath,
  srcPath: strictNullCheckConfigs.srcPath,
};
