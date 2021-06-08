/* eslint-disable jest/no-conditional-expect */
import mock from 'mock-fs';
import {
  Config, findTODOInFile, findTODOInFolder, listFiles,
} from '.';
import { TODOFile } from './model';

beforeEach(() => {
  mock({
    '/data/src/moduleA': {
      'index.js': `console.log("Hello from moduleA");
// TODO WIP
// TODO to be done`,
      'test.png': '',
    },
    '/data/src/moduleB': {
      'index.ts': `console.log("Hello from moduleB");
// TODO WIP
`,
    },
  });
});

afterEach(() => {
  mock.restore();
});

test('list files on missing folder', () => {
  mock({});

  const result = listFiles('/data');
  expect(result.isErr()).toBeTruthy();
});

test('list files on data folder', () => {
  const result = listFiles('/data');
  expect(result.isOk()).toBeTruthy();
  if (result.isOk()) {
    expect(result.value).toEqual([
      '/data/src/moduleA/index.js',
      '/data/src/moduleA/test.png',
      '/data/src/moduleB/index.ts',
    ]);
  }
});

test('detect TODO in file', async () => {
  const result = await findTODOInFile('/data/src/moduleA/index.js', false);
  expect(result.isOk()).toBeTruthy();
  if (result.isOk()) {
    const expectedResult: TODOFile = {
      filename: 'index.js',
      path: '/data/src/moduleA',
      findings: [
        {
          lineNumber: 2,
          lineContent: '// TODO WIP',
        },
        {
          lineNumber: 3,
          lineContent: '// TODO to be done',
        },
      ],
    };
    expect(result.value).toEqual(expectedResult);
  }
});

test('detect TODO in files of data folder', async () => {
  const config: Config = {
    strictTODO: false,
    fileExtensionFilter: [],
  };
  const result = await findTODOInFolder('/data', config);
  expect(result.isOk()).toBeTruthy();
  if (result.isOk()) {
    expect(result.value).toEqual({
      files: [
        {
          filename: 'index.js',
          findings: [
            { lineContent: '// TODO WIP', lineNumber: 2 },
            { lineContent: '// TODO to be done', lineNumber: 3 },
          ],
          path: '/data/src/moduleA',
        },
        {
          filename: 'index.ts',
          findings: [{ lineContent: '// TODO WIP', lineNumber: 2 }],
          path: '/data/src/moduleB',
        },
      ],
    });
  }
});

const generateSource = (lineCount: number): string => 'console.log("hello");\n'.repeat(lineCount);

test('big project test', async () => {
  mock({
    '/data/src/moduleA': {
      'index.js': `${generateSource(10000000)}// TODO WIP`,
      'main.js': `${generateSource(10000000)}// TODO WIP`,
      'test.png': '',
    },
    '/data/src/moduleB': {
      'index.ts': `console.log("Hello from moduleB");
// TODO WIP
`,
    },
  });

  const config: Config = {
    strictTODO: false,
    fileExtensionFilter: [],
  };
  const result = await findTODOInFolder('/data', config);
  expect(result.isOk()).toBeTruthy();
  if (result.isOk()) {
    expect(result.value).toEqual({
      files: [
        {
          filename: 'index.js',
          findings: [{ lineContent: '// TODO WIP', lineNumber: 10000001 }],
          path: '/data/src/moduleA',
        },
        {
          filename: 'main.js',
          findings: [{ lineContent: '// TODO WIP', lineNumber: 10000001 }],
          path: '/data/src/moduleA',
        },
        {
          filename: 'index.ts',
          findings: [{ lineContent: '// TODO WIP', lineNumber: 2 }],
          path: '/data/src/moduleB',
        },
      ],
    });
  }
});
