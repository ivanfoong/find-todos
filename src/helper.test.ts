import { findTODOInString } from './helper';

test('find todo in string', () => {
  expect(findTODOInString('//TODO to be done', true)).toBeTruthy();
  expect(findTODOInString('// TODO to be done', true)).toBeTruthy();
  expect(findTODOInString('//  TODO to be done', true)).toBeTruthy();
  expect(findTODOInString('//\tTODO to be done', true)).toBeTruthy();
  expect(findTODOInString('//\t\tTODO to be done', true)).toBeTruthy();
  expect(findTODOInString('//TODO', true)).toBeTruthy();
  expect(findTODOInString('/*TODO*/', true)).toBeTruthy();
  expect(findTODOInString('/*TODO to be done*/', true)).toBeTruthy();
  expect(findTODOInString('/*TODO to be done\nBy ivan*/', true)).toBeTruthy();
  expect(findTODOInString('/*By ivan*/', true)).toBeFalsy();
  expect(findTODOInString('//By ivan', true)).toBeFalsy();
  expect(findTODOInString('// By ivan', true)).toBeFalsy();
  expect(findTODOInString('const var = "By ivan"', true)).toBeFalsy();
});
