import DiffMatchPatch from 'diff-match-patch';

// TODO: Remove
export interface ReportDifference {
  name: string;
  originalValue: string;
  difference: DiffMatchPatch.Diff[] | string;
}

// TODO: Rename to ReportDifference
export interface ReportDifference2 {
  name: string;
  originalValue: string;
  difference: DiffMatchPatch.Diff[] | string;
  colorDifferences: boolean;
}
