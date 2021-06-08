// import { createReadStream, readdirSync, statSync } from 'fs'
import * as fs from 'fs';
import { basename, dirname } from 'path';
import { findTODOInString, newLineRegex } from './helper';
import { TODOFile, TODOFinding, TODOFindingReport } from './model';
import { err, ok, Result } from './result';

export const listFiles = (
  dir: string,
): Result<string[], Error> => {
  try {
    const files = fs.readdirSync(dir);
    let newFileList: string[] = [];
    files.forEach((file) => {
      if (fs.statSync(`${dir}/${file}`).isDirectory()) {
        const result = listFiles(`${dir}/${file}`);
        if (result.isOk()) {
          newFileList = newFileList.concat(result.value);
        } else {
          // TODO handle error situation where the folder does not exist
        }
      } else {
        newFileList.push(`${dir}/${file}`);
      }
    });
    return ok(newFileList);
  } catch (e) {
    return err(e);
  }
};

export const findTODOInFile = async (
  filepath: string,
  strictTODO: boolean,
): Promise<Result<TODOFile, Error>> => new Promise<Result<TODOFile, Error>>((resolve) => {
  const findings: TODOFinding[] = [];
  let pendingChunk: string = '';
  let processedLineCount: number = 0;

  const readerStream = fs.createReadStream(filepath);
  readerStream.on('data', (chunk) => {
    pendingChunk = `${pendingChunk}${chunk}`;
    const lines = pendingChunk.split(newLineRegex);
    if (lines.length > 1) {
      const lastLine = lines.pop();
      lines.forEach((line) => {
        processedLineCount += 1;
        // console.log(`Line\t${processedLineCount}: ${line}`)
        if (findTODOInString(line, strictTODO)) {
          // console.log(`TODO found for Line\t${processedLineCount}: ${line}`)
          const lineNumber = processedLineCount;
          const lineContent = line;
          findings.push({
            lineNumber,
            lineContent,
          });
        }
      });
      pendingChunk = lastLine ?? '';
    }
  });
  readerStream.on('end', () => {
    processedLineCount += 1;
    if (findTODOInString(pendingChunk, strictTODO)) {
      // console.log(`TODO found for Line\t${processedLineCount}: ${line}`)
      const lineNumber = processedLineCount;
      const lineContent = pendingChunk;
      findings.push({
        lineNumber,
        lineContent,
      });
    }
    const path = dirname(filepath);
    const filename = basename(filepath);
    const file: TODOFile = {
      filename,
      path,
      findings,
    };
    resolve(ok(file));
  });
  readerStream.on('error', (e) => {
    resolve(err(e));
  });
});

export type Config = {
  strictTODO: boolean
  fileExtensionFilter: string[]
}

export const findTODOInFolder = async (
  dir: string,
  config: Config,
): Promise<Result<TODOFindingReport, Error>> => {
  const filesResult = listFiles(dir);
  if (filesResult.isErr()) {
    return err(filesResult.error);
  }
  const sourceFilePaths = filesResult.value.filter((filepath) => {
    if (config.fileExtensionFilter.length > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const ext of config.fileExtensionFilter) {
        if (filepath.endsWith(ext)) {
          return true;
        }
      }
      return false;
    }
    return true;
  });

  const files: TODOFile[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const filepath of sourceFilePaths) {
    // eslint-disable-next-line no-await-in-loop
    const result = await findTODOInFile(filepath, config.strictTODO);
    if (result.isOk() && result.value.findings.length > 0) {
      files.push(result.value);
    } else {
      // TODO not to silently fail
    }
  }
  const report: TODOFindingReport = {
    files,
  };
  return ok(report);
};
