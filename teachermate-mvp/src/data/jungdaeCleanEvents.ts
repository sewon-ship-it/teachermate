// 2026학년도 중대부초 실제 학사력 (docs/2026학사력_중대부초.pdf 기반 100% 실데이터)
export interface JungdaeEvent {
  id: string;
  date: string;
  title: string;
  targetGrades: number[];
  category: string;
}

export const JUNGDAE_CLEAN_EVENTS_2026: JungdaeEvent[] = [
  {
    "id": "jungdae-2026-03-01-0",
    "date": "2026-03-01",
    "title": "삼일절",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-03-02-1",
    "date": "2026-03-02",
    "title": "대체휴일",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-03-03-2",
    "date": "2026-03-03",
    "title": "시업식(급식 없음, 11시 30분 하교)",
    "targetGrades": [],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-03-03-3",
    "date": "2026-03-03",
    "title": "입학식(1학년, 14시)",
    "targetGrades": [
      1
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-03-04-4",
    "date": "2026-03-04",
    "title": "학교폭력예방교육 (1학년 ㅈ학부모)",
    "targetGrades": [
      1
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-05-5",
    "date": "2026-03-05",
    "title": "경칩",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-05-6",
    "date": "2026-03-05",
    "title": "학급임원선거",
    "targetGrades": [],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-03-05-7",
    "date": "2026-03-05",
    "title": "전교임원 후보 선출",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-05-8",
    "date": "2026-03-05",
    "title": "표준화검사(전학년)",
    "targetGrades": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-03-07-9",
    "date": "2026-03-07",
    "title": "토요방과후수업",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-07-10",
    "date": "2026-03-07",
    "title": "개강",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-10-11",
    "date": "2026-03-10",
    "title": "기초학력 진단평가 (2~6학년)",
    "targetGrades": [
      6
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-03-11-12",
    "date": "2026-03-11",
    "title": "동아리, 우애남매 조직",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-11-13",
    "date": "2026-03-11",
    "title": "발명품경진대회작품출품주간(3~6학년 중 지원자)",
    "targetGrades": [
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-03-12-14",
    "date": "2026-03-12",
    "title": "전교임원선거",
    "targetGrades": [],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-03-13-15",
    "date": "2026-03-13",
    "title": "임원수련회(13~14)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-16-16",
    "date": "2026-03-16",
    "title": "동아리활동①",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-16-17",
    "date": "2026-03-16",
    "title": "방과후 수업 개강",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-19-18",
    "date": "2026-03-19",
    "title": "학부모 수업공개",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-19-19",
    "date": "2026-03-19",
    "title": "학급 설명회",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-20-20",
    "date": "2026-03-20",
    "title": "춘분",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-23-21",
    "date": "2026-03-23",
    "title": "신입생 대면식",
    "targetGrades": [],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-03-23-22",
    "date": "2026-03-23",
    "title": "우애남매활동①",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-26-23",
    "date": "2026-03-26",
    "title": "안전체험",
    "targetGrades": [],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-03-26-24",
    "date": "2026-03-26",
    "title": "a (1-3, 1-5)",
    "targetGrades": [
      1
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-03-27-25",
    "date": "2026-03-27",
    "title": "안전체험B(1-1, 1-2, 1-4)",
    "targetGrades": [
      1
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-03-30-26",
    "date": "2026-03-30",
    "title": "아빠줌독서모임 (1학기 개강)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-04-02-27",
    "date": "2026-04-02",
    "title": "현장체험학습(3학년)",
    "targetGrades": [
      3
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-04-03-28",
    "date": "2026-04-03",
    "title": "현장체험학습(2학년)",
    "targetGrades": [
      2
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-04-05-29",
    "date": "2026-04-05",
    "title": "식목일 청명",
    "targetGrades": [],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-04-06-30",
    "date": "2026-04-06",
    "title": "한식",
    "targetGrades": [],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-04-07-31",
    "date": "2026-04-07",
    "title": "현장체험학습(4학년)",
    "targetGrades": [
      4
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-04-08-32",
    "date": "2026-04-08",
    "title": "우애남매활동주간②",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-04-10-33",
    "date": "2026-04-10",
    "title": "진로체험(6학년)",
    "targetGrades": [
      6
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-04-13-34",
    "date": "2026-04-13",
    "title": "동아리활동②",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-04-15-35",
    "date": "2026-04-15",
    "title": "정서행동특성검사(1, 4학년)",
    "targetGrades": [
      4
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-04-16-36",
    "date": "2026-04-16",
    "title": "현장체험학습(1-1, 2, 3반)",
    "targetGrades": [
      1
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-04-16-37",
    "date": "2026-04-16",
    "title": "소규모테마형교육여행 예정(5학년)",
    "targetGrades": [
      5
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-04-17-38",
    "date": "2026-04-17",
    "title": "현장체험학습(1-4, 5반)",
    "targetGrades": [
      1
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-04-20-39",
    "date": "2026-04-20",
    "title": "곡우",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-04-20-40",
    "date": "2026-04-20",
    "title": "우애남매활동③",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-04-22-41",
    "date": "2026-04-22",
    "title": "정서행동특성검사(1, 4학년)",
    "targetGrades": [
      4
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-04-27-42",
    "date": "2026-04-27",
    "title": "학력평가(2~6학년)",
    "targetGrades": [
      6
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-05-01-43",
    "date": "2026-05-01",
    "title": "3.15 근로자의날",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-05-01-44",
    "date": "2026-05-01",
    "title": "자율휴업일",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-04-45",
    "date": "2026-05-04",
    "title": "자율휴업일",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-05-46",
    "date": "2026-05-05",
    "title": "어린이날",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-05-05-47",
    "date": "2026-05-05",
    "title": "입하",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-07-48",
    "date": "2026-05-07",
    "title": "STE",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-07-49",
    "date": "2026-05-07",
    "title": "a",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-07-50",
    "date": "2026-05-07",
    "title": "M과학한마당 (1~3학년)",
    "targetGrades": [
      3
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-08-51",
    "date": "2026-05-08",
    "title": "어버이날",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-05-08-52",
    "date": "2026-05-08",
    "title": "STE",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-08-53",
    "date": "2026-05-08",
    "title": "a",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-08-54",
    "date": "2026-05-08",
    "title": "M과학한마당 (4~6학년)",
    "targetGrades": [
      6
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-11-55",
    "date": "2026-05-11",
    "title": "동아리활동③",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-12-56",
    "date": "2026-05-12",
    "title": "현장체험학습(3학년)",
    "targetGrades": [
      3
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-05-14-57",
    "date": "2026-05-14",
    "title": "현장체험학습(6학년)",
    "targetGrades": [
      6
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-05-15-58",
    "date": "2026-05-15",
    "title": "스승의날",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-05-16-59",
    "date": "2026-05-16",
    "title": "가족감사걷기대회 (전학년)",
    "targetGrades": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-05-18-60",
    "date": "2026-05-18",
    "title": "우애남매활동④",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-21-61",
    "date": "2026-05-21",
    "title": "소만",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-21-62",
    "date": "2026-05-21",
    "title": "학부모연수①",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-05-24-63",
    "date": "2026-05-24",
    "title": "부처님오신날",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-05-25-64",
    "date": "2026-05-25",
    "title": "대체 휴일",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-06-01-65",
    "date": "2026-06-01",
    "title": "동아리활동④",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-03-66",
    "date": "2026-06-03",
    "title": "2026 지방선거",
    "targetGrades": [],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-06-06-67",
    "date": "2026-06-06",
    "title": "현충일",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-06-68",
    "date": "2026-06-06",
    "title": "망종",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-08-69",
    "date": "2026-06-08",
    "title": "우애남매활동⑤",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-08-70",
    "date": "2026-06-08",
    "title": "수업장학(8~26)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-09-71",
    "date": "2026-06-09",
    "title": "교과전담, 보건, 방과후학교 영어공개수업 (1, 2, 5, 6학년)",
    "targetGrades": [
      6
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-10-72",
    "date": "2026-06-10",
    "title": "교과전담, 보건, 방과후학교 영어공개수업 (3, 4학년)",
    "targetGrades": [
      4
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-10-73",
    "date": "2026-06-10",
    "title": "입학 백일 축하식(1학년)",
    "targetGrades": [
      1
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-06-11-74",
    "date": "2026-06-11",
    "title": "현장체험학습(5학년)",
    "targetGrades": [
      5
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-06-15-75",
    "date": "2026-06-15",
    "title": "동아리활동⑤",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-17-76",
    "date": "2026-06-17",
    "title": "수영교실(3학년)",
    "targetGrades": [
      3
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-19-77",
    "date": "2026-06-19",
    "title": "단오",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-21-78",
    "date": "2026-06-21",
    "title": "하지",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-22-79",
    "date": "2026-06-22",
    "title": "우애남매활동⑥",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-24-80",
    "date": "2026-06-24",
    "title": "수영교실(3학년)",
    "targetGrades": [
      3
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-29-81",
    "date": "2026-06-29",
    "title": "입학백일기념 가족한마당 (1학년)",
    "targetGrades": [
      1
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-06-29-82",
    "date": "2026-06-29",
    "title": "방과후수업 발표 및 수업 공개",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-02-83",
    "date": "2026-07-02",
    "title": "방과후수업 발표 및 수업 공개",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-04-84",
    "date": "2026-07-04",
    "title": "아빠줌독서모임 (1학기 종강)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-06-85",
    "date": "2026-07-06",
    "title": "학력평가(1~2학년)",
    "targetGrades": [
      2
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-07-06-86",
    "date": "2026-07-06",
    "title": "방과후수업 발표 및 수업 공개",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-07-87",
    "date": "2026-07-07",
    "title": "소서",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-07-88",
    "date": "2026-07-07",
    "title": "진로체험(2학년)",
    "targetGrades": [
      2
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-07-07-89",
    "date": "2026-07-07",
    "title": "학력평가(3~6학년)",
    "targetGrades": [
      6
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-07-08-90",
    "date": "2026-07-08",
    "title": "진로체험(4학년)",
    "targetGrades": [
      4
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-07-09-91",
    "date": "2026-07-09",
    "title": "2학기 학급임원선거",
    "targetGrades": [],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-07-09-92",
    "date": "2026-07-09",
    "title": "2학기 전교임원 후보 선출",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-10-93",
    "date": "2026-07-10",
    "title": "방과후수업 종강",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-11-94",
    "date": "2026-07-11",
    "title": "토요방과후수업 종강",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-13-95",
    "date": "2026-07-13",
    "title": "수학경시대회(3~6학년)",
    "targetGrades": [
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-07-14-96",
    "date": "2026-07-14",
    "title": "문화체험(1학년)",
    "targetGrades": [
      1
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-07-15-97",
    "date": "2026-07-15",
    "title": "초복",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-16-98",
    "date": "2026-07-16",
    "title": "2학기 전교임원선거",
    "targetGrades": [],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-07-16-99",
    "date": "2026-07-16",
    "title": "진로체험(3학년)",
    "targetGrades": [
      3
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-07-17-100",
    "date": "2026-07-17",
    "title": "제헌절",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-07-20-101",
    "date": "2026-07-20",
    "title": "동아리활동⑥",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-22-102",
    "date": "2026-07-22",
    "title": "문화체험(6학년)",
    "targetGrades": [
      6
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-07-23-103",
    "date": "2026-07-23",
    "title": "대서",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-24-104",
    "date": "2026-07-24",
    "title": "여름방학식(급식 있음) (1~3학년: 12시 10분 하교) (4~6학년: 1시 하교)",
    "targetGrades": [
      3,
      6
    ],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-07-25-105",
    "date": "2026-07-25",
    "title": "중복",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-07-29-106",
    "date": "2026-07-29",
    "title": "방학캠프",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-08-05-107",
    "date": "2026-08-05",
    "title": "방학캠프",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-08-07-108",
    "date": "2026-08-07",
    "title": "입추",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-14-109",
    "date": "2026-08-14",
    "title": "말복",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-15-110",
    "date": "2026-08-15",
    "title": "광복절",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-08-17-111",
    "date": "2026-08-17",
    "title": "대체 휴일",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-08-20-112",
    "date": "2026-08-20",
    "title": "합창·오케스트라 캠프",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-23-113",
    "date": "2026-08-23",
    "title": "처서",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-24-114",
    "date": "2026-08-24",
    "title": "cau",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-24-115",
    "date": "2026-08-24",
    "title": "음악콩쿠르(전학년,",
    "targetGrades": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-25-116",
    "date": "2026-08-25",
    "title": "10시~)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-25-117",
    "date": "2026-08-25",
    "title": "개학식(급식 있음) (1~3학년: 12시 10분 하교) (4~6학년: 1시 하교)",
    "targetGrades": [
      3,
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-08-29-118",
    "date": "2026-08-29",
    "title": "토요방과후수업 개강",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-29-119",
    "date": "2026-08-29",
    "title": "임원수련회",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-30-120",
    "date": "2026-08-30",
    "title": "아빠줌독서모임(OT)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-31-121",
    "date": "2026-08-31",
    "title": "방과후수업 개강",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-08-31-122",
    "date": "2026-08-31",
    "title": "진로모색탐구대회(6학년)",
    "targetGrades": [
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-08-31-123",
    "date": "2026-08-31",
    "title": "아빠줌독서모임(2학기 개강)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-09-01-124",
    "date": "2026-09-01",
    "title": "영어말하기대회 학년예선 (3, 5학년)",
    "targetGrades": [
      5
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-09-02-125",
    "date": "2026-09-02",
    "title": "영어말하기대회 학년예선 (4, 6학년)",
    "targetGrades": [
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-09-03-126",
    "date": "2026-09-03",
    "title": "소규모테마형교육여행 예정(4학년)",
    "targetGrades": [
      4
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-09-07-127",
    "date": "2026-09-07",
    "title": "백로",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-09-07-128",
    "date": "2026-09-07",
    "title": "동아리활동⑦",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-09-07-129",
    "date": "2026-09-07",
    "title": "진로체험(1학년)",
    "targetGrades": [
      1
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-09-14-130",
    "date": "2026-09-14",
    "title": "우애남매활동⑦",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-09-18-131",
    "date": "2026-09-18",
    "title": "영어말하기대회 본선 (4, 6학년)",
    "targetGrades": [
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-09-21-132",
    "date": "2026-09-21",
    "title": "영어말하기대회 본선 (3, 5학년)",
    "targetGrades": [
      5
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-09-21-133",
    "date": "2026-09-21",
    "title": "소규모테마형교육여행 예정(6학년)",
    "targetGrades": [
      6
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-09-23-134",
    "date": "2026-09-23",
    "title": "추분",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-09-23-135",
    "date": "2026-09-23",
    "title": "자율휴업일(6학년) 예정",
    "targetGrades": [
      6
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-09-25-136",
    "date": "2026-09-25",
    "title": "8.15 추석",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-09-28-137",
    "date": "2026-09-28",
    "title": "자율휴업일",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-10-03-138",
    "date": "2026-10-03",
    "title": "개천절",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-10-05-139",
    "date": "2026-10-05",
    "title": "대체휴일",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-10-06-140",
    "date": "2026-10-06",
    "title": "Spelling Bee 예선(지필)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-10-07-141",
    "date": "2026-10-07",
    "title": "운동회(전학년)",
    "targetGrades": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-10-08-142",
    "date": "2026-10-08",
    "title": "한로",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-10-08-143",
    "date": "2026-10-08",
    "title": "운동회(전학년, 예비일)",
    "targetGrades": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-10-09-144",
    "date": "2026-10-09",
    "title": "한글날",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-10-12-145",
    "date": "2026-10-12",
    "title": "바른글씨쓰기대회(전학년)",
    "targetGrades": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-10-13-146",
    "date": "2026-10-13",
    "title": "Spelling Bee(1, 3, 5학년)",
    "targetGrades": [
      5
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-10-14-147",
    "date": "2026-10-14",
    "title": "Spelling Bee(2, 4, 6학년)",
    "targetGrades": [
      6
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-10-15-148",
    "date": "2026-10-15",
    "title": "학부모연수②",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-10-16-149",
    "date": "2026-10-16",
    "title": "소변검사(2, 3, 5, 6학년)",
    "targetGrades": [
      6
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-10-17-150",
    "date": "2026-10-17",
    "title": "개교기념일",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-10-19-151",
    "date": "2026-10-19",
    "title": "우애남매활동⑧",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-10-20-152",
    "date": "2026-10-20",
    "title": "현장체험학습(4학년)",
    "targetGrades": [
      4
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-10-23-153",
    "date": "2026-10-23",
    "title": "상강",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-10-26-154",
    "date": "2026-10-26",
    "title": "학력평가(1~6학년)",
    "targetGrades": [
      1,
      2,
      3,
      4,
      5,
      6
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-10-27-155",
    "date": "2026-10-27",
    "title": "현장체험학습(5학년) - 역사체험",
    "targetGrades": [
      5
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-10-28-156",
    "date": "2026-10-28",
    "title": "현장체험학습(3학년)",
    "targetGrades": [
      3
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-10-30-157",
    "date": "2026-10-30",
    "title": "현장체험학습(1학년)",
    "targetGrades": [
      1
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-11-02-158",
    "date": "2026-11-02",
    "title": "동아리활동⑧(졸업앨범촬영)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-02-159",
    "date": "2026-11-02",
    "title": "현장체험학습(2학년)",
    "targetGrades": [
      2
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-11-05-160",
    "date": "2026-11-05",
    "title": "수영교실(4학년)",
    "targetGrades": [
      4
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-06-161",
    "date": "2026-11-06",
    "title": "신입생 원서 접수",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-07-162",
    "date": "2026-11-07",
    "title": "입동",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-09-163",
    "date": "2026-11-09",
    "title": "우애남매활동⑨",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-10-164",
    "date": "2026-11-10",
    "title": "신입생 원서 접수",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-11-165",
    "date": "2026-11-11",
    "title": "수영교실(4학년)",
    "targetGrades": [
      4
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-16-166",
    "date": "2026-11-16",
    "title": "동아리활동⑨",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-16-167",
    "date": "2026-11-16",
    "title": "신입생 추첨일",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-22-168",
    "date": "2026-11-22",
    "title": "소설",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-23-169",
    "date": "2026-11-23",
    "title": "생활문쓰기대회(3~6학년)",
    "targetGrades": [
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-11-24-170",
    "date": "2026-11-24",
    "title": "신입생 등록일",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-25-171",
    "date": "2026-11-25",
    "title": "감사전시회, Writing전시회",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-30-172",
    "date": "2026-11-30",
    "title": "동아리활동⑩",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-30-173",
    "date": "2026-11-30",
    "title": "방과후수업 발표 및 수업공개",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-11-30-174",
    "date": "2026-11-30",
    "title": "감사전시회, Writing전시회",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-02-175",
    "date": "2026-12-02",
    "title": "방과후수업 발표 및 수업공개",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-02-176",
    "date": "2026-12-02",
    "title": "감사전시회, Writing전시회",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-04-177",
    "date": "2026-12-04",
    "title": "영어신문 발행",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-05-178",
    "date": "2026-12-05",
    "title": "아빠줌독서모임 (2학기 종강)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-06-179",
    "date": "2026-12-06",
    "title": "온라인영어도서관",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-06-180",
    "date": "2026-12-06",
    "title": "독서인증 마감",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-07-181",
    "date": "2026-12-07",
    "title": "대설",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-07-182",
    "date": "2026-12-07",
    "title": "학력평가(1~2학년)",
    "targetGrades": [
      2
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-12-08-183",
    "date": "2026-12-08",
    "title": "학력평가(3~6학년)",
    "targetGrades": [
      6
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2026-12-09-184",
    "date": "2026-12-09",
    "title": "문화체험(2학년)",
    "targetGrades": [
      2
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-12-09-185",
    "date": "2026-12-09",
    "title": "우리가족걷기챌린지 인증 자료 제출 기간",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-11-186",
    "date": "2026-12-11",
    "title": "방과후수업 종강 정기연주회 (예정)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-14-187",
    "date": "2026-12-14",
    "title": "수학경시대회(3~6학년)",
    "targetGrades": [
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-12-14-188",
    "date": "2026-12-14",
    "title": "합창·오케스트라·방송 신입",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-14-189",
    "date": "2026-12-14",
    "title": "단원 선발",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-15-190",
    "date": "2026-12-15",
    "title": "학급음악발표회(1학년)",
    "targetGrades": [
      1
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-12-16-191",
    "date": "2026-12-16",
    "title": "문화체험",
    "targetGrades": [],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-12-16-192",
    "date": "2026-12-16",
    "title": "a (3-2,3반)",
    "targetGrades": [
      3
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-16-193",
    "date": "2026-12-16",
    "title": "진로체험(5학년)",
    "targetGrades": [
      5
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-12-17-194",
    "date": "2026-12-17",
    "title": "문화체험B(3-1,4,5반)",
    "targetGrades": [
      3
    ],
    "category": "체험학습"
  },
  {
    "id": "jungdae-2026-12-18-195",
    "date": "2026-12-18",
    "title": "학급음악발표회(2학년)",
    "targetGrades": [
      2
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2026-12-19-196",
    "date": "2026-12-19",
    "title": "토요방과후수업",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-19-197",
    "date": "2026-12-19",
    "title": "종강 및 수업공개",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-21-198",
    "date": "2026-12-21",
    "title": "2027학년도 전·편입생",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-21-199",
    "date": "2026-12-21",
    "title": "모집 공고",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-21-200",
    "date": "2026-12-21",
    "title": "2027학년도 교육과정협의회 (1차)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-22-201",
    "date": "2026-12-22",
    "title": "동지",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2026-12-22-202",
    "date": "2026-12-22",
    "title": "겨울방학식(급식 있음) (1~3학년: 12시 10분 하교) (4~6학년: 1시 하교)",
    "targetGrades": [
      3,
      6
    ],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-12-25-203",
    "date": "2026-12-25",
    "title": "성탄절",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2026-12-28-204",
    "date": "2026-12-28",
    "title": "2027학년도 교육과정 협의회 (2차)",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-01-01-205",
    "date": "2027-01-01",
    "title": "신정",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-01-04-206",
    "date": "2027-01-04",
    "title": "소한",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-01-06-207",
    "date": "2027-01-06",
    "title": "방학캠프",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2027-01-13-208",
    "date": "2027-01-13",
    "title": "방학캠프",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2027-01-20-209",
    "date": "2027-01-20",
    "title": "대한",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-01-21-210",
    "date": "2027-01-21",
    "title": "2027학년도 전·편입생 원서접수",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-01-22-211",
    "date": "2027-01-22",
    "title": "2027학년도 신입생",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-01-22-212",
    "date": "2027-01-22",
    "title": "학부모 오리엔테이션",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-01-25-213",
    "date": "2027-01-25",
    "title": "개학식(급식 있음) (1~3학년: 12시 10분 하교) (4~6학년: 1시 하교)",
    "targetGrades": [
      3,
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2027-01-26-214",
    "date": "2027-01-26",
    "title": "영어능력인증평가(1~5학년)",
    "targetGrades": [
      5
    ],
    "category": "학사평가/선거"
  },
  {
    "id": "jungdae-2027-01-29-215",
    "date": "2027-01-29",
    "title": "한자경시대회(1~5학년)",
    "targetGrades": [
      5
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2027-02-01-216",
    "date": "2027-02-01",
    "title": "우애남매활동⑩",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-02-02-217",
    "date": "2027-02-02",
    "title": "2027학년도 전·편입",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-02-02-218",
    "date": "2027-02-02",
    "title": "대기자 추첨",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-02-04-219",
    "date": "2027-02-04",
    "title": "입춘",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-02-07-220",
    "date": "2027-02-07",
    "title": "1.1 설날",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2027-02-09-221",
    "date": "2027-02-09",
    "title": "대체휴일",
    "targetGrades": [],
    "category": "휴업/기념일"
  },
  {
    "id": "jungdae-2027-02-11-222",
    "date": "2027-02-11",
    "title": "졸업식(6학년, 11시)",
    "targetGrades": [
      6
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2027-02-11-223",
    "date": "2027-02-11",
    "title": "자율휴업일(1~5학년)",
    "targetGrades": [
      5
    ],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-02-12-224",
    "date": "2027-02-12",
    "title": "종업식(급식있음) (1~3학년: 12시 10분 하교) (4~5학년: 1시 하교)",
    "targetGrades": [
      3,
      5
    ],
    "category": "학교행사"
  },
  {
    "id": "jungdae-2027-02-16-225",
    "date": "2027-02-16",
    "title": "신학년 집중 기간",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-02-17-226",
    "date": "2027-02-17",
    "title": "합창·오케스트라 캠프",
    "targetGrades": [],
    "category": "일반학사"
  },
  {
    "id": "jungdae-2027-02-19-227",
    "date": "2027-02-19",
    "title": "우수",
    "targetGrades": [],
    "category": "일반학사"
  }
];
