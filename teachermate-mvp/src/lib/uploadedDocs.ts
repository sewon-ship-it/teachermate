export interface UploadedDoc {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'excel' | 'hwp' | 'doc';
  uploadedAt: string;
  itemCount: number;
  description: string;
}

const STORAGE_KEY = 'teachermate:uploaded_docs:v1';

export function getUploadedDocs(): UploadedDoc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  // 기본값: 중대부초 2026 학사력 원본 파일 기본 등록
  const defaultDocs: UploadedDoc[] = [
    {
      id: 'doc-jungdae-2026',
      fileName: '2026학사력_중대부초.pdf',
      fileType: 'pdf',
      uploadedAt: new Date().toISOString(),
      itemCount: 199,
      description: '중앙대학교사범대학부속초등학교 2026학년도 연간 학사일정 (199건 반영됨)'
    }
  ];
  saveUploadedDocs(defaultDocs);
  return defaultDocs;
}

export function saveUploadedDocs(docs: UploadedDoc[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // ignore
  }
}

export function addUploadedDoc(doc: Omit<UploadedDoc, 'id' | 'uploadedAt'>): UploadedDoc {
  const docs = getUploadedDocs();
  const newDoc: UploadedDoc = {
    ...doc,
    id: 'doc-' + Date.now().toString(36),
    uploadedAt: new Date().toISOString()
  };
  const updated = [newDoc, ...docs.filter(d => d.fileName !== doc.fileName)];
  saveUploadedDocs(updated);
  return newDoc;
}

export function removeUploadedDoc(id: string): void {
  const docs = getUploadedDocs();
  saveUploadedDocs(docs.filter(d => d.id !== id));
}
