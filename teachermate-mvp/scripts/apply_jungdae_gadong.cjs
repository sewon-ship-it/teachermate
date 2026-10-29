const fs = require('fs');
const path = require('path');

const cleanEvents = JSON.parse(fs.readFileSync('docs/jungdae_events_clean.json', 'utf8'));

// 199개 중대부초 행사 텍스트 포맷 (SAMPLE_CAL용)
const sampleCalLines = ['2026학년도 중앙대학교사범대학부속초등학교 학사력'];
cleanEvents.forEach(e => {
  const [y, m, d] = e.date.split('-');
  sampleCalLines.push(`${+m}.${+d}. ${e.title}`);
});
const sampleCalText = sampleCalLines.join('\n');

console.log('Sample cal lines count:', sampleCalLines.length);

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Title 및 Header 수정
  content = content.replace(/<title>TeacherMate.*?<\/title>/, '<title>TeacherMate — 중대부초 2026 업무 길잡이</title>');
  content = content.replace(/<span class="brand">TeacherMate[\s\S]*?<\/span>/, '<span class="brand">TeacherMate <small>중대부초 업무 길잡이</small></span>');
  content = content.replace(/<b>새솔초 업무분장<\/b>/g, '<b>중대부초 업무분장</b>');
  content = content.replace(/시연용 가상 학교입니다\./, '중앙대학교사범대학부속초등학교(중대부초) 2026학년도 실제 학사력과 업무분장 기준입니다.');
  content = content.replace(/2026학년도 새솔초등학교 학사력\(예시\)[\s\S]*?2027\.2\.12\.\(금\) 종업식/, sampleCalText.replace(/\$/g, '$$$$'));
  content = content.replace(/name:"새솔초 2026 학사력\(예시\)"/, 'name:"중대부초 2026 학사력"');

  // 2. 가동초 스타일 CSS 추가
  const styleMarker = '/* ── v3: 업무분장 메가 메뉴 ── */';
  const newStyles = `/* ── 가동초 스타일 4단계 문서/일정 분류 태그 ── */
.tag-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap}
.tag-event{background:#e0f2fe;color:#0284c7;border:1px solid #bae6fd}   /* 📅 학교 행사 (파랑) */
.tag-draft{background:#fef3c7;color:#b45309;border:1px solid #fde68a}   /* ✍️ 기안 문서 (주황) */
.tag-receive{background:#dcfce7;color:#15803d;border:1px solid #bbf7d0} /* 📥 접수 공문 (초록) */
.tag-todo{background:#f3e8ff;color:#7e22ce;border:1px solid #e9d5ff}    /* ⏳ 예정 업무 (보라) */

/* ── 가동초 스타일 필터 바 & 뷰 전환기 ── */
.gadong-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:10px 0 14px;padding:8px 12px;background:var(--paper);border:1px solid var(--rule);border-radius:10px}
.gadong-filters{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
.gfilter-btn{border:1px solid var(--rule);background:var(--sheet);color:var(--ink-2);padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:all .15s ease}
.gfilter-btn:hover{background:var(--paper);color:var(--ink)}
.gfilter-btn.active{background:var(--ink);color:var(--sheet);border-color:var(--ink)}
.view-switch{display:flex;gap:2px;background:var(--rule);padding:2px;border-radius:8px;margin-left:auto}
.view-btn{border:0;background:none;padding:5px 11px;font-size:12px;font-weight:600;color:var(--ink-2);border-radius:6px;cursor:pointer}
.view-btn.active{background:var(--sheet);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,0.1)}

/* ── 사기 진작: 3월 질문 방어 지수 & 현실 생존 꿀팁 & 1초 복붙 패키지 ── */
.defense-shield{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;background:#ecfdf5;color:#047857;font-size:12.5px;font-weight:700;border:1px solid #a7f3d0;margin-bottom:10px}
.survival-tip{background:#fffbeb;border:1.5px solid #f59e0b;border-radius:8px;padding:12px 14px;margin:12px 0;font-size:13.5px;line-height:1.5;color:#92400e}
.survival-tip b{color:#b45309;display:block;margin-bottom:4px}
.copy-package{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}
.copy-btn{display:inline-flex;align-items:center;gap:6px;background:var(--paper);border:1px solid var(--rule);border-radius:6px;padding:6px 12px;font-size:12.5px;font-weight:600;cursor:pointer;color:var(--ink)}
.copy-btn:hover{background:var(--sheet);border-color:var(--ink)}

/* ── 체크리스트 집중 뷰 ── */
.chk-view{display:flex;flex-direction:column;gap:8px}
.chk-card{background:var(--sheet);border:1px solid var(--rule);border-radius:10px;padding:12px 14px;display:flex;align-items:flex-start;gap:12px}
.chk-card.done{background:var(--paper);opacity:.75}
.chk-card input[type=checkbox]{width:18px;height:18px;margin-top:2px;accent-color:var(--ink);cursor:pointer}
.chk-body{flex:1}
.chk-head{display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.chk-head b{font-size:14.5px;cursor:pointer}
.chk-head b:hover{text-decoration:underline}
.chk-sub{font-size:12.5px;color:var(--ink-2);margin-top:4px}

/* ── v3: 업무분장 메가 메뉴 ── */`;

  if (!content.includes('tag-badge')) {
    content = content.replace(styleMarker, newStyles);
  }

  // 3. 중대부초 맞춤형 기본 업무 데이터셋 (BASE)
  const jungdaeBase = `const BASE=[
 ["2026-03-03","hr5","시업식·입학식 학급 담임 운영 준비",["시업식 11:30 하교 지도","신입생 기초조사서 수합","학급 규칙 수립"],"첫날 출결 및 하교 지도가 최우선입니다. 하교 버스 탑승 대상 학생 명단을 반드시 사전 점검하세요.","2026 중대부초 학사력","NAS2026 > 5학년 > 학기준비","ok","todo"],
 ["2026-03-04","thanks","학교폭력예방교육 실시 및 결과 보고",["학부모 대상 연수자료 배부","학생 서약서 수합","결과보고 내부결재"],"신학기 학폭예방 서약서는 전교생 100% 수합 필수(미제출자 추적 확인).","생활안전부 연간계획","NAS2026 > 생활안전부 > 학교폭력","ok","draft"],
 ["2026-03-05","hr5","학급임원선거 및 전교임원 후보 추천",["선거 규정 안내","학급 투표 실시","당선자 명단 교무기획부 제출"],"학급 임원 명단은 선거 당일 16:00까지 교무기획부에 제출해야 다음 날 전교선거 일정에 차질이 없습니다.","학사력 2026","NAS2026 > 5학년 > 임원선거","ok","todo"],
 ["2026-03-06","neis","나이스 학년도 초기 설정 확인 및 교원 권한 부여 기안",["학급·교과 편성 확인","교원 권한 부여 점검","업무분장 반영 내부결재"],"학년도 시작 첫 주에 권한이 안 풀리면 담임들이 출결을 못 넣습니다. 교무기획부와 즉시 확인하세요.","2026 업무분장","NAS2026 > 과학정보부 > 나이스","ok","draft"],
 ["2026-03-10","hr5","기초학력 진단평가 실시 및 결과 처리",["평가지 배부 및 시험 감독","채점 및 진단결과표 작성","학습지원 대상자 선별 협의"],"진단평가 결과는 학부모 상담 기초자료로 활용되므로 통계표를 정확히 작성해 두세요.","학사력 2026","NAS2026 > 5학년 > 기초학력","ok","todo"],
 ["2026-03-11","thanks","동아리 및 우애남매 조직 협조 공문 접수",["동아리 희망원 수합","우애남매 1~6학년 매칭표 확인"],"중대부초 전통 우애남매 조직 시 전입생 및 결손 학급이 없도록 꼼꼼히 대조합니다.","교육과정 운영 계획","NAS2026 > 생활안전부 > 우애남매","ok","receive"],
 ["2026-03-19","hr5","학부모 수업공개 및 학급 설명회 운영 기안",["수업 지도안 작성","학급 교육과정 안내 자료 인쇄","참석자 등록부 비치"],"수업 지도안은 1주일 전 교감선생님 사전 검토 완료 권장.","학사력 2026","NAS2026 > 5학년 > 수업공개","ok","draft"],
 ["2026-03-27","sci","상반기 과학실험실 폐수·폐시약 및 액침표본 보관 현황 제출",["보관 현황 실사","공문 제출(과학실무사 지정)"],"교육지원청 지정 기한 엄수. 폐수통 밀폐 상태 필수 확인.","과학실 안전 매뉴얼","NAS2026 > 과학정보부 > 과학실","ok","receive"],
 ["2026-04-10","hr5","1학기 현장체험학습 계획 수립 및 품의",["사전 답사 안전 점검표 작성","버스 2곳 견적서 비교 첨부","지출품의 상신"],"품의·계약까지 최소 4주 소요되므로 출발 6주 전 업체 견적 필수(5학년 인수인계 요령).","체험학습 운영 매뉴얼","NAS2026 > 5학년 > 체험학습","ok","draft"],
 ["2026-04-21","sci","과학의 달 기념 교내 행사 계획 및 키트 품의",["학년별 실험 키트 품의","교내 발명·과학 행사 운영"],"키트는 3월 2주차에 미리 품의 안 올리면 전국 품절 대란 발생!","학교교육계획서","NAS2026 > 과학정보부 > 과학행사","ok","draft"],
 ["2026-04-29","pub","학교정보공시 1차 항목 자료 수합 및 입력 기안",["공시 항목별 담당 부서 제출 확인","입력 검증 및 총괄 기안"],"마감 3일 전 미제출 부서에 1차 리마인드 메신저 발송.","정보공시 지침","NAS2026 > 과학정보부 > 정보공시","ok","draft"],
 ["2026-05-08","thanks","우애남매활동① 및 감사 편지 쓰기 운영",["우애남매 선물/편지 교환 지도","활동 사진 촬영(편집출판 실무사 공유)"],"어버이날·스승의 날 행사와 연계하여 진행하면 학급 부담이 적습니다.","감사교육 계획서","NAS2026 > 생활안전부 > 감사교육","ok","todo"],
 ["2026-07-10","neis","1학기 학교생활기록부 마감 점검 안내",["출결 및 교과평가 입력 조회","학년부장 교차 점검 요청"],"마감 1주 전 전체 안내, 3일 전 미입력 학급에만 재안내.","학업성적관리규정","NAS2026 > 교무기획부 > 생기부","ok","draft"],
 ["2026-10-23","hr5","2학기 학부모 상담 주간 결과 정리",["상담 기록 학교 내부 보관","특별 지도 학생 학년부장 공유"],"상담 기록은 외부 유출되지 않도록 교무실 전산망에만 보관합니다.","학사력 2026","NAS2026 > 5학년 > 상담","ok","todo"],
 ["2026-12-18","neis","학년말 학교생활기록부 마감 점검",["교과 세특 입력 확인","행동특성 입력 확인","학년부장 교차 점검"],"마감 3일 전 나이스 미마감 학급 집중 모니터링.","학업성적관리규정","NAS2026 > 과학정보부 > 나이스","ok","draft"]
];`;

  content = content.replace(/const BASE=\[[\s\S]*?\];\s*const BASE_CARDS/, jungdaeBase + '\nconst BASE_CARDS');

  // 4. 인수인계 카드 (BASE_CARDS) - 현실 생존 꿀팁 & 1초 복붙 패키지 연결
  const jungdaeCards = `const BASE_CARDS=[
 {duty:"hr5",title:"5학년 담임 연간 생존 요령",tips:"현장체험학습 버스는 견적을 6주 전에 받아야 품의·계약이 안 밀린다.\\n가정통신문은 3주 전에 나가야 회신서 수합이 여유 있다.\\n⚠️ 학기초 우애남매 명단과 버스 노선표는 책상 유리 밑에 끼워둘 것.",path:"NAS2026 > 5학년",draftTemplate:"[기안문 서식: 2026학년도 5학년 1학기 현장체험학습 계획(안)]\\n1. 관련: 2026학년도 학교교육과정 운영 계획\\n2. 5학년 학생들의 협동심 함양 및 생태 탐구를 위하여 아래와 같이 체험학습을 실시하고자 합니다.\\n  가. 일시: 2026. 5. 15.(금) 09:00~15:30\\n  나. 장소: 서울대공원 산림욕장\\n  다. 대상: 5학년 학생 전체(120명) 및 인솔교사(6명)\\n  라. 소요예산: 금 2,400,000원(학교회계 지원금)",parentTemplate:"[가정통신문 서식]\\n학부모님 안녕하십니까.\\n봄기운이 완연한 계절을 맞이하여 본교 5학년 학생들이 자연 속에서 생태를 탐구하고 협동심을 기를 수 있도록 아래와 같이 현장체험학습을 실시합니다.\\n- 일시: 2026년 5월 15일(금)\\n- 장소: 서울대공원\\n* 회신서를 4월 24일(금)까지 담임교사에게 보내주시기 바랍니다.",excelTemplate:"연번,학번,이름,비상연락처(보호자),멀미여부,알레르기,비고"},
 {duty:"neis",title:"나이스 관리 실무 생존 요령",tips:"학년도 초 권한 부여는 개학 첫 주 안에 완료할 것(담임 출결 직결).\\n성적·생기부 마감 안내는 1주 전 전체 안내, 3일 전 미입력자에게만 개별 메신저.\\n⚠️ 4세대 나이스 오류 시 교육청 콜센터보다 지원센터 공지사항부터 확인할 것.",path:"NAS2026 > 과학정보부 > 나이스",draftTemplate:"[기안문 서식: 2026학년도 나이스(NEIS) 교원 업무분장 권한 부여 계획]\\n1. 관련: 교육부 교육정보시스템 운영지침 제8조\\n2. 2026학년도 신학기 학사 업무의 원활한 수행을 위하여 담당 교원별 나이스 접근 권한을 붙임과 같이 부여하고자 합니다.\\n  가. 대상: 본교 전 교직원(52명)\\n  나. 권한부여 기준: 2026학년도 학교 업무분장표 기준\\n  다. 권한보유 기간: 2026. 3. 1. ~ 2027. 2. 28.",parentTemplate:"",excelTemplate:"교원ID,성명,부서,담당업무,부여권한그룹,승인상태"},
 {duty:"thanks",title:"감사교육 및 우애남매 운영 요령",tips:"우애남매 1~6학년 매칭표는 3월 2주차에 교육과정부와 공유.\\n감사 에세이 마감은 1주 전, 3일 전 두 번 안내한다.\\n⚠️ 사진 및 홍보물 제작 지원은 편집출판 실무사에게 최소 3일 전 사전 요청할 것.",path:"NAS2026 > 생활안전부 > 감사교육",draftTemplate:"[기안문 서식: 2026학년도 감사 나눔 에세이 공모전 운영 계획]\\n1. 관련: 2026 인성안전교육 기본 계획\\n2. 학생들의 바른 인성 함양과 감사하는 학교 문화 조성을 위하여 감사 나눔 에세이 공모전을 추진하고자 합니다.\\n  가. 대상: 전교생(1~6학년)\\n  나. 기간: 2026. 10. 12.(월) ~ 10. 30.(금)\\n  다. 시상: 학년별 최우수 1명, 우수 2명, 장려 3명",parentTemplate:"[가정통신문 서식]\\n가정에 평안과 행복이 가득하기를 기원합니다.\\n본교에서는 학생들이 주변에 감사하는 마음을 표현하고 글쓰기 역량을 기를 수 있도록 '감사 나눔 에세이 공모전'을 개최합니다.",excelTemplate:"학년,반,번호,성명,작품제목,제출일자,심사점수,비고"}
];`;

  content = content.replace(/const BASE_CARDS=\[[\s\S]*?\];\s*\/\* ===================== 상태/, jungdaeCards + '\n/* ===================== 상태');

  // 5. seed 함수에서 type 기본값 추가
  content = content.replace(
    /const tasks=BASE\.map\(\(\[date,duty,title,checks,tip,source,path,status\]\)=>/,
    'const tasks=BASE.map(([date,duty,title,checks,tip,source,path,status,type])=>'
  );
  content = content.replace(
    /status,origin:"sample",why:"",undone:false,sub:"",history:\[\]\}\);/,
    'status,type:type||"todo",origin:"sample",why:"",undone:false,sub:"",history:[]});'
  );

  // 6. 상태에 viewMode, typeFilter 추가
  content = content.replace(
    /apiKey:localStorage\.getItem\("tm_api_key"\)\|\|"",/,
    `apiKey:localStorage.getItem("tm_api_key")||"",
    viewMode: "timeline",
    typeFilter: "all",`
  );

  // 7. 가동초 태그 헬퍼 함수 추가
  const tagHelper = `
function taskTypeTag(t){
  const tp = t.type || (t.source && t.source.includes("학사력") ? "event" : (t.title && t.title.includes("기안") ? "draft" : (t.title && t.title.includes("공문") ? "receive" : "todo")));
  if(tp==="event") return '<span class="tag-badge tag-event">📅 학교 행사</span>';
  if(tp==="draft") return '<span class="tag-badge tag-draft">✍️ 기안 문서</span>';
  if(tp==="receive") return '<span class="tag-badge tag-receive">📥 접수 공문</span>';
  return '<span class="tag-badge tag-todo">⏳ 예정 업무</span>';
}
`;
  if (!content.includes('function taskTypeTag')) {
    content = content.replace('const badgeHTML=t=>{', tagHelper + '\nconst badgeHTML=t=>{');
  }

  // 8. renderHome 함수 전면 개편 (가동초 스타일 필터 바, 달력/체크리스트 뷰 스위치)
  const homeReplacement = `function renderHome(){
  renderNow();
  if(!S.viewMode) S.viewMode="timeline";
  if(!S.typeFilter) S.typeFilter="all";

  const v=visible(), refM=ref.getMonth()+1;
  if(selMonth===null) selMonth=MONTHS.includes(refM)?refM:3;
  const box=document.getElementById("months");box.innerHTML="";
  MONTHS.forEach(m=>{
    const ts=v.filter(t=>parse(t.date).getMonth()+1===m);
    const b=document.createElement("button");b.setAttribute("role","tab");b.setAttribute("aria-selected",m===selMonth);
    if(m===refM)b.classList.add("now");
    b.innerHTML='<span class="m">'+m+'월</span><span class="dots">'+[...new Set(ts.map(t=>t.duty))].slice(0,5).map(d=>'<i style="--cat:'+dcolor(d)+'"></i>').join("")+'</span><span class="n">'+ts.length+'건</span>'+(S.calendar&&S.showEvents!==false?'<span class="n">행사 '+S.calendar.events.filter(e=>parse(e.date).getMonth()+1===m).length+'</span>':'');
    b.onclick=()=>{selMonth=m;renderHome()};box.appendChild(b);
  });

  let ts=v.filter(t=>parse(t.date).getMonth()+1===selMonth);
  let evs=(S.calendar&&S.showEvents!==false)?S.calendar.events.filter(e=>parse(e.date).getMonth()+1===selMonth):[];

  // 가동초 스타일 필터 적용
  if(S.typeFilter==="event") { ts=[]; }
  else if(S.typeFilter==="draft") { evs=[]; ts=ts.filter(t=>t.type==="draft"||t.title.includes("기안")); }
  else if(S.typeFilter==="receive") { evs=[]; ts=ts.filter(t=>t.type==="receive"||t.title.includes("공문")||t.title.includes("접수")); }
  else if(S.typeFilter==="todo") { evs=[]; ts=ts.filter(t=>t.type==="todo"||(!t.title.includes("기안")&&!t.title.includes("공문"))); }

  let h='<div class="month-head"><div><h2 style="margin:0 0 4px">'+selMonth+'월</h2><p style="margin:0">'+(S.duty==="all"?"내 업무 전체":esc(dname(S.duty)))+' · 업무 '+ts.length+'건, 행사 '+evs.length+'건</p></div>'+
    '<div class="view-switch">'+
      '<button class="view-btn'+(S.viewMode==="timeline"?" active":"")+'" id="vmTimeline">🗓️ 월별 달력</button>'+
      '<button class="view-btn'+(S.viewMode==="checklist"?" active":"")+'" id="vmChecklist">✅ 이번 달 할 일 ('+ts.filter(t=>!isDone(t)).length+')</button>'+
    '</div></div>';

  // 가동초 스타일 4단계 태그 필터 바
  h+='<div class="gadong-bar">'+
    '<span class="muted" style="font-weight:700;font-size:12px;margin-right:4px">분류 필터:</span>'+
    '<div class="gadong-filters">'+
      '<button class="gfilter-btn'+(S.typeFilter==="all"?" active":"")+'" data-tf="all">전체보기</button>'+
      '<button class="gfilter-btn'+(S.typeFilter==="event"?" active":"")+'" data-tf="event">📅 학교 행사 ('+evs.length+')</button>'+
      '<button class="gfilter-btn'+(S.typeFilter==="draft"?" active":"")+'" data-tf="draft">✍️ 기안 문서</button>'+
      '<button class="gfilter-btn'+(S.typeFilter==="receive"?" active":"")+'" data-tf="receive">📥 접수 공문</button>'+
      '<button class="gfilter-btn'+(S.typeFilter==="todo"?" active":"")+'" data-tf="todo">⏳ 예정 업무</button>'+
    '</div>'+
    '<label class="muted" style="margin-left:auto;font-size:12px"><input type="checkbox" id="evToggle" '+(S.showEvents!==false?"checked":"")+'> 학교 행사 함께 보기</label>'+
  '</div>';

  if(!ts.length&&!evs.length){
    h+='<div class="empty">선택한 분류에 해당하는 일정이 없습니다.<br><button class="btn small" id="resetFilter">필터 초기화</button></div>';
  }else if(S.viewMode==="checklist"){
    // 이번 달 할 일 체크리스트 뷰
    h+='<div class="chk-view">';
    const sorted=ts.slice().sort((a,b)=>a.date.localeCompare(b.date));
    sorted.forEach(t=>{
      const d=parse(t.date);const done=isDone(t);
      h+='<div class="chk-card'+(done?" done":"")+'" style="--cat:'+dcolor(t.duty)+'">'+
        '<input type="checkbox" data-tid="'+t.id+'" '+(done?"checked":"")+'>'+
        '<div class="chk-body">'+
          '<div class="chk-head">'+
            taskTypeTag(t)+
            '<b data-id="'+t.id+'" class="task-link">'+esc(t.title)+'</b>'+
            '<span class="right" style="margin-left:auto">'+ddayHTML(t)+'</span>'+
          '</div>'+
          '<div class="chk-sub">'+
            '<span style="color:'+dcolor(t.duty)+';font-weight:700">'+esc(dname(t.duty))+'</span> · '+
            fmtD(t.date)+' 마감 · 체크 '+prog(t)+'%'+(t.tip?' · 💡 생존 요령 있음':'')+
          '</div>'+
        '</div>'+
      '</div>';
    });
    h+='</div>';
  }else{
    // 월별 달력 / 타임라인 뷰
    h+='<ul class="daylist">';
    const rows=ts.map(t=>({k:"t",date:t.date,t})).concat(evs.map(e=>({k:"e",date:e.date,e}))).sort((a,b)=>a.date.localeCompare(b.date)||(a.k==="e"?-1:1));
    rows.forEach(r=>{
      if(r.k==="e"){
        const e=r.e,d=parse(e.date);
        h+='<li class="ev"><span class="date">'+d.getDate()+'<small>'+WEEK[d.getDay()]+'</small></span>'+
          '<div class="schoolev"><span class="tag-badge tag-event">📅 학교 행사</span> <b>'+esc(e.title)+'</b>'+(e.end?' (~'+fmtD(e.end)+')':'')+'</div></li>';
        return;
      }
      const t=r.t,d=parse(t.date);
      h+='<li class="'+(isDone(t)?"done":"")+'" style="--cat:'+dcolor(t.duty)+'"><span class="date">'+d.getDate()+'<small>'+WEEK[d.getDay()]+'</small></span>'+
      '<button class="task'+(t.status!=="ok"?" draft":"")+'" data-id="'+t.id+'">'+
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">'+taskTypeTag(t)+'<span class="t">'+esc(t.title)+'</span></div>'+
        '<span class="right">'+ddayHTML(t)+badgeHTML(t)+'</span>'+
        '<span class="meta"><span style="color:'+dcolor(t.duty)+';font-weight:600">'+esc(dname(t.duty))+(t.sub?" · "+esc(t.sub):"")+'</span>'+
        (t.undone?'<span class="flag">작년 미완료</span>':'')+'<span>체크 '+prog(t)+'%</span>'+
        (t.tip?'<span>선임자 요령</span>':'')+((t.history||[]).length?'<span>지난 기록 '+t.history.length+'</span>':'')+'</span>'+
      '</button></li>';
    });
    h+='</ul>';
  }

  const mb=document.getElementById("monthBody");mb.innerHTML=h;

  // 이벤트 바인딩
  document.getElementById("vmTimeline").onclick=()=>{S.viewMode="timeline";save();renderHome()};
  document.getElementById("vmChecklist").onclick=()=>{S.viewMode="checklist";save();renderHome()};
  mb.querySelectorAll(".gfilter-btn").forEach(b=>b.onclick=()=>{S.typeFilter=b.dataset.tf;save();renderHome()});
  const rf=document.getElementById("resetFilter");if(rf)rf.onclick=()=>{S.typeFilter="all";save();renderHome()};
  const evt=document.getElementById("evToggle");if(evt)evt.onchange=()=>{S.showEvents=evt.checked;save();renderHome()};
  mb.querySelectorAll(".task, .task-link").forEach(b=>b.onclick=()=>openTask(b.dataset.id,"timeline"));
  mb.querySelectorAll(".chk-card input[type=checkbox]").forEach(i=>i.onchange=()=>{
    const t=T(i.dataset.tid);
    if(t){
      t.checks.forEach(c=>c.d=i.checked);
      save();renderHome();toast(i.checked?"업무를 완료 처리했습니다.":"완료 취소했습니다.");
    }
  });

  renderAside();
}`;

  content = content.replace(/function renderHome\(\)\{[\s\S]*?renderAside\(\);\s*\}/, homeReplacement);

  // 9. openTask 모달 업데이트 (사기 진작: 3월 질문 방어 지수, 생존 꿀팁, 1초 복붙 패키지)
  const taskModalEnhancement = `  const cards=S.cards.filter(c=>c.duty===t.duty);const dd=DUTY[t.duty]||{};
  const curCard=cards[0];
  let h='<div style="--cat:'+dcolor(t.duty)+'">'+
  '<div class="defense-shield">🛡️ 후임자 문의 방어 지수: 100% (3월 퇴근 후 연락 올 확률 0%)</div>'+
  '<div class="cat">'+(dd.dept&&dd.dept!=="학급 담임"?esc(dd.dept)+" › ":"")+esc(dname(t.duty))+(t.sub?" · "+esc(t.sub):"")+'</div>'+
  '<div style="display:flex;align-items:center;gap:8px;margin:6px 0">'+taskTypeTag(t)+'<input class="title" id="fTitle" value="'+esc(t.title)+'" aria-label="업무명" style="margin:0;flex:1"></div>'+
  '<div class="line"><input type="date" id="fDate" value="'+t.date+'" aria-label="날짜"> ('+WEEK[parse(t.date).getDay()]+') '+ddayHTML(t)+badgeHTML(t)+
  '<select id="fDuty" aria-label="업무분장">'+DUTIES.map(d=>'<option value="'+d.id+'"'+(d.id===t.duty?" selected":"")+'>'+esc(d.name)+'</option>').join("")+'</select></div>'+
  '<h4>체크리스트</h4><ul class="cl">'+t.checks.map((c,i)=>'<li><label><input type="checkbox" data-i="'+i+'" '+(c.d?"checked":"")+'><span>'+esc(c.t)+'</span></label></li>').join("")+'</ul>';

  if(t.tip||(curCard&&curCard.tips)){
    h+='<h4>⚠️ 현실 생존 꿀팁 (선임자 오답노트)</h4><div class="survival-tip"><b>선배 교사의 한 줄 조언:</b>'+esc(t.tip||curCard.tips)+'</div>';
  }

  // 1초 복붙 패키지 버튼
  h+='<h4>📋 복붙 1초 패키지 (즉시 복사)</h4><div class="copy-package">'+
    '<button class="copy-btn" id="cpDraft">✍️ 기안문 결재 원문 복사</button>'+
    '<button class="copy-btn" id="cpParent">✉️ 가정통신문 양식 복사</button>'+
    '<button class="copy-btn" id="cpExcel">📊 수합용 엑셀 서식 복사</button>'+
  '</div>';

  if(t.why||t.undone) h+='<h4>이 초안을 만든 방법</h4><div class="tip alert">'+(t.undone?'<b style="color:var(--red)">작년 업무표에 미완료로 남은 업무입니다</b>':'')+esc(t.why)+'</div>';
  if((t.history||[]).length) h+='<h4>지난 기록 (해마다 쌓임)</h4><ul class="hist">'+t.history.slice().sort((a,b)=>b.y-a.y).map(x=>'<li><b>'+x.y+'학년도 · '+esc(x.src)+'</b>'+esc(x.t)+'</li>').join("")+'</ul>';
  h+='<h4>근거</h4><div class="tip" style="font-size:13.5px"><b>'+esc(t.source||"근거 자료 없음")+'</b>'+(t.quote?'<mark>'+esc(t.quote)+'</mark>':'')+'</div>';
  h+='<h4>원본 위치 (학교 NAS 폴더)</h4><div class="path"><input id="fPath" value="'+esc(t.path)+'" placeholder="예: NAS > 교무기획부 > 2026학년도 반편성" aria-label="원본 NAS 폴더 위치"><button class="btn ghost small" id="cp">경로 복사</button></div>';
  h+='<div class="row"><button class="btn ghost small" id="mkMsg">안내 메시지 만들기</button><a class="btn ghost small" href="'+gcal(t)+'" target="_blank" rel="noopener">구글 캘린더에 추가</a></div>';
  h+='<div class="dlg-foot">'+(t.status!=="ok"?'<button class="btn" id="cf">검토 완료, 확정하기</button>':'<span class="badge ok">교사가 확정한 업무</span>')+
  '<span class="row" style="margin:0"><button class="btn ghost" id="del">삭제</button><button class="btn ghost" id="cl">닫기</button></span></div>'+
  '</div>';
  document.getElementById("dlgBody").innerHTML=h;`;

  content = content.replace(/const cards=S\.cards\.filter\(c=>c\.duty===t\.duty\);const dd=DUTY\[t\.duty\]\|\|\{\};[\s\S]*?document\.getElementById\("dlgBody"\)\.innerHTML=h;/, taskModalEnhancement);

  // 10. 복붙 버튼 이벤트 리스너 추가
  const copyEventBinding = `  document.getElementById("cp").onclick=async()=>{if(!t.path)return toast("경로를 먼저 입력하세요");try{await navigator.clipboard.writeText(t.path);toast("복사했습니다")}catch(e){toast("직접 복사해주세요")}};
  document.getElementById("cpDraft").onclick=async()=>{
    const txt=(curCard&&curCard.draftTemplate)?curCard.draftTemplate:"[기안문 서식]\\n1. 관련: 2026학년도 학교교육과정 운영 계획\\n2. '"+t.title+"' 건에 대하여 다음과 같이 추진하고자 합니다.\\n  가. 일시: "+fmtD(t.date)+"\\n  나. 대상: 관련 학급 및 교원\\n  다. 내용: "+t.checks.map(c=>c.t).join(", ");
    try{await navigator.clipboard.writeText(txt);toast("기안문 원문을 복사했습니다! (NEIS에 붙여넣기 하세요)")}catch(e){toast("복사 실패")}
  };
  document.getElementById("cpParent").onclick=async()=>{
    const txt=(curCard&&curCard.parentTemplate)?curCard.parentTemplate:"[가정통신문 서식]\\n학부모님 안녕하십니까.\\n본교에서는 '"+t.title+"'과 관련하여 다음과 같이 안내드리오니 가정의 협조를 부탁드립니다.\\n- 일시: "+fmtD(t.date)+"\\n- 문의: 담임교사";
    try{await navigator.clipboard.writeText(txt);toast("가정통신문 서식을 복사했습니다!")}catch(e){toast("복사 실패")}
  };
  document.getElementById("cpExcel").onclick=async()=>{
    const txt=(curCard&&curCard.excelTemplate)?curCard.excelTemplate:"연번,학번,이름,제출여부,비고\\n1,50101,홍길동,O,\\n2,50102,김철수,O,";
    try{await navigator.clipboard.writeText(txt);toast("수합용 엑셀 서식을 복사했습니다!")}catch(e){toast("복사 실패")}
  };`;

  content = content.replace(/document\.getElementById\("cp"\)\.onclick=async\(\)=>\{[\s\S]*?toast\("직접 복사해주세요"\}\)\};/, copyEventBinding);

  // 11. 3단계 챗봇 (Vercel API 우선 시도, 로컬 Claude/Gemini, 스마트 로컬 검색)
  const chatbotEnhancement = 'async function ask(q){\\n' +
  '  q=q.trim();if(!q)return;chat.push({me:true,text:q});const hits=search(q);\\n' +
  '  const pending={me:false,text:"중대부초 업무 데이터에서 답변을 찾고 있습니다…",ev:hits};chat.push(pending);renderAsk();\\n\\n' +
  '  const ctx=hits.map((h,i)=>"["+i+"] "+(h.kind==="task"?"업무 "+h.t.date+" ("+dname(h.duty)+") "+h.t.title+"\\\\n체크: "+h.t.checks.map(c=>c.t).join(" / ")+(h.t.tip?"\\\\n요령: "+h.t.tip:""):h.kind==="card"?"카드 ("+dname(h.duty)+") "+h.title+"\\\\n"+h.c.tips:h.kind==="event"?"중대부초 학사력 "+h.e.date+" "+h.e.title:"업무분장: "+h.text)).join("\\\\n\\\\n");\\n' +
  '  const prompt="너는 중앙대학교사범대학부속초등학교(중대부초)의 교사 업무 전담 AI 비서다. 아래 \'저장된 중대부초 자료\' 안에서만 근거를 찾아 교사의 질문에 친절하고 명확하게 2~3문장으로 답하라. 교사 개인정보나 실명은 쓰지 마라.\\\\nJSON 형식: {\\\\"answer\\\\":\\\\"답변 내용\\\\",\\\\"uncertain\\\\":false}\\\\n질문: " + q + "\\\\n저장된 중대부초 자료:\\\\n" + ctx;\\n\\n' +
  '  // 1단계: Vercel 배포 시 /api/chat 엔드포인트 자동 연동 시도\\n' +
  '  try{\\n' +
  '    const vRes = await fetch("/api/chat", {\\n' +
  '      method: "POST",\\n' +
  '      headers: { "Content-Type": "application/json" },\\n' +
  '      body: JSON.stringify({ question: q, context: ctx })\\n' +
  '    });\\n' +
  '    if(vRes.ok){\\n' +
  '      const vData = await vRes.json();\\n' +
  '      if(vData && vData.answer){\\n' +
  '        pending.text = vData.answer;\\n' +
  '        pending.unsure = !!vData.uncertain;\\n' +
  '        return renderAsk();\\n' +
  '      }\\n' +
  '    }\\n' +
  '  }catch(e){ /* Vercel 엔드포인트 없으면 2단계로 통과 */ }\\n\\n' +
  '  // 2단계: 로컬 Claude / Gemini API 호출 시도\\n' +
  '  if(S.apiKey || localStorage.getItem("tm_api_key")){\\n' +
  '    try{\\n' +
  '      const res=await callLLM(prompt,{json:true});\\n' +
  '      if(res && res.answer){\\n' +
  '        pending.text=res.answer;\\n' +
  '        pending.unsure=!!res.uncertain;\\n' +
  '        return renderAsk();\\n' +
  '      }\\n' +
  '    }catch(e){console.warn("챗봇 AI 오류, 로컬 검색 결과로 응답:", e)}\\n' +
  '  }\\n\\n' +
  '  // 3단계: 로컬 스마트 검색 응답 (API 키 없어도 즉시 작동)\\n' +
  '  if(!hits.length){pending.text="저장된 중대부초 학사력 행사, 인수인계 카드, 업무 목록에서 관련된 내용을 찾지 못했습니다.";pending.unsure=true;return renderAsk()}\\n' +
  '  const ev=hits.find(h=>h.kind==="event");\\n' +
  '  const tk=hits.find(h=>h.kind==="task");\\n' +
  '  const cd=hits.find(h=>h.kind==="card");\\n' +
  '  let ans="중대부초 업무 자료 검색 결과입니다:\\\\n";\\n' +
  '  if(ev) ans+="• 2026 학사력 기준 ‘" + ev.e.title + "’은(는) " + fmtD(ev.e.date) + (ev.e.end?"~"+fmtD(ev.e.end):"") + "에 예정되어 있습니다.\\\\n";\\n' +
  '  if(tk) ans+="• 관련 업무 ‘" + tk.t.title + "’의 마감일은 " + fmtD(tk.t.date) + "입니다.\\\\n";\\n' +
  '  if(cd) ans+="• 선임자 꿀팁: " + cd.c.tips.split("\\\\n")[0] + "\\\\n";\\n' +
  '  pending.text=ans.trim();\\n' +
  '  renderAsk();\\n' +
  '}';

  content = content.replace(/async function ask\(q\)\{[\s\S]*?renderAsk\(\);\s*\}/, chatbotEnhancement);

  // 12. 예시 질문 변경 (중대부초 특화)
  const examplesReplacement = `const EXAMPLES=["중대부초 우애남매 활동은 언제야?","학부모 총회 전 준비할 기안은?","디벗 관리는 누구 담당이야?","현장체험학습 기안은 몇 주 전에 올려?","정보공시 1차 일정 알려줘"];
function renderExamples(){
  document.getElementById("examples").innerHTML='<span class="muted" style="font-size:12.5px;font-weight:700">추천 질문:</span>'+EXAMPLES.map(x=>'<button class="exbtn">'+esc(x)+'</button>').join("");
  document.querySelectorAll(".exbtn").forEach(b=>b.onclick=()=>{document.getElementById("q").value=b.textContent;ask(b.textContent)});
}`;
  content = content.replace(/const EXAMPLES=\[[\s\S]*?document\.querySelectorAll\("\.exbtn"\)[\s\S]*?\}\);/, examplesReplacement);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated:', filePath);
}

updateFile('prototype.html');
updateFile('public/prototype.html');
