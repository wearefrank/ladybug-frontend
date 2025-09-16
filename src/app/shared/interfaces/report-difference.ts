import DiffMatchPatch from 'diff-match-patch';

export interface ReportDifference {
  name: string;
  originalValue: string | null;
  difference: DiffMatchPatch.Diff[] | string;
}
