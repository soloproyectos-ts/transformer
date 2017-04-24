# Developer notes

The `build` folder is excluded from the repository and used exclusively to
compile sources. It contains the JavaScript (.js) and Type Definition (.dt.ts)
files.

## Prepares the project

Execute the following command to prepare the project and install
third-party sources:

```bash
./prepare.py
```

## Build sources

If you are using Atom's editor, it generates the JavaScript files automatically
thanks to the `compileOnSave` directive declared in the tsconfig.json file. In
any case, you can manually generate the JavaScript files by executing the
following command from the project's folder:

```bash
# generates .js files and saves them into the build folder
tsc
```

The following command will also generate the Type Definition (.dt.ts) files:

```bash
# generates .js files and .dt.ts files and saves them into the build folder
tsc --declaration
```

## Update distribution

The `dist` folder contains the distribution files (.js and .dt.ts files). To
update the distribution files just execute the following commands form the
project's folder:

```bash
# generate .js and .dt.ts files
tsc --declaration
# copy build/* into dist/*
cp build/* dist
```
