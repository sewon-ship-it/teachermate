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

// 중대부초 2026 실제 업무분장 & 인수인계 카드 & 1년 업무 타임라인 초기 데이터
// 개인정보보호(PII) 가이드라인에 따라 실명 대신 공식 직책명/역할명으로 표준화
export function buildJungdaeInitialData(): {
  duties: Duty[];
  tasks: Task[];
  cards: HandoverCard[];
} {
  const now = new Date().toISOString();

  // 1. 중대부초 2026 공식 업무분장 (실명 대신 직책/담당명으로 개인정보 보호)
  const duties: Duty[] = [
    { id: 'd-grade1-lead', name: '1학년 부장 (학년대표)', kind: 'grade' },
    { id: 'd-affairs-lead', name: '교무부장 (교무기획 총괄)', kind: 'duty' },
    { id: 'd-science-lead', name: '과학정보부장 (스마트정보화 총괄)', kind: 'duty' },
    { id: 'd-neis-info', name: '나이스 · 정보공시 · 감사교육 담당', kind: 'duty' },
    { id: 'd-grade4-magazine', name: '4학년 담임 · 교지 중앙동산 편집담당', kind: 'grade' },
    { id: 'd-homeroom-5', name: '5학년 담임 · 역사체험 (10/27 전담)', kind: 'homeroom' },
  ];

  // 2. 가동초 스타일: 처음 맡았다면 이렇게 해요 & 1년 월별 기안 흐름 & 실제 기안문 No 패키지
  const initialCards: HandoverCard[] = [
    // 🌸 1학년 부장
    {
      id: newId(),
      dutyId: 'd-grade1-lead',
      title: '1학년 부장 연간 실무 가이드 & 1년 기안 흐름',
      personInCharge: '1학년 부장 (학년대표)',
      locationPath: 'NAS2026 > 1학년연구실 > 학년운영',
      tips: `[1학년 부장 핵심 노하우]
1. 입학식 직전(2월 말)에 신입생 사물함 바구니, 이름표, 책날개 도서 품의를 반드시 완료해야 개학 첫날 혼란이 없습니다.
2. 5월 입학 100일 축하식과 10월 가을체험학습(10/30)은 3주 전에 학년 협의회를 거쳐 기안해야 합니다.
3. ⚠️ 1학년은 3월 하교 지도(학교버스 1~11호 탑승 도우미 연계)가 가장 중요하므로 교탁 밑 노선표 부착 필수!`,
      firstTimeGuide: `처음 1학년 부장을 맡으셨다면 다음 순서로 흐름을 잡으세요:
• 1~2월: 입학생 예비소집 결과 확인, 학급별 사물함/학용품 바구니 품의, 1학년 담임 오리엔테이션
• 3월: 입학식 행사 기안, 1학년 1차 학년협의회(기안 No.2478), 입학생 안전 적응 교육
• 5월: 입학 100일 잔치 및 우애남매 활동(기안 No.4873)
• 7월/12월: 학기말 1학년 방학식 안내장 발송 및 2학기 교재 수합
• 10월: 1학년 가을 현장체험학습(10/30) 안전 계획 수립 및 실시`,
      monthlyFlow: [
        { month: 3, label: '3월', summary: '입학식 총괄, 학년 협의회, 책날개 도서 품의', drafts: ['No.2244 입학식 용품 추가 구입', 'No.2478 1학년 협의회 실시 계획(1차)', 'No.2747 책날개 신규도서 구입'] },
        { month: 4, label: '4월', summary: '1학년 학습준비물 품의, 안전체험학습', drafts: ['No.3809 1학년 학습준비물 구입', 'No.4376 우애남매 티셔츠 배부'] },
        { month: 5, label: '5월', summary: '입학 백일 축하식, 1학기 현장체험학습', drafts: ['No.4873 1학년 입학 100일 축하 기념품 구입', 'No.5358 1학년 학습준비물 5월 품의'] },
        { month: 6, label: '6월', summary: '2차 현장체험학습 정산 및 안전지도', drafts: ['No.6495 1학년 맞춤형 현장체험학습 정산', 'No.7050 수영안전교육 참가'] },
        { month: 7, label: '7월', summary: '여름방학 생활안전지도, 1학기 마감', drafts: ['No.7449 여름방학 계획서 수합', 'No.8382 2학기 1학년 학습준비물 품의'] },
        { month: 9, label: '9월', summary: '2학기 1학년 협의회, 가을행사 준비', drafts: ['No.9239 2학기 1학년 학습준비물 품의', 'No.9522 2학기 1학년 교육활동 계획'] },
        { month: 10, label: '10월', summary: '1학년 2학기 학년협의회, 가을체험(10/30)', drafts: ['No.10926 1학년 2학기 학년협의회 계획', 'No.11431 11월 1학년 협의회 실시 계획'] },
        { month: 11, label: '11월', summary: '학급음악발표회(1학년 11/16) 준비', drafts: ['No.11934 1학년 겨울 현장학습 계획', 'No.12253 1학년 겨울 학습준비물'] },
        { month: 12, label: '12월', summary: '1학년 겨울방학식, 학년말 서류 정리', drafts: ['No.13058 1학년 특색활동 정산', 'No.13529 1학년 진급 준비물'] },
        { month: 2, label: '2월', summary: '신입생 맞이 예비소집 및 입학식 준비', drafts: ['No.953 1학년 미술용품 구입', 'No.1525 신입생 사물함 및 바구니 구입'] }
      ],
      pastDrafts: [
        { year: 2026, draftNo: 'No.11431', date: '2026-10-27', title: '2026학년도 11월 1학년 협의회 실시 계획', author: '1학년부장' },
        { year: 2026, draftNo: 'No.10926', date: '2026-10-14', title: '2026학년도 1학년 2학기 학년 협의회 실시 계획', author: '1학년부장' },
        { year: 2026, draftNo: 'No.8382', date: '2026-07-30', title: '(품의)2026학년도 1학년 학습준비물 구입', author: '1학년부장' },
        { year: 2026, draftNo: 'No.4873', date: '2026-05-07', title: '2026학년도 1학년 입학 100일 기념 행사를 위한 물품 구입', author: '1학년부장' },
        { year: 2026, draftNo: 'No.2244', date: '2026-03-05', title: '입학식 물품 추가 구입', author: '1학년부장' },
        { year: 2026, draftNo: 'No.1525', date: '2026-02-19', title: '입학생 사물함 및 물품 구입', author: '1학년부장' }
      ],
      updatedAt: now,
    },

    // 🏛️ 교무부장
    {
      id: newId(),
      dutyId: 'd-affairs-lead',
      title: '교무부장 연간 학사행정 가이드 & 1년 기안 흐름',
      personInCharge: '교무부장 (교무기획 총괄)',
      locationPath: 'NAS2026 > 교무기획부 > 학사운영',
      tips: `[교무부장 핵심 노하우]
1. 학사력은 12월 말에 초안이 나와야 차년도 2월 집중준비기간에 교육과정 편찬이 가능합니다.
2. 매월 20일경 다음 달 '학교운영계획' 기안(월중행사표)을 결재받아 전 교직원에게 배부해야 혼선이 없습니다.
3. ⚠️ 1학기말(7월), 2학기말(12월~1월) 나이스 생기부 마감 일정은 담임 교사들에게 2주 전 사전 공지 필수!`,
      firstTimeGuide: `처음 교무부장을 맡으셨다면 학교 1년의 뼈대를 관리한다고 생각하세요:
• 2월: 신학년 집중준비기간, 학교운영계획 수립, 교원 업무분장 발표
• 3월: 시업식·입학식 총괄 기안, 학교운영위원회 구성, 학급/전교 임원선거
• 4월: 1학기 학부모 총회 및 수업공개 주간 총괄 기안
• 7월: 여름방학식 기안, 방학 중 근무조 편성, 1학기 교육과정 반성회
• 10월: 개교기념일(10/17), 가을 운동회 및 학력평가(10/26) 총괄
• 12~2월: 차년도 신입생 전편입 원서접수, 졸업식/종업식 총괄`,
      monthlyFlow: [
        { month: 3, label: '3월', summary: '시업식·입학식, 3월 학교운영계획, 학급임원선거', drafts: ['No.2137 2026학년도 중대부초 학사운영 기본방침', 'No.2820 학급설명회 실시 계획', 'No.3357 4월 학교운영계획 수립'] },
        { month: 4, label: '4월', summary: '학교운영위원회 개최, 1학기 총회, 5월 계획', drafts: ['No.4432 제1회 학교운영위원회 개최', 'No.4551 5월 학교운영계획 수립'] },
        { month: 5, label: '5월', summary: '스승의날 기념식, 교육과정 중간점검, 6월 계획', drafts: ['No.5510 주간교육운영 협의록', 'No.5725 6월 학교운영계획 수립'] },
        { month: 6, label: '6월', summary: '학부모 상담주간 총괄, 7월 계획', drafts: ['No.6579 교육활동 운영 협의록', 'No.6749 7월 학교운영계획 수립'] },
        { month: 7, label: '7월', summary: '여름방학식 총괄, 방학 중 교원 근무 계획', drafts: ['No.7658 여름방학 및 8월 학교운영계획 수립', 'No.7835 1학기 교육과정 반성 및 2학기 준비'] },
        { month: 8, label: '8월', summary: '2학기 개학식 총괄, 9월 계획', drafts: ['No.8949 2학기 학생 교육활동 운영 계획', 'No.9171 2학기 학사운영 보완'] },
        { month: 9, label: '9월', summary: '2학기 학교운영위원회, 10월 계획', drafts: ['No.9701 2학기 학교운영 협의록', 'No.10230 10월 학교운영계획 수립'] },
        { month: 10, label: '10월', summary: '개교기념일(10/17), 운동회 총괄, 11월 계획', drafts: ['No.10716 10월 교무협의록', 'No.11495 11월 학교운영계획 수립'] },
        { month: 11, label: '11월', summary: '차년도 교육과정 설문조사, 12월 계획', drafts: ['No.11746 2학기 학교평가 계획', 'No.12274 2027 학교자율시간 설문'] },
        { month: 12, label: '12월', summary: '겨울방학식 총괄, 신입생 전편입 원서접수', drafts: ['No.12693 2027학년도 학생 전편입 안내', 'No.13411 2027학년도 교육과정 총괄'] }
      ],
      pastDrafts: [
        { year: 2026, draftNo: 'No.11495', date: '2026-10-28', title: '2026학년도 11월 학교운영계획 수립', author: '교무부장' },
        { year: 2026, draftNo: 'No.10230', date: '2026-09-23', title: '2026학년도 10월 학교운영계획 수립', author: '교무부장' },
        { year: 2026, draftNo: 'No.7658', date: '2026-07-14', title: '2026학년도 여름방학 및 8월 학교운영계획 수립', author: '교무부장' },
        { year: 2026, draftNo: 'No.2137', date: '2026-03-04', title: '2026학년도 중대부초 학사운영 기본방침', author: '교무부장' }
      ],
      updatedAt: now,
    },

    // 🔬 과학정보부장 (2025, 2026 연임 부장)
    {
      id: newId(),
      dutyId: 'd-science-lead',
      title: '과학정보부장 스마트정보화 & 전자칠판 실무 바이블',
      personInCharge: '과학정보부장 (2025~2026 연임 부장)',
      locationPath: 'NAS2026 > 과학정보부 > 정보화사업',
      tips: `[과학정보부장 2개년 핵심 연간 노하우]
1. [전자칠판]: 5월에 '전자칠판 물품선정위원회'(기안 No.5570, No.5697)를 반드시 개최하고, 6~7월에 조달청 나라장터 3단계 품의(기안 No.6494, No.7526)를 거쳐야 방학 중 설치 완료됩니다.
2. [정보화기기/교원 PC]: 4월에 교원 데스크탑 수요조사(No.4396)를 하고, 노후 기기는 교육청 폐기 지침에 따라 10월에 일괄 불용 처리합니다.
3. [학교 전산 인프라]: E알리미 라이선스 연장(No.2302)은 3월 첫 주, 캐노피 방송장비(No.3016) 점검은 개학 전 필수 점검!
4. [AI 선도학교]: AI 교실 운영(No.601) 및 찾아가는 AI 맞춤형 직무연수(No.9961)는 학기초 교무협의회와 연계합니다.`,
      firstTimeGuide: `과학정보부장을 처음 맡으셨다면 다음 정보화 사이클을 숙지하세요:
• 1~2월: 컴퓨터실 노후 데스크탑 점검(No.957), E알리미 연간 라이선스 갱신 품의, AI 선도학교 연간 계획 수립(No.601)
• 3월: 캐노피 방송시스템 정비(No.3016), 졸업앨범선정위원회 구성(No.2320), 교원 스마트기기 배정
• 4월: 무선망 AP 점검(No.4105), 교원용 데스크탑 추가 신청(No.4396), 스마트패드 점검
• 5월: 전자칠판 구매 계획(No.5526), 전자칠판 물품선정위원회 구성 및 평가(No.5570, No.5697), Adobe 라이선스 품의(No.5550)
• 6~7월: 전자칠판 설치 품의(No.6494, No.6737, No.7526), 컴퓨터실 방학 중 유지보수 용역 계약
• 9~10월: 2학기 학교 찾아가는 AI 직무연수(No.9961), 신입생 온라인 신청 프로그램 세팅(No.11101), 교원인사위원회(No.11439, No.11520)
• 11~12월: 노후 정보화기기 불용 처리 및 폐기 기안, 차년도 정보화 예산 요구서 작성`,
      monthlyFlow: [
        { month: 3, label: '3월', summary: 'E알리미 갱신, 캐노피 방송점검, 졸업앨범선정위', drafts: ['No.2302 E알리미 라이선스 연장', 'No.2320 졸업앨범선정위원회 구성', 'No.3016 캐노피 방송시스템 점검'] },
        { month: 4, label: '4월', summary: '무선 AP 점검, 교원 데스크탑 신청, 스마트패드 점검', drafts: ['No.4105 무선망 AP 교체설치', 'No.4396 교원용 데스크탑 신청', 'No.4408 정보화 소모품 구입'] },
        { month: 5, label: '5월', summary: '전자칠판 물품선정위원회, Adobe 라이선스 품의', drafts: ['No.5526 전자칠판 구매 계획', 'No.5570 전자칠판 물품선정위 구성', 'No.5697 물품선정위 결과보고', 'No.5550 Adobe 라이선스 연장'] },
        { month: 6, label: '6월', summary: '전자칠판 설치 품의, 노후 PC 교체, 6학년 졸업앨범', drafts: ['No.6494 전자칠판 설치 조달 품의', 'No.6737 전자칠판 부대공사 품의', 'No.7021 6학년 졸업앨범 촬영 계획'] },
        { month: 7, label: '7월', summary: '전자칠판 2차 설치, 피아노건반 유지보수, AI캠프', drafts: ['No.7267 컴퓨터실 방학 중 보수', 'No.7526 전자칠판 추가설치 품의', 'No.7790 피아노건반 유지보수', 'No.7869 1학기 AI캠프 정산'] },
        { month: 9, label: '9월', summary: '찾아가는 AI 맞춤형 연수, 2학기 전산 세팅', drafts: ['No.9961 찾아가는 AI 선도학교 연수', 'No.9175 신입생 온라인 접수 준비'] },
        { month: 10, label: '10월', summary: '신입생 온라인 신청 프로그램 세팅, 교원인사위원회', drafts: ['No.11101 신입생 온라인 접수 프로그램 구입', 'No.11127 교원인사위 운영규칙', 'No.11439 교원인사위 결과보고', 'No.11520 인사위 회의록'] },
        { month: 11, label: '11월', summary: '컴퓨터실 소모품 구입, 노후 기기 불용 처리', drafts: ['No.11394 정보화 소모품 추가구입', 'No.11120 컴퓨터실 기기 점검'] },
        { month: 12, label: '12월', summary: '차년도 전자칠판/스마트기기 예산 요구, 전산 백업', drafts: ['No.12877 중대부초 전산망 백업', 'No.13404 차년도 전자칠판 예산 요구'] },
        { month: 2, label: '2월', summary: '신학년 컴퓨터실 정비, 데스크탑 유지보수 용역', drafts: ['No.613 캐노피 방송 데스크탑 교체', 'No.957 컴퓨터실 기기 유지보수'] }
      ],
      pastDrafts: [
        { year: 2026, draftNo: 'No.11520', date: '2026-10-28', title: '2026학년도 교원인사위원회 회의록 - 교원인사위원회 운영 규칙 개정', author: '과학정보부장' },
        { year: 2026, draftNo: 'No.11101', date: '2026-10-19', title: '2026학년도 신입생온라인신청프로그램 구매 건', author: '과학정보부장' },
        { year: 2026, draftNo: 'No.9961', date: '2026-09-15', title: '2026 중대부초 학교로 찾아가는 AI 활용 맞춤형 직무연수 결과 보고', author: '과학정보부장' },
        { year: 2026, draftNo: 'No.7526', date: '2026-07-09', title: '2026학년도 전자칠판 설치 부대공사 품의 요청', author: '과학정보부장' },
        { year: 2026, draftNo: 'No.5697', date: '2026-05-23', title: '2026학년도 전자칠판 물품선정위원회 결과 보고', author: '과학정보부장' },
        { year: 2026, draftNo: 'No.5570', date: '2026-05-20', title: '2026학년도 전자칠판 물품선정위원회 구성 및 계획', author: '과학정보부장' },
        { year: 2026, draftNo: 'No.2302', date: '2026-03-06', title: '2026학년도 E알리미 라이선스 구매 건', author: '과학정보부장' }
      ],
      updatedAt: now,
    },

    // 💻 나이스 · 정보공시 · 감사교육
    {
      id: newId(),
      dutyId: 'd-neis-info',
      title: '나이스 · 정보공시 · 월별 감사교육 실무 바이블',
      personInCharge: '나이스 · 정보공시 · 감사교육 담당',
      locationPath: 'NAS2026 > 과학정보부 > 나이스정보공시',
      tips: `[나이스/정보공시/감사교육 핵심 팁]
1. [나이스 권한]: 3월 첫 주에 전 교원 권한 부여 및 인증서 재발급(No.2188, No.2819)을 끝내야 담임선생님들 출결 입력이 안 막힙니다.
2. [정보공시]: 4월 1차(학교 기본현황/수업시수)와 9~10월 2차(예결산/안전) 정시공시는 마감 3일 전 부서별 수합 완료 후 교장 결재를 올려야 지연이 안 생깁니다.
3. [월별 감사교육]: 5월 가정의 달 맞이 '감사 편지 쓰기 주간'과 연말 감사나눔 행사는 사진 촬영 후 홈페이지 및 뉴스레터 탑재까지 완료합니다.
4. ⚠️ 4세대 나이스 오류 시 교육청 콜센터 대기보다 [나이스 사용자 지원서비스] FAQ와 공지사항 검색이 10배 빠릅니다.`,
      firstTimeGuide: `나이스, 정보공시, 감사교육을 처음 맡았을 때의 핵심 연간 루틴:
• 3월: 전 교원 나이스 인증서 신규/재발급 신청 기안 (No.2188), 나이스 권한관리 체계 수립, 3월 감사인사 나눔
• 4월: 4월 정시 정보공시 입력 총괄 기안 (No.3522), 정보공시 검증 및 최종 제출
• 5월: 5월 가정의 달 맞이 감사 편지 쓰기 주간 운영 (우애남매 연계), 나이스 학기중 권한 점검
• 7월: 1학기말 나이스 생기부/출결 마감 점검 안내, 여름방학 중 나이스 백업
• 9~10월: 9~10월 정보공시 정시 2차 총괄 기안 (No.10501), 2학기 감사실천 프로젝트
• 12~1월: 나이스 학년말 출결/성적/생기부 최종 마감 점검, 차년도 진급용 반편성 나이스 기초 세팅`,
      monthlyFlow: [
        { month: 3, label: '3월', summary: '나이스 인증서 발급, 4월 정보공시 사전작업, 3월 감사교육', drafts: ['No.2188 나이스 인증서 재발급 신청', 'No.2819 나이스 인증서 신규 발급', 'No.2805 나이스 권한관리 자체점검 계획', 'No.3522 정보공시 사전 수합'] },
        { month: 4, label: '4월', summary: '4월 1차 정시 정보공시 최종 제출, 4월 감사주간', drafts: ['No.3668 정보공시 항목별 검증 완료', 'No.4956 4월 나이스 학적 반영 점검'] },
        { month: 5, label: '5월', summary: '5월 감사 편지 쓰기 주간(우애남매 연계) 총괄, 나이스 중간점검', drafts: ['No.5310 감사편지 쓰기 주간 운영 계획', 'No.6164 나이스 상반기 권한 점검'] },
        { month: 6, label: '6월', summary: '나이스 성적/수행평가 입력 사전 안내', drafts: ['No.6436 나이스 인증서 갱신', 'No.7125 6월 수시공시 항목 확인'] },
        { month: 7, label: '7월', summary: '1학기 나이스 생기부 마감 점검, 1학기 감사소감 수합', drafts: ['No.8378 1학기 나이스 생기부 입력 마감 안내', 'No.8795 생기부 데이터 검증'] },
        { month: 9, label: '9월', summary: '2학기 나이스 세팅, 9월 2차 정보공시 총괄', drafts: ['No.9623 나이스 인증서 추가 발급', 'No.10194 9월 정시 정보공시 제출'] },
        { month: 10, label: '10월', summary: '10월 정보공시 마감, 가을 감사실천 릴레이', drafts: ['No.10501 정보공시 2차 최종 제출', 'No.10817 나이스 보안 비밀번호 변경'] },
        { month: 11, label: '11월', summary: '연말 감사 카드 쓰기 주간, 나이스 전입생 점검', drafts: ['No.11349 나이스 인증서 신청', 'No.11920 감사실천 우수학급 격려'] },
        { month: 12, label: '12월', summary: '2학기 생기부 마감 점검, 나이스 학년말 세팅', drafts: ['No.12661 나이스 생기부 마감 최종 점검', 'No.13433 차년도 나이스 학사일정 이관'] },
        { month: 2, label: '2월', summary: '차년도 신입생/진급자 나이스 반편성 작업 총괄', drafts: ['No.915 나이스 신규교원 인증서 발급', 'No.1639 나이스 반편성 권한 이양'] }
      ],
      pastDrafts: [
        { year: 2026, draftNo: 'No.10817', date: '2026-10-12', title: '2026년 하반기 학교 나이스 권한관리 자체점검 실시', author: '정보담당' },
        { year: 2026, draftNo: 'No.10501', date: '2026-09-30', title: '2026년도 학교정보공시 2차 정시공시 제출', author: '정보담당' },
        { year: 2026, draftNo: 'No.9623', date: '2026-09-08', title: '중대부초 나이스 인증서 재발급 신청', author: '정보담당' },
        { year: 2026, draftNo: 'No.3522', date: '2026-03-31', title: '2026년도 1차 학교정보공시 사전 데이터 수합 요청', author: '정보담당' },
        { year: 2026, draftNo: 'No.2805', date: '2026-03-16', title: '2026년 상반기 중대부초 나이스 권한관리 자체점검 결과보고', author: '정보담당' },
        { year: 2026, draftNo: 'No.2188', date: '2026-03-04', title: '중대부초 나이스 인증서 재발급 신청', author: '정보담당' }
      ],
      updatedAt: now,
    },

    // 📖 4학년 담임 · 교지 '중앙동산'
    {
      id: newId(),
      dutyId: 'd-grade4-magazine',
      title: '4학년 학급경영 & 교지 중앙동산 발간 실전 매뉴얼',
      personInCharge: '4학년 담임 · 교지 중앙동산 편집담당',
      locationPath: 'NAS2026 > 4학년연구실 > 교지중앙동산',
      tips: `[교지 및 4학년 핵심 노하우]
1. [교지 중앙동산]: 인쇄소 계약 및 조판 일정은 6월에 1차 원고 마감, 7월에 제작비 1차 지급(No.7649 스타일)을 해야 연말 12월에 안전하게 발행됩니다.
2. [원고 수합]: 전교생 및 교직원 글짓기/그림 원고는 9월 말까지 취합하고, 교정 교열은 10~11월에 3교까지 꼼꼼히 봅니다.
3. [4학년 현장체험]: 10월 20일(화) 4학년 가을 현장체험학습은 9월 초(출발 6주 전)에 버스 견적 품의를 마쳐야 합니다.`,
      firstTimeGuide: `처음 교지 '중앙동산'과 4학년을 맡으셨다면 다음 일정을 메모해 두세요:
• 3월: 4학년 학급설명회 기안, 교지 '중앙동산 114호' 연간 발간 계획 수립 및 학생기자단 조직
• 5~6월: 교지 1학기 특집 원고(새 학년 다짐, 봄 행사) 수합 및 인쇄소 견적 비교 품의
• 7월: '중앙동산 114호' 1차 조판 및 제작비 선금 지급 품의 (기안 No.7649)
• 9~10월: 4학년 가을 현장체험학습(10/20) 실시, 교지 2학기 원고(운동회, 동아리) 2차 마감
• 11~12월: 교지 최종 가제본 검토(교장/교감선생님 결재), 인쇄 발주 및 전교생 배부, 잔금 정산 (기안 No.763 스타일)`,
      monthlyFlow: [
        { month: 3, label: '3월', summary: '4학년 학급설명회, 교지 중앙동산 114호 발간 계획 수립', drafts: ['No.2463 4학년 미술용품 구입', 'No.3130 4,6학년 교육과정 운영용품'] },
        { month: 4, label: '4월', summary: '4학년 봄 체험학습 준비, 교지 기자단 모집', drafts: ['No.3920 4학년 봄 현장학습 계획', 'No.4470 교지 원고 기고 안내'] },
        { month: 5, label: '5월', summary: '교지 1차 원고 수합, 인쇄소 비교 견적', drafts: ['No.5092 4,6학년 미술재료 추가구입', 'No.5521 교지 조판 준비'] },
        { month: 6, label: '6월', summary: '교지 1차 원고 마감, 인쇄 제작 품의', drafts: ['No.6034 4학년 학습준비물', 'No.6615 중앙동산 인쇄 계약 품의'] },
        { month: 7, label: '7월', summary: '중앙동산 114호 제작비 1차 지급 품의', drafts: ['No.7649 중앙동산 114호 제작비 지급(품의)', 'No.7900 방학 중 교지 편집'] },
        { month: 9, label: '9월', summary: '2학기 4학년 운영, 2학기 교지 원고 수합', drafts: ['No.9644 4,6학년 2학기 교구 품의', 'No.9718 중앙동산 2학기 원고 수합'] },
        { month: 10, label: '10월', summary: '4학년 가을 현장체험(10/20) 실시, 교지 2교 검토', drafts: ['No.9753 4학년 체험학습 정산', 'No.10756 중앙동산 2차 가제본 교정'] },
        { month: 11, label: '11월', summary: '교지 최종 교열 및 인쇄 발주', drafts: ['No.11935 중앙동산 최종 인쇄 발주', 'No.12251 4학년 학년말 정리'] },
        { month: 12, label: '12월', summary: '중앙동산 114호 학교 납품 검수 및 전교생 배부', drafts: ['No.12821 중앙동산 배부 계획', 'No.13095 4학년 겨울방학식 안내'] },
        { month: 1, label: '1월', summary: '중앙동산 114호 제작비 잔금 지급 정산', drafts: ['No.763 중앙동산 113호 제작비 정산(작년 기준)', 'No.650 4학년 진급서류 정리'] }
      ],
      pastDrafts: [
        { year: 2026, draftNo: 'No.9753', date: '2026-09-10', title: '2026학년도 2학기 4,6학년 미술 용품 추가 주문 품의서', author: '교지담당' },
        { year: 2026, draftNo: 'No.9718', date: '2026-09-09', title: '2026학년도 2학기 4,6학년 미술 용품 추가 구입 요청', author: '교지담당' },
        { year: 2026, draftNo: 'No.7649', date: '2026-07-13', title: '중앙동산 114호 제작비 지급', author: '교지담당' },
        { year: 2026, draftNo: 'No.6615', date: '2026-06-17', title: '2026학년도 1학기 4,6학년 미술 용품 추가 구입 요청', author: '교지담당' },
        { year: 2026, draftNo: 'No.763', date: '2026-01-30', title: '중앙동산 113호 제작비 지급', author: '교지담당' }
      ],
      updatedAt: now,
    },

    // 🎒 5학년 담임 · 역사체험 (10/27 전담)
    {
      id: newId(),
      dutyId: 'd-homeroom-5',
      title: '5학년 담임 연간 생존 요령 & 10/27 역사체험 복붙 패키지',
      personInCharge: '5학년 담임 (역사체험 전담)',
      locationPath: 'NAS2026 > 5학년연구실 > 역사체험학습',
      tips: `[10/27 5학년 역사체험학습 핵심 팁]
1. 버스 계약: 9월 중순(출발 6주 전)에 버스 견적 2곳 받아야 행정실 품의가 안 밀립니다.
2. 코스 답사: 역사체험 특성상 단체 관람 사전 예약(문화재청/박물관)을 9월 초에 미리 완료해야 합니다.
3. 가정통신문: 10월 첫 주(출발 3주 전) 발송. 회신서 수합 마감은 10월 16일 권장.
4. 생존 꿀팁: 학기초 우애남매 명단과 학교버스 노선표(1~11호)는 교탁 유리 밑에 필수 부착!`,
      firstTimeGuide: `처음 5학년 담임을 맡으셨다면 2학기 역사체험학습을 중심으로 흐름을 잡으세요:
• 3월: 학부모 총회 및 학급설명회 기안, 5학년 임원선거, 기초학력 진단평가
• 5월: 1학기 현장체험학습 실시 및 학생 안전관리
• 9월 15일: 10/27 역사체험 사전계획 수립 및 차량 2곳 비교 품의 (출발 6주 전 필수)
• 10월 6일: 역사체험 가정통신문 발송 및 안전지도 계획 (출발 3주 전)
• 10월 27일: 5학년 역사 현장체험학습 당일 실시 (안전지도 및 출결 확인)
• 10월 30일: 역사체험 정산 및 만족도 설문 기안`,
      monthlyFlow: [
        { month: 3, label: '3월', summary: '5학년 학급설명회, 임원선거, 진단평가', drafts: ['학부모 설명회 운영 계획', '5학년 학급운영비 품의'] },
        { month: 5, label: '5월', summary: '1학기 현장체험학습 실시', drafts: ['1학기 현장체험학습 계획', '차량 임차 품의'] },
        { month: 9, label: '9월', summary: '10/27 역사체험 계획 수립 및 버스 품의', drafts: ['5학년 2학기 역사체험 계획서', '버스 2곳 비교 견적서'] },
        { month: 10, label: '10월', summary: '가정통신문 발송, 10/27 역사체험 당일 실시, 정산', drafts: ['10/6 가정통신문 발송', '10/27 당일 안전지도', '10/30 정산 기안'] },
        { month: 12, label: '12월', summary: '2학기 생기부 교과/행발 마감', drafts: ['5학년 생기부 입력 마감 안내'] }
      ],
      pastDrafts: [
        { year: 2026, draftNo: 'No.10756', date: '2026-10-27', title: '5학년 역사 현장체험학습 실시 및 안전관리', author: '5학년담임' },
        { year: 2026, draftNo: 'No.9120', date: '2026-09-15', title: '5학년 2학기 역사체험학습 계획 수립 및 차량 품의', author: '5학년담임' }
      ],
      updatedAt: now,
    }
  ];

  // 3. 1년 업무 지도 타임라인에 꽂힐 실제 Tasks
  const initialTasks: Task[] = [
    // 🌸 1학년 부장
    {
      id: newId(),
      dutyId: 'd-grade1-lead',
      title: '1학년 입학식 행사 물품 및 신입생 사물함 바구니 구입 품의 (No.1525, No.2244)',
      dueDate: '2026-03-03',
      status: 'confirmed',
      origin: 'sample',
      note: '신입생 사물함 바구니, 이름표, 책날개 도서 3월 첫 주 배치 필수.',
      checklist: [{ id: newId(), text: '사물함 바구니 수량 파악', done: true }, { id: newId(), text: '행정실 견적 품의 완료', done: true }],
      sources: [{ docTitle: '중대부초 기안문서 No.1525', verified: true, excerpt: '입학생 사물함 및 물품 구입' }],
      locationPath: 'NAS2026 > 1학년연구실 > 입학준비',
      done: true,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-grade1-lead',
      title: '1학년 입학 100일 기념 축하 행사 계획 및 기념품 구입 (No.4873)',
      dueDate: '2026-05-07',
      status: 'confirmed',
      origin: 'sample',
      note: '입학 100일 기념 떡 및 학용품 세트 구입 품의. 우애남매 활동 연계.',
      checklist: [{ id: newId(), text: '1학년 학생수 맞춤형 기념품 품의', done: false }, { id: newId(), text: '100일 축하 편지 작성 지도', done: false }],
      sources: [{ docTitle: '중대부초 기안문서 No.4873', verified: true, excerpt: '1학년 입학 100일 기념 행사를 위한 물품 구입' }],
      locationPath: 'NAS2026 > 1학년연구실 > 입학100일',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-grade1-lead',
      title: '1학년 2학기 학년 협의회 및 11월 협의회 실시 계획 (No.10926, No.11431)',
      dueDate: '2026-10-14',
      status: 'confirmed',
      origin: 'sample',
      note: '10/30 가을 현장체험학습 및 11/16 학급음악발표회 사전 준비 점검',
      checklist: [{ id: newId(), text: '1학년 협의회 안건 공유', done: false }, { id: newId(), text: '체험학습 이동 동선 확인', done: false }],
      sources: [{ docTitle: '중대부초 기안문서 No.10926', verified: true, excerpt: '2026학년도 1학년 2학기 학년 협의회 실시 계획' }],
      locationPath: 'NAS2026 > 1학년연구실 > 학년협의회',
      done: false,
      updatedAt: now,
    },

    // 🏛️ 교무부장
    {
      id: newId(),
      dutyId: 'd-affairs-lead',
      title: '2026학년도 중대부초 학사운영 기본방침 및 학교운영계획 수립 (No.2137)',
      dueDate: '2026-03-04',
      status: 'confirmed',
      origin: 'sample',
      note: '시업식·입학식 후 3월 주요 학사일정 및 주간교육운영계획 전교직원 공람',
      checklist: [{ id: newId(), text: '학사일정 달력 점검', done: true }, { id: newId(), text: '교무회의 안건 배부', done: true }],
      sources: [{ docTitle: '중대부초 기안문서 No.2137', verified: true, excerpt: '2026학년도 중대부초 학사운영 기본방침' }],
      locationPath: 'NAS2026 > 교무기획부 > 학사운영',
      done: true,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-affairs-lead',
      title: '2026학년도 10월 및 11월 학교운영계획 수립 (No.10230, No.11495)',
      dueDate: '2026-09-23',
      status: 'confirmed',
      origin: 'sample',
      note: '개교기념일(10/17), 가을 운동회(10/7), 학력평가(10/26), 5학년 역사체험(10/27) 일정 총괄',
      checklist: [{ id: newId(), text: '부서별 10~11월 주요 행사 일정 취합', done: false }, { id: newId(), text: '월중행사표 교장 결재', done: false }],
      sources: [{ docTitle: '중대부초 기안문서 No.10230', verified: true, excerpt: '2026학년도 10월 학교운영계획 수립' }],
      locationPath: 'NAS2026 > 교무기획부 > 월중계획',
      done: false,
      updatedAt: now,
    },

    // 🔬 과학정보부장
    {
      id: newId(),
      dutyId: 'd-science-lead',
      title: '2026학년도 전자칠판 구매 계획 수립 및 물품선정위원회 개최 (No.5526, No.5570, No.5697)',
      dueDate: '2026-05-20',
      status: 'confirmed',
      origin: 'sample',
      note: '교실 스마트화 전자칠판 도입을 위한 위원회 평가 및 조달청 나라장터 3단계 품의 사전 결재',
      checklist: [{ id: newId(), text: '교원/학부모 물품선정위원 위촉', done: false }, { id: newId(), text: '규격서 및 제안서 평가표 작성', done: false }],
      sources: [{ docTitle: '중대부초 기안문서 No.5570', verified: true, excerpt: '2026학년도 전자칠판 물품선정위원회 구성 및 계획' }],
      locationPath: 'NAS2026 > 과학정보부 > 전자칠판',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-science-lead',
      title: '2026학년도 신입생 온라인 신청 프로그램 구매 및 캐노피 방송장비 점검 (No.3016, No.11101)',
      dueDate: '2026-10-19',
      status: 'confirmed',
      origin: 'sample',
      note: '차년도 신입생 원서접수 온라인 시스템 세팅 및 학교 방송시설 음향 점검 완료',
      checklist: [{ id: newId(), text: '전산 시스템 라이선스 품의', done: false }, { id: newId(), text: '서버 보안 점검', done: false }],
      sources: [{ docTitle: '중대부초 기안문서 No.11101', verified: true, excerpt: '2026학년도 신입생온라인신청프로그램 구매 건' }],
      locationPath: 'NAS2026 > 과학정보부 > 정보화사업',
      done: false,
      updatedAt: now,
    },

    // 💻 나이스 · 정보공시 · 감사교육
    {
      id: newId(),
      dutyId: 'd-neis-info',
      title: '2026학년도 교원 나이스 인증서 신규/재발급 및 권한관리 자체점검 (No.2188, No.2805)',
      dueDate: '2026-03-04',
      status: 'confirmed',
      origin: 'sample',
      note: '개학 첫 주 안에 전 교원 나이스 권한 부여 완료(담임 출결 직결)',
      checklist: [{ id: newId(), text: '전입/신규 교원 인증서 신청 취합', done: true }, { id: newId(), text: '나이스 권한관리대장 내부결재', done: true }],
      sources: [{ docTitle: '중대부초 기안문서 No.2188', verified: true, excerpt: '나이스 인증서 재발급 신청' }],
      locationPath: 'NAS2026 > 과학정보부 > 나이스',
      done: true,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-neis-info',
      title: '2026년도 학교정보공시 1차 정시공시 데이터 수합 및 최종 제출 (No.3522)',
      dueDate: '2026-04-15',
      status: 'confirmed',
      origin: 'sample',
      note: '학교 기본현황, 수업시수, 교육과정 편성현황 등 항목별 부서 검증 완료 후 총괄 제출',
      checklist: [{ id: newId(), text: '부서별 공시자료 수합', done: false }, { id: newId(), text: '정보공시 총괄 결재 완료', done: false }],
      sources: [{ docTitle: '중대부초 기안문서 No.3522', verified: true, excerpt: '학교정보공시 데이터 수합' }],
      locationPath: 'NAS2026 > 과학정보부 > 정보공시',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-neis-info',
      title: '2026년도 2차 정시 학교정보공시 제출 및 나이스 권한 자체점검 (No.10501, No.10817)',
      dueDate: '2026-09-30',
      status: 'confirmed',
      origin: 'sample',
      note: '예결산, 학교안전계획 공시 제출 및 2학기 교원 나이스 비밀번호 변경 캠페인',
      checklist: [{ id: newId(), text: '2차 정보공시 결재 완료', done: false }, { id: newId(), text: '나이스 보안 점검표 작성', done: false }],
      sources: [{ docTitle: '중대부초 기안문서 No.10501', verified: true, excerpt: '학교정보공시 2차 정시공시 제출' }],
      locationPath: 'NAS2026 > 과학정보부 > 정보공시',
      done: false,
      updatedAt: now,
    },

    // 📖 4학년 담임 · 교지 중앙동산
    {
      id: newId(),
      dutyId: 'd-grade4-magazine',
      title: '중앙동산 114호 제작비 지급 및 출판 인쇄 계약 품의 (No.7649, No.9753)',
      dueDate: '2026-07-13',
      status: 'confirmed',
      origin: 'sample',
      note: '1학기 교지 원고 1차 조판 및 제작비 선금 지급 품의 완료',
      checklist: [{ id: newId(), text: '인쇄소 견적서 비교 검토', done: false }, { id: newId(), text: '행정실 제작비 1차 지급 결재', done: false }],
      sources: [{ docTitle: '중대부초 기안문서 No.7649', verified: true, excerpt: '중앙동산 114호 제작비 지급' }],
      locationPath: 'NAS2026 > 4학년연구실 > 교지중앙동산',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-grade4-magazine',
      title: '4학년 가을 현장체험학습 실시 및 안전지도 (2026-10-20 당일)',
      dueDate: '2026-10-20',
      status: 'confirmed',
      origin: 'sample',
      note: '4학년 학생 전체 안전지도, 비상연락망 유지, 체험학습지 수합',
      checklist: [{ id: newId(), text: '차량 탑승 인원 점검', done: false }, { id: newId(), text: '현장 체험 지도 및 귀가 확인', done: false }],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '10.20.(화) 현장체험학습(4학년)' }],
      locationPath: 'NAS2026 > 4학년연구실 > 체험학습',
      done: false,
      updatedAt: now,
    },

    // 🎒 5학년 담임 · 역사체험 (10/27 전담)
    {
      id: newId(),
      dutyId: 'd-homeroom-5',
      title: '5학년 2학기 역사체험(현장체험학습) 사전 계획 수립 및 버스 임차 품의',
      dueDate: '2026-09-15',
      status: 'confirmed',
      origin: 'sample',
      note: '출발 6주 전 필수! 10/27 역사체험 일정 맞춤형 코스 사전 답사 및 버스 2곳 견적서 품의 완료 필요.',
      checklist: [
        { id: newId(), text: '역사체험 장소 사전 답사 안전 점검표 작성', done: false },
        { id: newId(), text: '차량 임차 견적 비교 품의', done: false }
      ],
      sources: [{ docTitle: '중대부초 2026 학사력', verified: true, excerpt: '10.27.(화) 현장체험학습(5학년) - 역사체험' }],
      locationPath: 'NAS2026 > 5학년연구실 > 역사체험',
      done: false,
      updatedAt: now,
    },
    {
      id: newId(),
      dutyId: 'd-homeroom-5',
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
      locationPath: 'NAS2026 > 5학년연구실 > 역사체험',
      done: false,
      updatedAt: now,
    }
  ];

  return { duties, tasks: initialTasks, cards: initialCards };
}
