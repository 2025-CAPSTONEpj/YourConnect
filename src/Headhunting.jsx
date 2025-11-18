import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './headhunting.css';

function Headhunting() {
  const [state, setState] = useState({
    selectedRanks: [],
    selectedCareers: [],
    selectedJobs: [],
    selectedCompanies: [],
    selectedRegions: [],
    searchKeyword: '',
    currentPage: 1,
    itemsPerPage: 9
  });

  const data = {
    ranks: [
      "과장·차장급", "부장급", "팀장/매니저/실장", "파트장/그룹장",
      "임원/CEO", "주임·대리급", "본부장/센터장", "인턴"
    ],
    careers: ["1년~3년", "3년~5년", "5년~7년", "7년~10년", "10년~15년", "15년~"],
    jobs: [
      "개발자", "FE (프론트엔드)", "BE (백엔드)", "App (모바일 앱 개발)", "Data Engineer/Data Scientist",
      "", "DevOps (시스템 운영/배포 엔지니어)", "",
      "PM/PO/기획자", "서비스 기획", "PO (프로덕트 오너)", "PM (프로젝트/프로덕트 매니저)", "",
      "UI/UX", "BX (브랜드 경험 디자이너)", "그래픽 디자이너", "모션 디자이너", "",
      "데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어", "",
      "인프라/클라우드", "클라우드", "보안", "",
      "QA/테스터", "QA 테스트 엔지니어", "",
      "마케터", "콘텐츠", "브랜드", "성장 마케터", "",
      "경영/운영", "사업전략", "운영 매니저", "",
      "HR/리크루터", "HR 매니저", "리크루터"
    ],
    companies: ["대기업", "중견기업", "중소기업", "외국계", "공기업", "벤처기업"],
    regions: [
      "전국", "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
      "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
    ]
  };

  const jobHierarchy = {
    "개발자": ["FE (프론트엔드)", "BE (백엔드)", "App (모바일 앱 개발)", "Data Engineer/Data Scientist", "DevOps (시스템 운영/배포 엔지니어)"],
    "PM/PO/기획자": ["서비스 기획", "PO (프로덕트 오너)", "PM (프로젝트/프로덕트 매니저)"],
    "UI/UX": ["BX (브랜드 경험 디자이너)", "그래픽 디자이너", "모션 디자이너"],
    "데이터 분석가": ["데이터 엔지니어", "머신러닝 엔지니어"],
    "인프라/클라우드": ["클라우드", "보안"],
    "마케터": ["콘텐츠", "브랜드", "성장 마케터"],
    "경영/운영": ["사업전략", "운영 매니저"],
    "HR/리크루터": ["HR 매니저", "리크루터"]
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
  const [visibleCards, setVisibleCards] = useState(jobPostings);
  const [totalCount, setTotalCount] = useState(jobPostings.length);

  const getJobParent = (job) => {
    for (const [parent, children] of Object.entries(jobHierarchy)) {
      if (children.includes(job)) return parent;
    }
    return null;
  };

  const isJobDisabledByHierarchy = (job, selectedJobs) => {
    if (jobHierarchy[job]) {
      return jobHierarchy[job].some(child => selectedJobs.includes(child));
    }
    const parent = getJobParent(job);
    if (parent && selectedJobs.includes(parent)) {
      return true;
    }
    return false;
  };

  const getMaxSelection = (category) => {
    const maxSelections = {
      ranks: 3,
      careers: 1,
      jobs: 5,
      companies: 2,
      regions: 2
    };
    return maxSelections[category];
  };

  const toggleSelect = (category, value) => {
    setState(prevState => {
      const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}`;
      const list = [...prevState[key]];
      const max = getMaxSelection(category);

      const idx = list.indexOf(value);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        if (category === 'jobs' && isJobDisabledByHierarchy(value, list)) {
          return prevState;
        }

        if (category === 'regions') {
          if (value === '전국' && list.length > 0) {
            return prevState;
          }
          if (value !== '전국' && list.includes('전국')) {
            return prevState;
          }
        }

        if (list.length >= max) {
          return prevState;
        }
        list.push(value);
      }

      return {
        ...prevState,
        [key]: list,
        currentPage: 1
      };
    });
  };

  const renderButtons = (category) => {
    const items = data[category];
    const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}`;
    const selectedItems = state[key];
    const max = getMaxSelection(category);
    const atMax = selectedItems.length >= max;

    return items.map((item, idx) => {
      if (item === "") {
        return <button key={`sep-${idx}`} className="separator" disabled></button>;
      }

      const isSelected = selectedItems.includes(item);
      let disabled = false;

      if (category === 'jobs') {
        disabled = isJobDisabledByHierarchy(item, selectedItems);
      }

      if (category === 'regions') {
        if (item === '전국') {
          disabled = selectedItems.some(r => r !== '전국');
        } else {
          disabled = selectedItems.includes('전국');
        }
      }

      if (!isSelected && atMax) {
        disabled = true;
      }

      return (
        <button
          key={item}
          className={`${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          disabled={disabled}
          onClick={() => toggleSelect(category, item)}
        >
          {item}
        </button>
      );
    });
  };

  useEffect(() => {
    // Apply filtering and pagination
    let filtered = jobPostings;
    const keyword = state.searchKeyword.toLowerCase();

    if (keyword) {
      filtered = jobPostings.filter(job => {
        const fullText = (job.title + ' ' + job.info).toLowerCase();
        return fullText.includes(keyword);
      });
    } else {
      // Apply condition filters
      const hasConditions = state.selectedRanks.length > 0 || state.selectedCareers.length > 0 || 
                            state.selectedJobs.length > 0 || state.selectedCompanies.length > 0 || 
                            state.selectedRegions.length > 0;

      if (hasConditions) {
        filtered = jobPostings.filter(job => {
          const fullText = (job.title + ' ' + job.info).toLowerCase();
          
          // Simple matching logic for demo
          return true; // In production, implement full matching logic
        });
      }
    }

    setTotalCount(filtered.length);

    // Apply pagination
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    setVisibleCards(filtered.slice(startIdx, endIdx));
  }, [state.searchKeyword, state.selectedRanks, state.selectedCareers, state.selectedJobs, state.selectedCompanies, state.selectedRegions, state.currentPage]);

  const handleSearch = () => {
    const input = document.getElementById('search-input');
    if (!input.value.trim()) {
      alert('검색어를 작성해주세요.');
      return;
    }
    setState(prev => ({ ...prev, searchKeyword: input.value.trim(), currentPage: 1 }));
  };

  const handleReset = () => {
    const input = document.getElementById('search-input');
    input.value = '';
    setState(prev => ({
      ...prev,
      searchKeyword: '',
      selectedRanks: [],
      selectedCareers: [],
      selectedJobs: [],
      selectedCompanies: [],
      selectedRegions: [],
      currentPage: 1
    }));
  };

  return (
    <main className="headhunt-layout">
      <aside className="headhunt-sidebar">
        <div className="profile-box">
          <img className="profile-img" src="https://www.gravatar.com/avatar/?d=mp&s=100" alt="기본 프로필 이미지" />
          <div className="profile-info">
            <h3>이가윤님</h3>
            <p><Link to="/profile" className="profile-edit">회원정보 수정 ⚙️</Link></p>
          </div>
        </div>

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
        <h2>헤드헌팅 채용 정보</h2>
        {/* 보유 스펙 박스 추가 */}
        <section className="spec-box" style={{margin: '32px 0 24px 0', padding: '32px 0', background: '#fafafa', borderRadius: '12px', textAlign: 'center'}}>
          <h3 style={{fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px'}}>보유 스펙</h3>
          <p style={{color: '#666', fontSize: '1.08rem'}}>저장된 스펙이 없습니다.</p>
        </section>
        <section className="filter-section isolated">
          <h3 className="filter-section-title">원하는 직무 선택</h3>

          <div className="filter-group">
            <label>직급 / 직책 ({state.selectedRanks.length}/3)</label>
            <div className="grid">{renderButtons('ranks')}</div>
          </div>

          <div className="filter-group">
            <label>경력 ({state.selectedCareers.length}/1)</label>
            <div className="grid">{renderButtons('careers')}</div>
          </div>

          <div className="filter-group">
            <label className="collapsible-label">
              직무 ({state.selectedJobs.length}/5)
              <button className="toggle-btn" type="button" onClick={() => setCollapsedJobs(!collapsedJobs)}>
                <span className="toggle-text">{collapsedJobs ? '펼쳐보기' : '접기'}</span>
              </button>
            </label>
            <div className={`grid collapsible-content ${collapsedJobs ? 'collapsed' : ''}`}>{renderButtons('jobs')}</div>
          </div>

          <div className="filter-group">
            <label>기업형태 ({state.selectedCompanies.length}/2)</label>
            <div className="grid">{renderButtons('companies')}</div>
          </div>

          <div className="filter-group">
            <label>근무지역 ({state.selectedRegions.length}/2)</label>
            <div className="grid">{renderButtons('regions')}</div>
          </div>

          <section className="selected">
            <label>선택된 조건</label>
            <div className="selected-chips">
              {[...state.selectedRanks, ...state.selectedCareers, ...state.selectedJobs, ...state.selectedCompanies, ...state.selectedRegions].map(chip => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
            {(state.selectedRanks.length + state.selectedCareers.length + state.selectedJobs.length + state.selectedCompanies.length + state.selectedRegions.length) === 0 && (
              <p className="selected-placeholder">현재 선택된 조건이 없습니다.</p>
            )}
          </section>
        </section>

        <div className="filter-group search-group">
          <label>검색어</label>
          <input type="text" id="search-input" placeholder="채용직무, 기업명, 키워드 등을 입력하세요." />
          <button className="search-btn" onClick={handleSearch}>검색</button>
          <button className="reset-btn" onClick={handleReset}>초기화</button>
        </div>

        <section className="job-list">
          <h3 id="total-count">총 {totalCount}건</h3>

          {visibleCards.map((job, idx) => (
            <div key={idx} className="job-card">
              <div className="job-info">
                <h4>{job.title}</h4>
                <p>{job.info}</p>
              </div>
              <button className="apply-btn">지원 공고 확인</button>
            </div>
          ))}

          <div className="pagination" style={{ display: totalCount > 0 ? 'flex' : 'none' }}>
            <button className="pagination-prev" disabled={state.currentPage <= 1} onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}>{'<'}</button>
            {[1, 2, 3, 4, 5].map(page => (
              <button
                key={page}
                className={`pagination-num ${page === state.currentPage ? 'active' : ''}`}
                onClick={() => setState(prev => ({ ...prev, currentPage: page }))}
              >
                {page}
              </button>
            ))}
            <button className="pagination-next" disabled={state.currentPage >= 5} onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}>{'>'}</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Headhunting;
