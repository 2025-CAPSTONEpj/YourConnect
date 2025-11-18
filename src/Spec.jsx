import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './spec.css';

function Spec() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    selectedRanks: [],
    selectedJobs: [],
    selectedCompanies: [],
    selectedRegions: [],
    editingSpecId: null
  });

  const [specs, setSpecs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [careerYears, setCareerYears] = useState(0);
  const [careerMonths, setCareerMonths] = useState(0);
  const [companyDisplay, setCompanyDisplay] = useState('');
  const [careerDisplay, setCareerDisplay] = useState('');

  const data = {
    ranks: [
      "과장·차장급", "부장급", "팀장/매니저/실장", "파트장/그룹장",
      "임원/CEO", "주임·대리급", "본부장/센터장", "인턴"
    ],
    jobs: [
      "개발자", "FE (프론트엔드)", "BE (백엔드)", "App (모바일 앱 개발)", "Data Engineer/Data Scientist", "",
      "DevOps (시스템 운영/배포 엔지니어)", "",
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
      "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
      "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
    ]
  };

  useEffect(() => {
    loadSpecs();
    // 페이지 포커스 시에도 다시 로드하여 최신 상태 유지
    window.addEventListener('focus', loadSpecs);
    return () => window.removeEventListener('focus', loadSpecs);
  }, []);

  const loadSpecs = () => {
    try {
      const savedSpecs = localStorage.getItem('userSpecs');
      console.log('📦 Loaded specs from localStorage:', savedSpecs);
      
      if (savedSpecs) {
        const parsed = JSON.parse(savedSpecs);
        const specsArray = Array.isArray(parsed) ? parsed : [parsed];
        const withIds = specsArray.map((spec, idx) => ({
          ...spec,
          id: spec.id || `legacy-${idx}`
        }));
        console.log('✅ Parsed specs:', withIds);
        setSpecs(withIds);
      } else {
        console.log('❌ No specs found in localStorage');
        setSpecs([]);
      }
    } catch (e) {
      console.error('⚠️ Error loading specs:', e);
      setSpecs([]);
    }
  };

  const toggleSelect = (item, category) => {
    setState(prevState => {
      const key = `selected${category}`;
      const selectedItems = prevState[key];

      const isSelected = selectedItems.includes(item);
      const newSelected = isSelected ? [] : [item];

      return {
        ...prevState,
        [key]: newSelected
      };
    });
  };

  const renderButtons = (category) => {
    const categoryLower = category.toLowerCase();
    const items = data[categoryLower];
    const key = `selected${category}`;
    const selectedItems = state[key];

    if (!items) {
      return <div>No items found for {category}</div>;
    }

    return items.map((item, idx) => {
      if (item === "") {
        return <button key={`sep-${idx}`} className="separator" disabled></button>;
      }

      const isSelected = selectedItems.includes(item);
      const isDisabled = !isSelected && selectedItems.length > 0;

      return (
        <button
          key={item}
          className={`${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
          disabled={isDisabled}
          onClick={() => toggleSelect(item, category)}
        >
          {item}
        </button>
      );
    });
  };

  const handleCompanyConfirm = () => {
    setCompanyDisplay(companyName.trim());
  };

  const handleCareerConfirm = () => {
    const years = parseInt(careerYears) || 0;
    const months = parseInt(careerMonths) || 0;

    let careerString = '';
    if (years === 0 && months === 0) {
      careerString = '';
    } else if (years === 0) {
      careerString = `${months}개월`;
    } else if (months === 0) {
      careerString = `${years}년`;
    } else {
      careerString = `${years}년 ${months}개월`;
    }

    setCareerDisplay(careerString);
  };

  const handleSave = () => {
    const years = parseInt(careerYears) || 0;
    const months = parseInt(careerMonths) || 0;

    let careerString = '';
    if (years === 0 && months === 0) {
      careerString = '경력 없음';
    } else if (years === 0) {
      careerString = `${months}개월`;
    } else if (months === 0) {
      careerString = `${years}년`;
    } else {
      careerString = `${years}년 ${months}개월`;
    }

    const newSpec = {
      id: state.editingSpecId || Date.now().toString(),
      ranks: state.selectedRanks,
      careers: [careerString],
      jobs: state.selectedJobs,
      companies: state.selectedCompanies,
      regions: state.selectedRegions,
      companyName: companyName.trim(),
      savedAt: new Date().toISOString()
    };

    console.log('💾 Saving new spec:', newSpec);

    let specsArray = [];
    const savedSpecs = localStorage.getItem('userSpecs');
    if (savedSpecs) {
      try {
        const parsed = JSON.parse(savedSpecs);
        specsArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        specsArray = [];
      }
    }

    if (state.editingSpecId) {
      const index = specsArray.findIndex(s => s.id === state.editingSpecId);
      if (index !== -1) {
        specsArray[index] = newSpec;
        console.log('🔄 Updated existing spec at index:', index);
      }
    } else {
      specsArray.push(newSpec);
      console.log('✨ Added new spec');
    }

    localStorage.setItem('userSpecs', JSON.stringify(specsArray));
    console.log('📝 All specs saved to localStorage:', specsArray);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/profile');
  };

  const handleEditSpec = (specId) => {
    const spec = specs.find(s => s.id === specId);
    if (spec) {
      setState({
        selectedRanks: spec.ranks || [],
        selectedJobs: spec.jobs || [],
        selectedCompanies: spec.companies || [],
        selectedRegions: spec.regions || [],
        editingSpecId: specId
      });
      setCompanyName(spec.companyName || '');
      if (spec.careers && spec.careers[0]) {
        const careerStr = spec.careers[0];
        const yearMatch = careerStr.match(/(\d+)년/);
        const monthMatch = careerStr.match(/(\d+)개월/);
        setCareerYears(yearMatch ? parseInt(yearMatch[1]) : 0);
        setCareerMonths(monthMatch ? parseInt(monthMatch[1]) : 0);
      }
    }
  };

  const handleDeleteSpec = (specId) => {
    if (window.confirm('이 스펙을 삭제하시겠습니까?')) {
      let specsArray = [];
      const savedSpecs = localStorage.getItem('userSpecs');
      if (savedSpecs) {
        try {
          const parsed = JSON.parse(savedSpecs);
          specsArray = Array.isArray(parsed) ? parsed : [parsed];
          specsArray = specsArray.filter(s => s.id !== specId);
          localStorage.setItem('userSpecs', JSON.stringify(specsArray));
          loadSpecs();
        } catch (e) {
          console.error('Error deleting spec:', e);
        }
      }
    }
  };

  const handleToggleSpec = (contentId) => {
    const content = document.getElementById(contentId);
    if (content) {
      content.classList.toggle('collapsed');
      const header = content.previousElementSibling;
      if (header) {
        const icon = header.querySelector('.toggle-icon');
        if (icon) {
          icon.textContent = content.classList.contains('collapsed') ? '▼' : '▲';
        }
      }
    }
  };

  return (
    <div className="spec-container">
      <h2>보유 스펙 수정</h2>

      <div id="currentSpecSummary" className="current-spec-summary">
        <h3>현재 등록된 스펙</h3>
        <div id="currentSpecsContainer">
          {specs.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>등록된 스펙이 없습니다.</p>
          ) : (
            specs.map(spec => (
              <div key={spec.id} className="spec-preview-box">
                <div className="spec-preview-header" onClick={() => handleToggleSpec(`spec-${spec.id}`)}>
                  <div className="spec-preview-info">
                    <span className="preview-company">{spec.companyName || '회사명 없음'}</span>
                    <span className="preview-career">
                      {spec.careers && spec.careers[0] ? spec.careers[0] : '경력 없음'}
                    </span>
                    {spec.savedAt && (
                      <span className="preview-modified">
                        {new Date(spec.savedAt).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  <span className="toggle-icon">▼</span>
                </div>
                <div id={`spec-${spec.id}`} className="current-spec-content collapsed">
                  <div className="spec-section">
                    {spec.ranks && spec.ranks.length > 0 && (
                      <div className="spec-item">
                        <strong>직급:</strong> {spec.ranks.join(', ')}
                      </div>
                    )}
                    {spec.careers && spec.careers.length > 0 && (
                      <div className="spec-item">
                        <strong>경력:</strong> {spec.careers.join(', ')}
                      </div>
                    )}
                    {spec.jobs && spec.jobs.length > 0 && (
                      <div className="spec-item">
                        <strong>직무:</strong> {spec.jobs.join(', ')}
                      </div>
                    )}
                    {spec.companies && spec.companies.length > 0 && (
                      <div className="spec-item">
                        <strong>기업형태:</strong> {spec.companies.join(', ')}
                      </div>
                    )}
                    {spec.regions && spec.regions.length > 0 && (
                      <div className="spec-item">
                        <strong>지역:</strong> {spec.regions.join(', ')}
                      </div>
                    )}
                    {spec.companyName && (
                      <div className="spec-item">
                        <strong>회사명:</strong> {spec.companyName}
                      </div>
                    )}
                  </div>
                  <div className="spec-actions">
                    <button className="edit-spec-btn" onClick={() => handleEditSpec(spec.id)}>
                      수정
                    </button>
                    <button className="delete-spec-btn" onClick={() => handleDeleteSpec(spec.id)}>
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="company-input-row">
        <label htmlFor="companyNameInput">회사명</label>
        <input
          type="text"
          id="companyNameInput"
          placeholder="회사명을 입력하세요"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <button type="button" id="companyNameConfirmBtn" className="confirm-btn" onClick={handleCompanyConfirm}>
          확인
        </button>
        <span id="companyNameDisplay" className="company-display">{companyDisplay}</span>
      </div>

      <section>
        <h3>직급/직책</h3>
        <div className="grid" id="ranks-grid">
          {renderButtons('Ranks')}
        </div>
      </section>

      <section>
        <h3>경력</h3>
        <div className="career-input-group">
          <div className="input-row">
            <input
              type="number"
              id="careerYears"
              min="0"
              max="50"
              placeholder="0"
              value={careerYears}
              onChange={(e) => setCareerYears(e.target.value)}
            />
            <span className="suffix">년</span>
          </div>
          <div className="input-row">
            <input
              type="number"
              id="careerMonths"
              min="0"
              max="11"
              placeholder="0"
              value={careerMonths}
              onChange={(e) => setCareerMonths(e.target.value)}
            />
            <span className="suffix">개월</span>
          </div>
          <button type="button" id="careerConfirmBtn" className="confirm-btn" onClick={handleCareerConfirm}>
            확인
          </button>
          <span id="careerDisplay" className="career-display">{careerDisplay}</span>
        </div>
      </section>

      <section>
        <h3>직무</h3>
        <div className="grid" id="jobs-grid">
          {renderButtons('Jobs')}
        </div>
      </section>

      <section>
        <h3>기업형태</h3>
        <div className="grid" id="companies-grid">
          {renderButtons('Companies')}
        </div>
      </section>

      <section>
        <h3>근무지역</h3>
        <div className="grid" id="regions-grid">
          {renderButtons('Regions')}
        </div>
      </section>

      <div className="save-box">
        <button className="save-btn" id="save-button" onClick={handleSave}>
          정보 저장하기
        </button>
      </div>

      {showModal && (
        <div id="saveModal" className="modal" aria-hidden="false">
          <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <p id="modalTitle">정보가 저장되었습니다</p>
            <button id="modalOk" className="save-btn" onClick={handleModalClose}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Spec;
