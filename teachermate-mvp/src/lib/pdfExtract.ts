/**
 * PDF → 텍스트 추출 (브라우저 전용, pdfjs-dist).
 * 원본 파일은 메모리에서만 처리하고 저장하지 않는다.
 */
import * as pdfjsLib from 'pdfjs-dist';

// Vite asset URL로 worker 경로 설정 (bundled worker)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const PDF_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.size > PDF_MAX_BYTES) {
    throw new Error(`파일이 너무 크다 (${(file.size / 1024 / 1024).toFixed(1)} MB). 5 MB 이하 PDF만 지원한다.`);
  }
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lineText = content.items
      .map((item: any) => (item.str ?? ''))
      .join(' ')
      .replace(/ {2,}/g, ' ')
      .trim();
    if (lineText) pages.push(lineText);
  }
  return pages.join('\n');
}
