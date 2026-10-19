import type { AppData, ChecklistItem, Duty, Task } from './types';
import { addDays, schoolYearOf, todayISO } from './dates';
import { newId } from './id';

const items = (...texts: string[]): ChecklistItem[] => texts.map((text) => ({ id: newId(), text, done: false }));

/**
 * 로컬 체험 모드용 샘플. 모두 가상의 예시이며, 실제 처리 절차는 학교·교육청 안내를 따른다.
 * 인터뷰에서 나온 사례(3월 개인정보 동의서, 4·9월 과학 기초자료 조사, 10월 영재 등)를 바탕으로 했다.
 */
export function buildSampleData(today = todayISO()): AppData {
  const sy = schoolYearOf(today);
  const next = sy + 1;
  const duties: Duty[] = [
    { id: newId(), name: '담임 공통', kind: 'homeroom' },
    { id: newId(), name: '6학년', kind: 'grade' },
    { id: newId(), name: '정보 담당', kind: 'duty' },
    { id: newId(), name: '과학 담당', kind: 'duty' },
    { id: newId(), name: '교지 담당', kind: 'duty' },
  ];
  const [homeroom, grade6, info, science, yearbook] = duties.map((d) => d.id);
  const now = new Date().toISOString();
  const t = (p: Partial<Task> & Pick<Task, 'title'>): Task => ({
    id: newId(), dutyId: null, note: '', dueDate: null, status: 'draft', origin: 'sample',
    checklist: [], sources: [], locationPath: '', done: false, updatedAt: now, ...p,
  });

  const tasks: Task[] = [
    t({
      title: '학년 초 NEIS 담임 처리 사항 확인', dutyId: homeroom, dueDate: `${sy}-03-06`, status: 'confirmed',
      note: '처리 항목과 메뉴는 학교 안내를 따른다. 이 카드는 샘플이다.',
      checklist: items('학교에서 안내한 처리 항목 목록 받기', '항목별 마감일을 타임라인에 옮기기', '처리 후 완료 체크'),
    }),
    t({ title: '개인정보 수집·이용 동의서 수합', dutyId: info, dueDate: `${sy}-03-20`, status: 'confirmed', checklist: items('가정통신문 배부', '미제출 학급 확인', '수합 결과 보관') }),
    t({ title: '과학 기초자료 조사 (1학기)', dutyId: science, dueDate: `${sy}-04-15` }),
    t({ title: '과학 기초자료 조사 (2학기)', dutyId: science, dueDate: `${sy}-09-15` }),
    t({ title: '영재교육 대상자 선발 관련 안내 확인', dutyId: science, dueDate: `${sy}-10-30`, note: '공문 도착 후 일정 확정' }),
    t({
      title: '현장체험학습 회신서 수합', dutyId: grade6, dueDate: addDays(today, 1), status: 'confirmed',
      checklist: items('미회신 가정 확인', '학년부장에게 결과 전달'),
    }),
    t({
      title: '교지 원고 수합 현황 확인', dutyId: yearbook, dueDate: addDays(today, 5), status: 'confirmed',
      checklist: items('미제출 학급 확인', '마감 3일 전 메신저 안내'),
      locationPath: 'NAS > 교무기획부 > 교지 > 원고',
    }),
    t({ title: '졸업식 준비 업무 확인', dutyId: grade6, dueDate: `${next}-01-08` }),
    t({
      title: '학년 말 반 배정 유의사항 확인', dutyId: homeroom, dueDate: `${next}-02-10`,
      note: '학생 명단은 올리지 않는다. 원본 위치만 연결한다.',
      locationPath: `NAS > 교무기획부 > ${sy}학년도 반편성`,
    }),
    t({ title: '내 업무 인수인계 카드 정리', dutyId: null, dueDate: `${next}-02-19`, status: 'confirmed', origin: 'manual' }),
  ];

  // 이미 지난 샘플은 완료 처리해 둔다
  for (const task of tasks) if (task.dueDate && task.dueDate < today && task.status === 'confirmed') task.done = true;

  return {
    duties,
    tasks,
    cards: [
      {
        id: newId(), dutyId: yearbook, title: '교지 업무 1년 흐름과 요령', updatedAt: now,
        locationPath: 'NAS > 교무기획부 > 교지',
        tips: '원고 마감은 2학기 중간고사 이후로 잡아야 담임 부담이 적다.\n마감 1주 전과 3일 전에 메신저 안내를 보낸다.\n인쇄 업체 견적은 9월 안에 받아 둔다.',
      },
    ],
  };
}
