import { describe, expect, it } from 'vitest';
import { findDates, pickDeadline, daysBetween, dDayLabel, schoolYearOf, safeISO } from './dates';
import { scanPii } from './piiGuard';
import { parseAcademicCalendar } from './calendarParser';
import { extractFlowRuleBased, isVerbatim } from './flowExtractor';
import { groupReminders } from './reminders';
import { buildIcs } from './ics';
import type { Task } from './types';

describe('dates', () => {
  it('학년도: 1~2월은 전년도 학년도', () => {
    expect(schoolYearOf('2027-02-10')).toBe(2026);
    expect(schoolYearOf('2026-03-02')).toBe(2026);
  });
  it('존재하지 않는 날짜는 거부', () => {
    expect(safeISO(2026, 2, 30)).toBeNull();
    expect(safeISO(2028, 2, 29)).toBe('2028-02-29');
  });
  it('연도 없는 날짜는 학년도 기준으로 연도를 붙인다', () => {
    const f = findDates('1월 8일 졸업식, 3.2 개학', 2026);
    expect(f.map((x) => x.iso)).toEqual(['2027-01-08', '2026-03-02']);
  });
  it("'까지'가 붙은 날짜를 마감일로 고른다", () => {
    expect(pickDeadline('10월 20일 설명회 후 10.27.(화)까지 제출', 2026)).toBe('2026-10-27');
  });
  it('날짜가 없으면 추측하지 않는다', () => {
    expect(pickDeadline('담당자는 결과를 보고한다', 2026)).toBeNull();
  });
  it('D-day 계산', () => {
    expect(daysBetween('2026-10-16', '2026-10-23')).toBe(7);
    expect(dDayLabel(0)).toBe('D-day');
    expect(dDayLabel(-2)).toBe('D+2');
  });
});

describe('piiGuard', () => {
  it('주민등록번호 차단', () => {
    expect(scanPii('학생 140302-3123456').blocked).toBe(true);
  });
  it('휴대전화 차단, 학교 대표번호는 통과', () => {
    expect(scanPii('보호자 010-1234-5678').blocked).toBe(true);
    expect(scanPii('교무실 02-123-4567 로 문의').blocked).toBe(false);
  });
  it('번호+이름 명단 차단', () => {
    const roster = ['1 김민준', '2 이서연', '3 박지호', '4 최하윤', '5 정도윤'].join('\n');
    expect(scanPii(roster).blocked).toBe(true);
  });
  it('명단 표 머리글 차단', () => {
    expect(scanPii('번호\t성명\t생년월일').blocked).toBe(true);
  });
  it('일반 공문 문장은 통과', () => {
    const doc = '1. 각 학년은 10.27.(화)까지 현장체험학습 계획서를 제출한다.\n2. 이번 주 정보보안 점검을 실시한다.';
    expect(scanPii(doc).blocked).toBe(false);
  });
});

describe('calendarParser', () => {
  it('학사력 줄에서 날짜와 행사명 추출', () => {
    const ev = parseAcademicCalendar('3.2.(월) 입학식 및 시업식\n10.14~16 현장체험학습\n2027.01.08 졸업식\n메모 없는 줄', 2026);
    expect(ev).toHaveLength(3);
    expect(ev[0]).toMatchObject({ date: '2026-03-02', title: '입학식 및 시업식' });
    expect(ev[1]).toMatchObject({ date: '2026-10-14', endDate: '2026-10-16', title: '현장체험학습' });
    expect(ev[2]).toMatchObject({ date: '2027-01-08', title: '졸업식' });
  });
});

describe('flowExtractor', () => {
  const doc = `가. 학년별 계획서를 10월 27일까지 업무관리시스템으로 제출함.
나. 담당자는 결과를 취합하여 교감에게 보고한다.
다. 참고 사항: 작년 자료를 활용할 수 있음.`;
  it('행동 문장만 단계로 만들고, 근거가 원문과 일치', () => {
    const steps = extractFlowRuleBased(doc, 2026);
    expect(steps).toHaveLength(2);
    expect(steps[0].dueDate).toBe('2026-10-27');
    expect(steps[1].dueDate).toBeNull();
    expect(steps.every((s) => s.verified)).toBe(true);
  });
  it('원문에 없는 근거는 검증 실패', () => {
    expect(isVerbatim('지어낸 문장', doc)).toBe(false);
  });
});

const task = (p: Partial<Task>): Task => ({
  id: 't', dutyId: null, title: 'x', note: '', dueDate: null, status: 'confirmed', origin: 'manual',
  checklist: [], sources: [], locationPath: '', done: false, updatedAt: '', ...p,
});

describe('reminders', () => {
  it('확정·미완료만 D-7/D-1/지남으로 묶는다', () => {
    const g = groupReminders(
      [
        task({ id: 'a', dueDate: '2026-10-17' }),
        task({ id: 'b', dueDate: '2026-10-22' }),
        task({ id: 'c', dueDate: '2026-10-10' }),
        task({ id: 'd', dueDate: '2026-10-17', status: 'draft' }),
        task({ id: 'e', dueDate: '2026-10-17', done: true }),
        task({ id: 'f', dueDate: '2026-11-30' }),
      ],
      '2026-10-16'
    );
    expect(g.soon.map((t) => t.id)).toEqual(['a']);
    expect(g.week.map((t) => t.id)).toEqual(['b']);
    expect(g.overdue.map((t) => t.id)).toEqual(['c']);
  });
});

describe('ics', () => {
  it('확정된 일만 내보내고 알림 2개를 붙인다', () => {
    const ics = buildIcs([task({ id: 'a', dueDate: '2026-10-20', title: '원고 수합' }), task({ id: 'b', dueDate: '2026-10-20', status: 'draft' })], []);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(2);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261020');
  });
});

describe('flowExtractor 제목 줄', () => {
  it('문장이 아닌 제목 줄은 단계로 만들지 않는다', () => {
    const steps = extractFlowRuleBased('2026학년도 교지 제작 계획 안내\n담임은 원고를 10월 30일까지 제출한다.', 2026);
    expect(steps).toHaveLength(1);
  });
});

import { searchLocal } from './chatSearch';

describe('chatSearch', () => {
  const duties = [{ id: 'd1', name: '정보 담당', kind: 'duty' as const }];
  const tasks: Task[] = [
    task({ id: 't1', title: '교지 원고 수합', note: '10월 30일까지', status: 'confirmed', dutyId: 'd1', dueDate: '2026-10-30' }),
    task({ id: 't2', title: '현장체험학습 계획 제출', status: 'confirmed', dueDate: '2026-10-27' }),
    task({ id: 't3', title: '초안 할 일', status: 'draft' }),
  ];
  const cards = [
    { id: 'c1', dutyId: 'd1', title: '정보 담당 인수인계', tips: 'NAS 폴더 위치를 꼭 기억할 것', locationPath: 'NAS > 정보', updatedAt: '' },
  ];

  it('키워드 매칭으로 확정 할 일 찾기', () => {
    const r = searchLocal('교지', tasks, cards, duties);
    expect(r.uncertain).toBe(false);
    expect(r.sources.some((s) => s.id === 't1')).toBe(true);
  });

  it('초안은 검색에서 제외', () => {
    const r = searchLocal('초안', tasks, cards, duties);
    expect(r.sources.every((s) => s.id !== 't3')).toBe(true);
  });

  it('근거 없으면 uncertain=true', () => {
    const r = searchLocal('전혀없는키워드xyz', tasks, cards, duties);
    expect(r.uncertain).toBe(true);
  });

  it('인수인계 카드도 검색', () => {
    const r = searchLocal('정보 담당', tasks, cards, duties);
    expect(r.sources.some((s) => s.type === 'card')).toBe(true);
  });
});
