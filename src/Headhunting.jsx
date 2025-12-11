import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './headhunting.css';

function Headhunting() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    selectedRanks: [],
    selectedCareers: [],
    selectedJobs: [],
    selectedRegions: [],
    searchKeyword: '',
    currentPage: 1,
    itemsPerPage: 9
  });

  const [specs, setSpecs] = useState([]);
  const [expandedSpecs, setExpandedSpecs] = useState({});
  const [selectedMainJob, setSelectedMainJob] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '' });

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        setUserInfo({ name: parsed.name || '' });
      } catch (e) {
        console.error('사용자 정보 로드 오류:', e);
      }
    }

    window.addEventListener('loginStatusChanged', checkLoginStatus);
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const data = {
      ranks: ["사원", "주임", "대리", "과장", "차장", "부장", "임원"], // 직급/직책
      duties: ["개발", "데이터", "인프라/플랫폼/Devops", "기획", "디자인", "QA/테스트"],
      subDuties: {
        "개발": ["FE", "BE", "APP"],
        "데이터": ["데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어"],
        "인프라/플랫폼/Devops": ["Devops", "클라우드", "보안"],
        "기획": ["서비스 기획", "PO", "PM"],
        "디자인": ["UIUX", "BX", "그래픽 디자이너", "모션 디자이너"],
        "QA/테스트": ["QA", "테스트 엔지니어"]
      },
      careers: ["1년~3년", "3년~5년", "5년~7년", "7년~10년", "10년~15년", "15년~"],
      regions: [
        "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
        "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
      ]
  };

  // 레거시 저장된 스펙 호환을 위한 세부직무 -> 대분류 매핑 테이블
  const legacySubToDuty = {
    "FE (프론트엔드)": "개발", "FE": "개발", "BE (백엔드)": "개발", "BE": "개발", "App (모바일 앱 개발)": "개발", "APP": "개발",
    "Data Engineer/Data Scientist": "데이터", "데이터 엔지니어": "데이터", "머신러닝 엔지니어": "데이터", "데이터 분석가": "데이터",
    "DevOps (시스템 운영/배포 엔지니어)": "인프라/플랫폼/Devops", "Devops": "인프라/플랫폼/Devops", "클라우드": "인프라/플랫폼/Devops", "보안": "인프라/플랫폼/Devops",
    "서비스 기획": "기획", "PO (프로덕트 오너)": "기획", "PO": "기획", "PM (프로젝트/프로덕트 매니저)": "기획", "PM": "기획",
    "UI/UX": "디자인", "UIUX": "디자인", "BX (브랜드 경험 디자이너)": "디자인", "BX": "디자인", "그래픽 디자이너": "디자인", "모션 디자이너": "디자인",
    "QA 테스트 엔지니어": "QA/테스트", "QA": "QA/테스트", "테스트 엔지니어": "QA/테스트"
  };

  const jobPostings = [
    { title: "보령 [경기] IT 디지털 기획 과장, 차장급 구함 (국가사업)", info: "직무: IT 기획 | 경력: 8년 이상 | 지역: 경기 | 등록일: 10/27" },
    { title: "[파견/2개월/강남] 대기업 솔루션 업체 프론트엔드 개발자 고급 모집", info: "직무: 프론트엔드 개발 | 경력: 7년 이상 | 지역: 서울 | 등록일: 10/20" },
    { title: "[파견/2개월/서대문] 공공기관 java 풀스택 개발자 중급 모집", info: "직무: 백엔드 개발 | 경력: 5년 이상 | 지역: 서울 | 등록일: 09/30" },
    { title: "[파견/2개월/서대문] 공공기관 java 풀스택 개발자 중급 모집", info: "직무: 백엔드 개발 | 경력: 5년 이상 | 지역: 서울 | 등록일: 09/30" },
    { title: "유한양행 [인천] IT 시스템 운영, 관리 담당자 모집", info: "직무: IT 운영 | 경력: 8년 이상 | 지역: 인천 | 등록일: 09/15" },
    { title: "보험 대기업 인프라 운영, 관리(미들웨어) 대리급 구함 (굿커리어)", info: "직무: 데이터 관리 | 경력: 3년 이상 | 지역: 서울 | 등록일: 08/26" },
    { title: "클라우드 실행 본부 PM (10년 이상)", info: "직무: 클라우드 관리 | 경력: 10년 이상 | 지역: 서울 | 등록일: 08/18" },
    { title: "유명 리걸테크기업 백엔드 개발팀장(차/부장급)", info: "직무: 백엔드 개발 | 경력: 8년 이상 | 지역: 서울 | 등록일: 07/29" },
    { title: "[긴급] IT 정보보호 담당 (8~15년)", info: "직무: 정보보안 | 경력: 8년 이상 | 지역: 서울 | 등록일: 07/29" },
    { title: "중견기업 프론트엔드 개발 파트장/그룹장 채용", info: "직무: 프론트엔드 개발 | 경력: 3년 이상 | 지역: 서울 | 등록일: 07/15" },
    { title: "[서울 강남] 중견 IT기업 개발자 파트장 모집", info: "직무: 개발 | 경력: 4년 이상 | 지역: 서울 | 등록일: 07/10" },
    { title: "벤처기업 백엔드 개발 팀장급 채용", info: "직무: 백엔드 개발 | 경력: 5년 이상 | 지역: 서울 | 등록일: 07/05" },
    { title: "대기업 계열사 UI/UX 디자이너 경력직", info: "직무: UI/UX 디자인 | 경력: 5년 이상 | 지역: 경기 | 등록일: 06/28" },
    { title: "[파견/3개월] 중견기업 프론트엔드 개발자 모집", info: "직무: 프론트엔드 개발 | 경력: 3년 이상 | 지역: 서울 | 등록일: 06/20" },
    { title: "외국계 기업 데이터 분석가 과장급 채용", info: "직무: 데이터 분석 | 경력: 6년 이상 | 지역: 서울 | 등록일: 06/15" },
    { title: "중견기업 IT 기획자 파트장 채용 (서울)", info: "직무: IT 기획 | 경력: 5년 이상 | 지역: 서울 | 등록일: 06/10" },
    { title: "[긴급] 중소기업 풀스택 개발자 경력직 모집", info: "직무: 풀스택 개발 | 경력: 4년 이상 | 지역: 경기 | 등록일: 06/05" },
    { title: "공기업 IT 인프라 운영 담당자 (서울)", info: "직무: 인프라 운영 | 경력: 7년 이상 | 지역: 서울 | 등록일: 05/30" }
  ];

  const [collapsedJobs, setCollapsedJobs] = useState(true);
  const [visibleCards, setVisibleCards] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [allSearchResults, setAllSearchResults] = useState([]); // 크롤링된 전체 결과 저장

  // Helper: parse years from job info string
  const extractYears = (job) => {
    const match = job.info.match(/경력:\s*(\d+)년/);
    return match ? parseInt(match[1], 10) : null;
  };

  // Helper: region match
  const extractRegion = (job) => {
    const match = job.info.match(/지역:\s*([^|]+)/);
    return match ? match[1].trim() : '';
  };

  // Keyword maps for main duty classification
  const mainDutyKeywords = {
    '개발': ['개발', '프론트엔드', '백엔드', '풀스택', 'FE', 'BE', 'App', '모바일'],
    '데이터': ['데이터', '머신러닝', '분석'],
    '인프라/플랫폼/Devops': ['인프라', '클라우드', 'Devops', '보안', '미들웨어'],
    '기획': ['기획', 'PM', 'PO'],
    '디자인': ['디자이너', 'UI/UX', 'UIUX', 'BX', '그래픽', '모션'],
    'QA/테스트': ['QA', '테스트']
  };

  const rankKeywords = ['사원', '주임', '대리', '과장', '차장', '부장', '임원'];
  const companyTypeKeywords = ['대기업', '중견', '중소', '외국계', '공기업', '벤처'];

  const matchesMainDuty = (job, mainDuty) => {
    if (!mainDuty) return true;
    const keywords = mainDutyKeywords[mainDuty] || [];
    const text = (job.title + ' ' + job.info);
    return keywords.some(kw => text.includes(kw));
  };

  const matchesSubDuty = (job, subDuty) => {
    if (!subDuty) return true;
    const text = (job.title + ' ' + job.info);
    return text.includes(subDuty);
  };

  const matchesCareerRange = (job, selectedRange) => {
    if (!selectedRange) return true;
    const years = extractYears(job);
    if (years === null) return true; // if not specified, don't exclude
    const rangeMap = {
      '1년~3년': [1, 3],
      '3년~5년': [3, 5],
      '5년~7년': [5, 7],
      '7년~10년': [7, 10],
      '10년~15년': [10, 15],
      '15년~': [15, Infinity]
    };
    const [minY, maxY] = rangeMap[selectedRange] || [0, Infinity];
    // Job spec often formatted as "N년 이상" so treat as >= years
    return years >= minY && years < maxY;
  };

  const matchesRegion = (job, selectedRegions) => {
    if (selectedRegions.length === 0) return true;
    const region = extractRegion(job);
    return selectedRegions.some(r => region.includes(r) || job.title.includes(r));
  };

  const matchesRank = (job, selectedRanks) => {
    if (selectedRanks.length === 0) return true;
    const text = (job.title + ' ' + job.info);
    return selectedRanks.some(r => text.includes(r));
  };

  useEffect(() => {
    // Load specs from localStorage
    const loadSpecs = () => {
      try {
        const savedSpecs = localStorage.getItem('userSpecs');
        console.log('📦 [Headhunting] Loaded specs from localStorage:', savedSpecs);
        
        if (savedSpecs) {
          const parsed = JSON.parse(savedSpecs);
          const specsArray = Array.isArray(parsed) ? parsed : [parsed];
          const withIds = specsArray.map((spec, idx) => ({
            ...spec,
            id: spec.id || `spec-${Date.now()}-${idx}`
          }));
          console.log('✅ [Headhunting] Parsed specs:', withIds);
          setSpecs(withIds);
        } else {
          console.log('❌ [Headhunting] No specs found in localStorage');
          setSpecs([]);
        }
      } catch (e) {
        console.error('⚠️ [Headhunting] Error loading specs:', e);
        setSpecs([]);
      }
    };
    
    loadSpecs();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadSpecs();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pageshow', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pageshow', handleStorageChange);
    };
  }, []);;

  // 이전 계층 로직 제거됨 (Spec 구조는 단일 대분류/단일 세부직무 선택)

  const getMaxSelection = (category) => {
    const maxSelections = {
      ranks: 1, // 직급 단일 선택
      careers: 1,
      jobs: 3,  // 세부직무 최대 3개 선택
      regions: 2
    };
    return maxSelections[category];
  };

  const toggleSelect = (category, value) => {
    setState(prevState => {
      const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}`;
      const current = prevState[key];
      const max = getMaxSelection(category);

      let next;
      if (Array.isArray(current)) {
        // 다중 선택 배열 (companies, regions)
        if (current.includes(value)) {
          next = current.filter(v => v !== value);
        } else {
          if (current.length >= max) return prevState;
          next = [...current, value];
        }
      } else {
        // 단일 선택 (ranks, jobs)
        next = current === value ? (category === 'jobs' ? [] : []) : (category === 'jobs' ? [value] : [value]);
      }

      return {
        ...prevState,
        [key]: next,
        currentPage: 1
      };
    });
  };

  const renderButtons = (category) => {
    const items = data[category];
    if (!items) return null;
    const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}`;
    const selected = state[key] || [];
    const max = getMaxSelection(category);

    return items.map(item => {
      const isSelected = Array.isArray(selected) ? selected.includes(item) : selected === item;
      const atMax = Array.isArray(selected) ? selected.length >= max : !!selected.length;
      const disabled = !isSelected && atMax && max === 1; // 단일 선택 시 다른 버튼 비활성화
      return (
        <button
          key={item}
          className={`${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          disabled={disabled}
          onClick={() => toggleSelect(category, item)}
        >{item}</button>
      );
    });
  };

  useEffect(() => {
    // 크롤링 결과가 있으면 그 결과로만 페이지네이션 (더미 데이터 무시)
    if (allSearchResults.length > 0) {
      console.log(`✅ 크롤링 결과로 페이지네이션: ${allSearchResults.length}건`);
      return; // 크롤링 결과가 있으면 아래 로직 스킵
    }

    // 크롤링 결과가 없을 때만 더미 데이터로 필터링 (검색 버튼 누르기 전)
    const keyword = state.searchKeyword.toLowerCase();
    const selectedRange = state.selectedCareers[0];
    const selectedSubDuty = state.selectedJobs[0];

    let filtered = jobPostings.filter(job => {
      const lowerText = (job.title + ' ' + job.info).toLowerCase();
      if (keyword && !lowerText.includes(keyword)) return false;
      if (!matchesMainDuty(job, selectedMainJob)) return false;
      if (!matchesSubDuty(job, selectedSubDuty)) return false;
      if (!matchesCareerRange(job, selectedRange)) return false;
      if (!matchesRegion(job, state.selectedRegions)) return false;
      if (!matchesRank(job, state.selectedRanks)) return false;
      return true;
    });

    setTotalCount(filtered.length);
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    setVisibleCards(filtered.slice(startIdx, endIdx));
  }, [state.searchKeyword, state.selectedRanks, state.selectedCareers, state.selectedJobs, state.selectedRegions, state.currentPage, selectedMainJob, allSearchResults]);

  const handleSearch = async () => {
    // 선택된 조건이 있는지 확인
    if (!selectedMainJob && state.selectedJobs.length === 0 && state.selectedRanks.length === 0 && 
        state.selectedCareers.length === 0 && state.selectedRegions.length === 0) {
      alert('직무, 직급, 경력, 또는 지역 중 최소 하나를 선택해주세요.');
      return;
    }

    try {
      // 로딩 상태 표시
      const btn = document.querySelector('.search-btn-large');
      const originalText = btn.textContent;
      btn.textContent = '검색 중...';
      btn.disabled = true;

      // 크롤러에 보낼 데이터 준비
      const crawlerParams = {
        duty: selectedMainJob || '',
        subDuties: state.selectedJobs, // 배열로 여러 개 전송
        position: '',  // 직급 제거
        career: state.selectedCareers[0] || '',  // 경력 추가
        region: state.selectedRegions[0] || ''
      };

      console.log('🔍 크롤러 요청:', crawlerParams);

      // 1. 크롤러 실행 요청
      const crawlResponse = await fetch(`${API_BASE_URL}/api/crawl-filters/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify(crawlerParams)
      });

      if (!crawlResponse.ok) {
        throw new Error(`크롤링 요청 실패: ${crawlResponse.status}`);
      }

      const crawlResult = await crawlResponse.json();
      console.log('✅ 크롤링 응답:', crawlResult);

      // 2. 크롤링 완료 대기 (3초 후 결과 조회)
      btn.textContent = '결과를 가져오는 중...';
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 3. 크롤링 결과 조회 - Django API를 통해 JSON 반환
      const resultsParams = new URLSearchParams({
        duty: selectedMainJob || '',
        subDuties: state.selectedJobs.join(','),
        career: state.selectedCareers[0] || '',
        region: state.selectedRegions[0] || ''
      });

      const resultsResponse = await fetch(
        `${API_BASE_URL}/api/crawl-results/?${resultsParams}`
      );

      if (!resultsResponse.ok) {
        throw new Error('결과 조회 실패');
      }

      const resultsData = await resultsResponse.json();
      console.log('📊 크롤링 결과:', resultsData);
      
      // 4. 결과를 state에 저장하고 UI에 표시
      if (resultsData.jobs && resultsData.jobs.length > 0) {
        console.log('📋 첫 번째 공고 데이터:', resultsData.jobs[0]);
        console.log('🔍 experience 필드:', resultsData.jobs[0].experience);
        // 전체 데이터를 state에 저장 (페이지네이션용)
        setAllSearchResults(resultsData.jobs);
        setState(prev => ({
          ...prev,
          currentPage: 1
        }));
        setVisibleCards(resultsData.jobs.slice(0, state.itemsPerPage));
        setTotalCount(resultsData.count);
        alert(`🎉 ${resultsData.count}개의 채용공고를 찾았습니다!`);
      } else {
        setVisibleCards([]);
        setTotalCount(0);
        setAllSearchResults([]);
        alert('조건에 맞는 채용공고가 없습니다.');
      }

    } catch (error) {
      console.error('❌ 오류:', error);
      alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      const btn = document.querySelector('.search-btn-large');
      btn.textContent = '조건으로 검색';
      btn.disabled = false;
    }
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      searchKeyword: '',
      selectedRanks: [],
      selectedCareers: [],
      selectedJobs: [],
      selectedRegions: [],
      currentPage: 1
    }));
    setSelectedMainJob(null);
    setAllSearchResults([]);
    setVisibleCards([]);
    setTotalCount(0);
  };

  const handlePageChange = (newPage) => {
    console.log(`📄 페이지 변경: ${state.currentPage} → ${newPage}`);
    console.log(`📊 전체 결과 수: ${allSearchResults.length}, 현재 페이지: ${newPage}`);
    const startIdx = (newPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    const pageResults = allSearchResults.slice(startIdx, endIdx);
    console.log(`🔍 ${startIdx}~${endIdx} 범위: ${pageResults.length}건`);
    setVisibleCards(pageResults);
    setState(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const totalPages = Math.ceil(totalCount / state.itemsPerPage);

  const toggleSpecExpand = (specId) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [specId]: !prev[specId]
    }));
  };

  const handleSelectSpec = (spec) => {
    const newState = { ...state };

    // 직급 (단일)
    if (spec.position && data.ranks.includes(spec.position)) {
      newState.selectedRanks = [spec.position];
    }

    // 대분류 직무 + 세부 직무
    if (spec.duty && data.duties.includes(spec.duty)) {
      setSelectedMainJob(spec.duty);
      if (spec.subDuty && data.subDuties[spec.duty]?.includes(spec.subDuty)) {
        newState.selectedJobs = [spec.subDuty];
      } else {
        newState.selectedJobs = [];
      }
    }

    // 지역 (최대 2 유지)
    if (spec.region && data.regions.includes(spec.region)) {
      newState.selectedRegions = [spec.region];
    }

    // 경력 파싱 및 범위 매핑
    if (spec.career && spec.career !== '경력 없음') {
      const yearMatch = spec.career.match(/(\d+)년/);
      const monthMatch = spec.career.match(/(\d+)개월/);
      const years = yearMatch ? parseInt(yearMatch[1], 10) : 0;
      const months = monthMatch ? parseInt(monthMatch[1], 10) : 0;
      const totalMonths = years * 12 + months;
      let range = null;
      if (totalMonths >= 12 && totalMonths < 36) range = '1년~3년';
      else if (totalMonths >= 36 && totalMonths < 60) range = '3년~5년';
      else if (totalMonths >= 60 && totalMonths < 84) range = '5년~7년';
      else if (totalMonths >= 84 && totalMonths < 120) range = '7년~10년';
      else if (totalMonths >= 120 && totalMonths < 180) range = '10년~15년';
      else if (totalMonths >= 180) range = '15년~';
      newState.selectedCareers = range ? [range] : [];
    } else {
      newState.selectedCareers = [];
    }

    setState(newState);
    alert('해당 스펙의 조건이 자동 선택되었습니다.');
  };

  const handleEditSpec = () => {
    window.location.href = '/spec';
  };

  return (
    <main className="headhunt-layout">
      <aside className="headhunt-sidebar">
        {isLoggedIn ? (
          <div className="headhunt-profile-box logged">
            <div className="headhunt-profile-content">
              <img 
                className="headhunt-profile-img" 
                src="https://www.gravatar.com/avatar/?d=mp&s=100" 
                alt="프로필 이미지"
              />
              <div className="headhunt-profile-info">
                <h3 className="headhunt-profile-name">{userInfo.name}님</h3>
                <Link to="/profile" className="headhunt-profile-edit">
                  <span>⚙️</span>
                  <span>회원정보 수정</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="headhunt-profile-box">
            <div className="headhunt-profile-content" onClick={() => navigate('/login')}>
              <img 
                className="headhunt-user-icon" 
                src={`${process.env.PUBLIC_URL}/user.png`} 
                alt="사용자 아이콘"
              />
              <p className="headhunt-profile-text">로그인이 필요합니다.</p>
            </div>
            <div className="headhunt-profile-footer">
              <a href="#find-id" className="headhunt-footer-link">아이디 찾기</a>
              <div className="headhunt-divider"></div>
              <a href="#find-pw" className="headhunt-footer-link">비밀번호 찾기</a>
            </div>
          </div>
        )}

        <div className="sidebar-box">
          <div className="sidebar-header">
            <strong>스크랩한 공고</strong>
            <span>0건</span>
          </div>
          <div className="sidebar-content">스크랩한 공고가 없습니다.</div>
        </div>

        <div className="sidebar-box">
          <div className="sidebar-header">
            <strong>최근 본 공고</strong>
            <span>0건</span>
          </div>
          <div className="sidebar-content">최근 본 공고가 없습니다.</div>
        </div>
      </aside>

      <div className="headhunt-content">
        <h2 style={{ marginTop: '40px', marginBottom: '20px', fontSize: '1.8rem' }}>헤드헌팅 채용 정보</h2>
        
        {/* 보유 스펙 박스 */}
        <div className="spec-summary-section">
          <h3>보유 스펙</h3>
          <div id="specBoxesContainer">
            {specs.length === 0 ? (
              <p style={{color: '#666', fontSize: '0.95rem'}}>저장된 스펙이 없습니다.</p>
            ) : (
              <div className="spec-boxes">
                {specs.map((spec, index) => {
                  const isExpanded = expandedSpecs[spec.id];
                  return (
                    <div key={spec.id || index} className="spec-box-collapsible">
                      <div 
                        className="spec-box-header-clickable" 
                        onClick={() => toggleSpecExpand(spec.id)}
                      >
                        <div className="spec-box-title">
                          <strong>{spec.companyName || '회사명 없음'}</strong>
                          {!isExpanded && (
                            <span className="spec-box-company-preview">
                              {spec.duty && ` - ${spec.duty}`}
                              {spec.subDuty && ` > ${spec.subDuty}`}
                            </span>
                          )}
                        </div>
                        <span className="toggle-icon">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                      
                      {isExpanded && (
                        <div className="spec-box-content">
                          <div className="spec-box-details-grid">
                            <div className="spec-detail-row">
                              <span className="spec-label">직무:</span>
                              <span className="spec-value">{spec.duty || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">세부직무:</span>
                              <span className="spec-value">{spec.subDuty || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">회사명:</span>
                              <span className="spec-value">{spec.companyName || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">경력:</span>
                              <span className="spec-value">{spec.career || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">직급:</span>
                              <span className="spec-value">{spec.position || '-'}</span>
                            </div>
                            <div className="spec-detail-row">
                              <span className="spec-label">근무지역:</span>
                              <span className="spec-value">{spec.region || '-'}</span>
                            </div>
                          </div>
                          
                          <div className="spec-box-actions">
                            <button className="spec-edit-btn" onClick={handleEditSpec}>
                              수정
                            </button>
                            <button className="spec-select-btn" onClick={() => handleSelectSpec(spec)}>
                              선택
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        <section className="filter-section isolated">
          <h3 className="filter-section-title">원하는 직무 선택</h3>

          <div className="filter-group">
            <label>직무 (대분류)</label>
            <div className="grid">
              {data.duties.map(duty => {
                const isSelected = selectedMainJob === duty;
                return (
                  <button
                    key={duty}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => {
                      setSelectedMainJob(duty);
                      setState(prev => ({ ...prev, selectedJobs: [] }));
                    }}
                  >{duty}</button>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <label>세부 직무 ({state.selectedJobs.length}/3)</label>
            <div className="grid" id="headhunt-sub-duty-grid">
              {selectedMainJob ? (
                data.subDuties[selectedMainJob].map(sub => {
                  const isSelected = state.selectedJobs.includes(sub);
                  return (
                    <button
                      key={sub}
                      className={isSelected ? 'selected' : ''}
                      disabled={isSelected ? false : state.selectedJobs.length >= 3}
                      onClick={() => toggleSelect('jobs', sub)}
                    >{sub}</button>
                  );
                })
              ) : (
                <p style={{color: '#9ca3af', fontSize: '0.95rem', padding: '12px'}}>
                  대분류 직무를 선택하면 세부 직무를 선택할 수 있습니다.
                </p>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label>경력 ({state.selectedCareers.length}/1)</label>
            <div className="grid">{renderButtons('careers')}</div>
          </div>

          <div className="filter-group">
            <label>근무지역 ({state.selectedRegions.length}/2)</label>
            <div className="grid">{renderButtons('regions')}</div>
          </div>

          <section className="selected">
            <label>선택된 조건</label>
            <div className="selected-chips">
              {[...state.selectedRanks, ...state.selectedCareers, ...state.selectedJobs, ...state.selectedRegions].map(chip => (
                <span key={chip} className="chip">{chip}</span>
              ))}
            </div>
            {(state.selectedRanks.length + state.selectedCareers.length + state.selectedJobs.length + state.selectedRegions.length) === 0 && (
              <p className="selected-placeholder">현재 선택된 조건이 없습니다.</p>
            )}
          </section>

          <div className="filter-group search-action-group">
            <button className="search-btn search-btn-large" onClick={handleSearch}>조건으로 검색</button>
            <button className="reset-btn reset-btn-large" onClick={handleReset}>초기화</button>
          </div>
        </section>

        <section className="job-list">
          <h3 id="total-count">총 {totalCount}건</h3>

          {visibleCards.map((job, idx) => (
            <div key={idx} className="job-card">
              <div className="job-info">
                <h4>{job.title}</h4>
                <div className="job-details">
                  <p><strong>회사:</strong> {job.company || '-'}</p>
                  <p><strong>지역:</strong> {job.location || '-'}</p>
                  <p><strong>마감:</strong> {job.deadline || '-'}</p>
                  {job.source && <p><strong>출처:</strong> {job.source}</p>}
                </div>
              </div>
              <button 
                className="apply-btn"
                onClick={() => {
                  if (job.link) {
                    window.open(job.link, '_blank');
                  }
                }}
              >
                지원 공고 확인
              </button>
            </div>
          ))}

          {totalCount > 0 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px', alignItems: 'center' }}>
              {/* 맨 처음 페이지로 */}
              <button 
                className="pagination-edge" 
                disabled={state.currentPage <= 1} 
                onClick={() => handlePageChange(1)}
                title="맨 처음 페이지"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  cursor: state.currentPage <= 1 ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  opacity: state.currentPage <= 1 ? 0.5 : 1,
                  fontWeight: 'bold'
                }}
              >
                {'⏮'}
              </button>

              {/* 이전 페이지 그룹 (4개 이전) */}
              <button 
                className="pagination-group-prev" 
                disabled={state.currentPage <= 1} 
                onClick={() => {
                  const pageStart = Math.max(1, state.currentPage - 5);
                  handlePageChange(Math.max(1, pageStart - 4));
                }}
                title="이전 페이지 그룹"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  cursor: state.currentPage <= 1 ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  opacity: state.currentPage <= 1 ? 0.5 : 1,
                  fontWeight: 'bold'
                }}
              >
                {'◀◀'}
              </button>
              
              {/* 페이지 번호 그룹 (4개씩 표시) */}
              {(() => {
                const pages = [];
                const pageStart = Math.max(1, state.currentPage - 2);
                const pageEnd = Math.min(totalPages, pageStart + 4);
                
                for (let i = pageStart; i <= pageEnd; i++) {
                  pages.push(
                    <button
                      key={i}
                      className={`pagination-num ${i === state.currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(i)}
                      style={{
                        padding: '8px 12px',
                        border: i === state.currentPage ? '2px solid #007bff' : '1px solid #ccc',
                        backgroundColor: i === state.currentPage ? '#007bff' : '#fff',
                        color: i === state.currentPage ? '#fff' : '#000',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        fontWeight: i === state.currentPage ? 'bold' : 'normal'
                      }}
                    >
                      {i}
                    </button>
                  );
                }
                return pages;
              })()}

              {/* 다음 페이지 그룹 (4개 다음) */}
              <button 
                className="pagination-group-next" 
                disabled={state.currentPage >= totalPages} 
                onClick={() => {
                  const pageStart = Math.max(1, state.currentPage - 2);
                  const nextStart = Math.min(totalPages, pageStart + 5);
                  handlePageChange(nextStart);
                }}
                title="다음 페이지 그룹"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  cursor: state.currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  opacity: state.currentPage >= totalPages ? 0.5 : 1,
                  fontWeight: 'bold'
                }}
              >
                {'▶▶'}
              </button>

              {/* 맨 마지막 페이지로 */}
              <button 
                className="pagination-edge-end" 
                disabled={state.currentPage >= totalPages} 
                onClick={() => handlePageChange(totalPages)}
                title="맨 마지막 페이지"
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f9f9f9',
                  cursor: state.currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  opacity: state.currentPage >= totalPages ? 0.5 : 1,
                  fontWeight: 'bold'
                }}
              >
                {'⏭'}
              </button>

              {/* 페이지 정보 표시 */}
              <span style={{ marginLeft: '20px', fontSize: '0.9rem', color: '#666' }}>
                {state.currentPage} / {totalPages}
              </span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Headhunting;
