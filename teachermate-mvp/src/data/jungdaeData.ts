import type { Duty, HandoverCard, Task } from '../lib/types';
import { newId } from '../lib/id';
import { JUNGDAE_CLEAN_EVENTS_2026 } from './jungdaeCleanEvents';

export interface JungdaeEvent {
  id?: string;
  date: string;
  title: string;
  targetGrades?: number[];
  category?: string;
  type?: 'event' | 'draft' | 'receive' | 'todo';
}

// 중대부초 2026학년도 실제 학사력 228건 전체 (docs/2026학사력_중대부초.pdf 100% 실데이터)
export const JUNGDAE_EVENTS_2026: JungdaeEvent[] = JUNGDAE_CLEAN_EVENTS_2026;

// 중대부초 2026 기본 업무분장 & 인수인계 카드 & 1년 업무 타임라인 초기 데이터
export function buildJungdaeInitialData(): {
  duties: Duty[];
  tasks: Task[];
  cards: HandoverCard[];
} {
  const now = new Date().toISOString();

  // 중대부초 2026 주요 부서/담당
  const duties: Duty[] = [
    { id: 'd-homeroom', name: '5학년 담임', kind: 'homeroom' },
    { id: 'd-curri', name: '교육과정부', kind: 'duty' },
    { id: 'd-affairs', name: '교무기획부', kind: 'duty' },
    { id: 'd-safety', name: '생활안전부', kind: 'duty' },
    { id: 'd-science', name: '과학정보부', kind: 'duty' },
    { id: 'd-creative', name: '창의체험부', kind: 'duty' },
  ];

  // 1년 업무 지도 (중대부초 실제 2026 학사력 및 업무 매핑)
  const initialTasks: Task[] = [
    // 📤 기안 공문
    {
      id: newId(),
      dutyId: 'd-homeroom',
      title: '1학기 학부모 수업공개 및 학급 설명회 운영 계획 기안',
      dueDate: '2026-03-19',
      status: 'confirmed',
      origin: 'sample',
      note: '수업 지도안 1주 전 교감선생님 사전 검토 완료 권장',
      checklist: [
        { id: newId(), text: '학급 특색 교육과정 브리핑 PPT 작성', done: false },
        { id: newId(), text: '학부모 대상 안내장 발송', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '3.19.(목) 학부모 수업공개 및 학급 설명회' }],
      locationPath: 'NAS2026 > 5학년 > 학급경영',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-science',
      title: '과학의 달 기념 교내 행사 계획 및 실험 키트 품의',
      dueDate: '2026-04-17',
      status: 'confirmed',
      origin: 'sample',
      note: '키트는 3월 말 전에 주문 안 하면 전국 품절 대란 발생(필수 선행)!',
      checklist: [
        { id: newId(), text: '학년별 키트 수량 품의', done: false },
        { id: newId(), text: '교내 과학탐구 세부일정 수립', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '4.17.(금) 과학의 날 교내 행사' }],
      locationPath: 'NAS2026 > 과학정보부 > 과학행사',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-homeroom',
      title: '1학기 현장체험학습 계획 수립 및 품의(출발 6주 전)',
      dueDate: '2026-05-15',
      status: 'confirmed',
      origin: 'sample',
      note: '사전 답사 안전 점검표 및 차량 2곳 견적서 필수 첨부',
      checklist: [
        { id: newId(), text: '사전 답사 점검표 작성', done: false },
        { id: newId(), text: '버스 견적서 비교 품의', done: false },
        { id: newId(), text: '가정통신문 회신서 수합', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '5.15.(금) 스승의 날 / 1학기 현장체험학습' }],
      locationPath: 'NAS2026 > 5학년 > 체험학습',
      done: false,
      updatedAt: now,
    },
    // ⭐ 5학년 2학기 역사체험학습 (2026-10-27) 관련 선행 및 당일 업무
    {
      id: newId(),
      dutyId: 'd-homeroom',
      title: '5학년 2학기 역사체험(현장체험학습) 사전 계획 수립 및 버스 임차 품의',
      dueDate: '2026-09-15',
      status: 'confirmed',
      origin: 'sample',
      note: '출발 6주 전 필수! 10/27 역사체험 일정 맞춤형 코스 사전 답사 및 버스 2곳 견적서 품의 완료 필요.',
      checklist: [
        { id: newId(), text: '역사체험 장소 사전 답사 안전 점검표 작성', done: false },
        { id: newId(), text: '차량 임차 견적 비교 품의', done: false },
        { id: newId(), text: '5학년 학년 회의를 통한 세부 탐방 동선 확정', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '10.27.(화) 현장체험학습(5학년) - 역사체험' }],
      locationPath: 'NAS2026 > 5학년 > 역사체험',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-homeroom',
      title: '5학년 2학기 역사체험(10/27) 가정통신문 발송 및 안전지도 계획',
      dueDate: '2026-10-06',
      status: 'confirmed',
      origin: 'sample',
      note: '출발 3주 전 안내장 발송, 비상연락망 구축 및 멀미약·개인 상비약 수요 조사',
      checklist: [
        { id: newId(), text: '학교종이앱 가정통신문 발송 및 동의서 취합', done: false },
        { id: newId(), text: '학생 이동 조편성 및 안전요원 역할 분담', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '10.27.(화) 현장체험학습(5학년) - 역사체험' }],
      locationPath: 'NAS2026 > 5학년 > 역사체험',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-homeroom',
      title: '5학년 역사 현장체험학습 실시 (10/27 당일 안전지도 및 출결 확인)',
      dueDate: '2026-10-27',
      status: 'confirmed',
      origin: 'sample',
      note: '당일 아침 등교 버스 승차 인원 교차 확인, 비콘 휴대 점검, 안전사고 유의',
      checklist: [
        { id: newId(), text: '아침 인원 점검 및 멀미 학생 앞자리 배치', done: false },
        { id: newId(), text: '역사체험 현장 안전수칙 교육 및 조별 미션 진행', done: false },
        { id: newId(), text: '학교 복귀 후 하교 안전 지도 및 귀가 확인', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '10.27.(화) 현장체험학습(5학년) - 역사체험' }],
      locationPath: 'NAS2026 > 5학년 > 역사체험',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-homeroom',
      title: '5학년 역사 현장체험학습 정산 및 만족도 설문 기안',
      dueDate: '2026-10-30',
      status: 'confirmed',
      origin: 'sample',
      note: '체험 종료 후 1주 이내 정산 결재 완료 및 학교 홈페이지 사진 탑재',
      checklist: [
        { id: newId(), text: '행정실 차량비·입장료 정산서 제출', done: false },
        { id: newId(), text: '학생 역사체험 학습지 수합 및 포트폴리오 정리', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '10.27.(화) 현장체험학습(5학년) 사후 업무' }],
      locationPath: 'NAS2026 > 5학년 > 역사체험',
      done: false,
      updatedAt: now,
    },
    // 📥 접수 공문 (교육청/수신)
    {
      id: newId(),
      dutyId: 'd-science',
      title: '과학실험실 폐수·폐시약 및 액침표본 보관 현황 보고 공문 접수',
      dueDate: '2026-03-27',
      status: 'confirmed',
      origin: 'sample',
      note: '교육지원청 지정 기한 엄수. 과학실무사 지정 공문 처리.',
      checklist: [
        { id: newId(), text: '폐수통 밀폐 상태 실사', done: false },
        { id: newId(), text: '교육지원청 자료집계 제출', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '상반기 폐기물 보관 현황 보고' }],
      locationPath: 'NAS2026 > 과학정보부 > 과학실',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-curri',
      title: '기초학력 진단평가 결과 통계 보고 공문 접수',
      dueDate: '2026-03-20',
      status: 'confirmed',
      origin: 'sample',
      note: '2~6학년 평가 결과 집계 및 맞춤형 학습지원 대상자 선별',
      checklist: [
        { id: newId(), text: '학년별 채점표 수합', done: false },
        { id: newId(), text: '진단평가 통계표 내부결재', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '3.10.(화) 기초학력 진단평가' }],
      locationPath: 'NAS2026 > 교육과정부 > 기초학력',
      done: false,
      updatedAt: now,
    },
    // ⏳ 예정 업무 (체크리스트)
    {
      id: newId(),
      dutyId: 'd-safety',
      title: '우애남매활동 및 감사 편지 쓰기 주간 운영',
      dueDate: '2026-05-08',
      status: 'confirmed',
      origin: 'sample',
      note: '어버이날·스승의 날 행사와 연계하여 진행하면 학급 부담 경감',
      checklist: [
        { id: newId(), text: '우애남매 편지 교환 지도', done: false },
        { id: newId(), text: '활동 사진 촬영(편집출판 실무사 공유)', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '5.8.(금) 어버이날 행사 및 우애남매' }],
      locationPath: 'NAS2026 > 생활안전부 > 감사교육',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-affairs',
      title: '1학기 나이스 학교생활기록부 마감 점검 안내',
      dueDate: '2026-07-06',
      status: 'confirmed',
      origin: 'sample',
      note: '마감 1주 전 전체 안내, 3일 전 미입력 교원 메신저 독려',
      checklist: [
        { id: newId(), text: '출결·교과평가 입력 조회', done: false },
        { id: newId(), text: '학년부장 교차 점검 요청', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '7.6.(월) 1학기 생기부 마감 점검' }],
      locationPath: 'NAS2026 > 교무기획부 > 생기부',
      done: false,
      updatedAt: now,
    }
  ];

  // 인수인계 카드 (현실 생존 팁 & 1초 복붙 패키지)
  const initialCards: HandoverCard[] = [
    {
      id: newId(),
      dutyId: 'd-homeroom',
      title: '5학년 담임 연간 생존 요령 & 10/27 역사체험 복붙 패키지',
      locationPath: 'NAS2026 > 5학년',
      tips: `[10/27 5학년 역사체험학습 핵심 팁]
1. 버스 계약: 9월 중순(출발 6주 전)에 버스 견적 2곳 받아야 행정실 품의가 안 밀립니다.
2. 코스 답사: 역사체험 특성상 단체 관람 사전 예약(문화재청/박물관)을 9월 초에 미리 완료해야 합니다.
3. 가정통신문: 10월 첫 주(출발 3주 전) 발송. 회신서 수합 마감은 10월 16일 권장.
4. 생존 꿀팁: 학기초 우애남매 명단과 학교버스 노선표(1~11호)는 교탁 유리 밑에 필수 부착!`,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-science',
      title: '과학정보부 실무 요령 & 1초 복붙 패키지',
      locationPath: 'NAS2026 > 과학정보부',
      tips: `[과학정보부 3월~4월 생존 팁]
1. 학년도 초 나이스 권한 부여는 3월 첫 주 안에 완료할 것(담임 출결 직결).
2. 과학의 날(4/17) 키트는 3월 2주차에 미리 품의 안 올리면 전국 품절 대란 발생!
3. ⚠️ 4세대 나이스 오류 시 교육청 콜센터보다 지원센터 공지사항부터 확인할 것.`,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-safety',
      title: '생활안전부(우애남매·감사교육) 운영 요령',
      locationPath: 'NAS2026 > 생활안전부',
      tips: `[우애남매 및 생활지도 팁]
1. 우애남매 1~6학년 매칭표는 3월 2주차에 교육과정부와 공유.
2. 감사 편지 쓰기 주간(5/4~5/8) 마감은 1주 전, 3일 전 두 번 안내.
3. ⚠️ 사진 및 홍보물 제작 지원은 편집출판 실무사에게 최소 3일 전 사전 요청할 것.`,
      updatedAt: now,
    }
  ];

  return { duties, tasks: initialTasks, cards: initialCards };
}
