#!/usr/bin/env node
/* eslint-disable no-console */
import { join as pathJoin } from 'path';
import { Config, findTODOInFolder } from '.';

const showHelp = () => {
  console.log('Run this script in a folder to find TODOs');
  console.log('');
  console.log('Flags:');
  console.log('  --help       To show this help page');
  console.log('  --strict     To enable strict TODO match (In comment only)');
  console.log('  --json       Output as json along with TODO lines');
  console.log('  --ext=js,ts  File extensions to filter for(comma delimited)');
};

const main = async (args: string[]) => {
  if (args.includes('--help')) {
    showHelp();
    return;
  }

  let strictTODO = false;
  let jsonOutput = false;
  let fileExtensionFilter: string[] = [];
  args.forEach((arg) => {
    if (arg === '--strict') {
      strictTODO = true;
    } else if (arg === '--json') {
      jsonOutput = true;
    } else if (arg.startsWith('--ext=')) {
      fileExtensionFilter = arg.substring('--ext='.length).split(',');
    }
  });

  const config: Config = {
    strictTODO,
    fileExtensionFilter,
  };
  const result = await findTODOInFolder(process.cwd(), config);
  if (result.isErr()) {
    throw result.error;
  }

  if (jsonOutput) {
    console.log(JSON.stringify(result.value.files));
  } else {
    const filepaths = result.value.files.map((file) => pathJoin(file.path, file.filename));
    filepaths.forEach((filepath) => console.log(filepath));
  }
};

if (require.main === module) {
  const args = process.argv.slice(2);
  main(args)
    .then()
    .catch((e) => console.error(e));
}
