export type TODOFinding = {
  lineNumber: number
  lineContent: string
}

export type TODOFile = {
  filename: string
  path: string
  findings: TODOFinding[]
}

export type TODOFindingReport = {
  files: TODOFile[]
}
