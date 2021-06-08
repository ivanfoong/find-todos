# WhatTODO (A CLI tool to find TODOs)

To find TODOs in your files
By ivanfoong<mailto:vonze21@gmail.com>

## Build source
```
$ npm run clean && npm run build
```

## Install wtd
```
$ npm install -g .
```

## View help
```
$ wtd --help
```

## Run
```
$ cd sample && wtd
```

## Run with strict mode (Only find TODOs that starts as a comment)
```
$ wtd --strict
```

## Run with detail output as json
```
$ wtd --json
```

## Run with file extensions filter (comma delimited)
```
$ wtd --ext=js,ts
```

## Uninstall wtd
```
$ npm uninstall -g whattodo
```