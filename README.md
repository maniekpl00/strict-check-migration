This repository contains scripts to migrate its TypeScript codebase to use `--strictNullChecks`.

These scripts were originally forked from https://github.com/figma/strict-null-check-migration-tools

# How to use

- Configure path with `strict-null-check.config.js`
```javascript
module.exports = {
    appRootPath: "<your_project_path>",
    tsconfigPath: "<your_ts_config_strict_null_check_path>", // tsconfig.strictNullChecks.json
    srcPath: "<your_project_src_path>"
}
```

- Example of tsconfig.strictNullChecks.json 
```json
{
  "extends": "<your_base_tsconfig_path>",
  "compilerOptions": {
    "noEmit": true,
    "strictNullChecks": true
  },
  "include": [],
  "files": []
}
```


- `npm run findCandidates -- <your_project_path>/tsconfig.strictNullChecks.json` lists all the files whose dependencies have all been whitelisted. These files can be safely whitelisted too (once their strict null check errors have been fixed). It generates an output like this:

```
These files only depend on other files for which strictNullCheck has already been enabled.
The dependency count is approximate (this script only resolves up to third order imports).
- [ ] `"./component/AutocompleteField.tsx"` — Depended on by >**0** files (0 direct imports)
- [ ] `"./mapper/userMapper.ts"` — Depended on by >**0** files (0 direct imports)
- [ ] `"./model/Slice.ts"` — Depended on by >**0** files (0 direct imports)
...
```

- `npm run auto-add -- <your_project_path>/tsconfig.strictNullChecks.json` tries to automatically add to `tsconfig.strictNullChecks.json` every file that can already compile with strictNullChecks without further modifications. It generates an output like this:

```
...
Trying to auto add 'api/UserApi.ts' (file 1/100)
👍
Trying to auto add 'component/Alert.tsx' (file 2/100)
👍
Trying to auto add 'component/Breadcrumbs.tsx' (file 4/100)
💥 - 25
...
```

- `npm run find-cycles -- <your_project_path>/tsconfig.json` finds all dependency cycles that need to be strict null checked together. Generates an output like this:

```
...
Found strongly connected component of size 3
    /models/User.ts
    /utils/mapId.ts
    /utils/mapUser.ts
Found strongly connected component of size 2
    /models/Company.ts
    /models/Address.ts
Found 24 strongly connected components
Files not part of a strongly connected components (1974)
    /appEntry.tsx
    /appMiddleware.ts
...
```

- `npm run visualize` generates visualization data for strict null check progress in `data.js`. In order to view that data, open `progress.html`, a self-contained HTML file. You can also run a more expensive version of this script `npm run visualize -- --countErrors` that tells you how many errors are needed to fix each eligible file, though it takes a long time to run because it needs to compile the codebase multiple times.
