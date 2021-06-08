const TODOSingleLineCommentRegex = /\/\/\s*todo/i;
const TODOMultiLineCommentRegex = /\/\**\s*todo/i;
const TODORegex = /\btodo\b/i;

export const findTODOInString = (str: string, strict: boolean): boolean => {
  if (strict) {
    return TODOSingleLineCommentRegex.test(str) || TODOMultiLineCommentRegex.test(str);
  }
  return TODORegex.test(str);
};

export const newLineRegex = /\r?\n/;
