import { type ScenarioType } from './types';

const EG_PATTERN = /\b(invalid|error|fail(ure|ed)?|incorrect|wrong|missing|unauthorized|forbidden|exception|reject(ed)?|denied|not found|cannot|unable|should not|negative|bad input|corrupt|expired|blocked)\b/i;
const BR_PATTERN = /\b(rule|policy|compliance|regulation|mandatory|required by|approval|workflow|permission|role|privilege|entitlement|business logic|business rule|access control|restrict)\b/i;
const EC_PATTERN = /\b(boundary|maximum|minimum|\bmax\b|\bmin\b|limit|empty|zero|\bnull\b|blank|threshold|overflow|underflow|special character|exactly|largest|smallest|upper bound|lower bound)\b/i;
const AF_PATTERN = /\b(alternative|alternate|cancel(l?ed)?|\bskip\b|optional|secondary|another way|different|bypass|partial|instead|fallback|retry)\b/i;

export function inferScenarioType(title: string, flow: string[] = [], expectedOutcome = ''): ScenarioType {
  const text = [title, ...flow, expectedOutcome].join(' ');
  if (EG_PATTERN.test(text)) return 'EG';
  if (BR_PATTERN.test(text)) return 'BR';
  if (EC_PATTERN.test(text)) return 'EC';
  if (AF_PATTERN.test(text)) return 'AF';
  return 'HP';
}

export function downloadFile(fileName: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function escapeCsvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}
