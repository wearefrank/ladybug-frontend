import { TargetOptions } from '@angular-builders/custom-webpack';

const TYPE_PHRASE = 'type="';

interface ReplaceResult {
  foundScriptTag: boolean;
  newIndexHtml: string;
}

export default (_targetOptions: TargetOptions, indexHtml: string) => {
  let n = 1;
  let replaceResult: ReplaceResult = replaceNthScriptTag(indexHtml, n);
  while (replaceResult.foundScriptTag) {
    replaceResult = replaceNthScriptTag(replaceResult.newIndexHtml, ++n);
  }
  return replaceResult.newIndexHtml;
};

function replaceNthScriptTag(indexHtml: string, n: number): ReplaceResult {
  const startIdx = findNthOf(indexHtml, n, '<script');
  if (startIdx < 0) {
    return { foundScriptTag: false, newIndexHtml: indexHtml };
  }
  const endIdx: number = indexHtml.indexOf('>', startIdx);
  if (endIdx < 0) {
    throw new Error(`Tag <script has no closing >, got index ${endIdx}`);
  }
  const typeIdx: number = indexHtml.indexOf(TYPE_PHRASE, startIdx);
  if (typeIdx < 0 || typeIdx >= endIdx) {
    throw new Error('Could not find type attribute within <script> tag');
  }
  const replaceStartIdx = typeIdx + TYPE_PHRASE.length;
  const endQuoteIdx = indexHtml.indexOf('"', replaceStartIdx);
  const newIndexHtml = indexHtml.slice(0, replaceStartIdx) + 'application/javascript' + indexHtml.slice(endQuoteIdx);
  return { foundScriptTag: true, newIndexHtml };
}

function findNthOf(subject: string, n: number, toFind: string) {
  let alreadyFound: number = 0;
  let searchFromIndex = 0;
  while (true) {
    const idx = subject.indexOf(toFind, searchFromIndex);
    if (idx >= 0) {
      ++alreadyFound;
      if (alreadyFound == n) {
        return idx;
      } else {
        searchFromIndex = idx + 1;
      }
    } else {
      return -1;
    }
  }
}

function findNextScriptTag(indexHtml: string, fromIdx: number): number {
  return indexHtml.indexOf('<script', fromIdx);
}
