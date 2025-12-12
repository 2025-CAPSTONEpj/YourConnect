import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './spec.css';

function Spec() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    selectedDuties: [],
    selectedSubDuty: null,
    selectedPosition: null,
    selectedRegion: null,
    editingSpecId: null
  });

  const [specs, setSpecs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [careerYears, setCareerYears] = useState(0);
  const [careerMonths, setCareerMonths] = useState(0);
  const [showDetailBox, setShowDetailBox] = useState(false);
  const [showAdditionalBox, setShowAdditionalBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  const data = {
    duties: ["개발", "데이터", "인공지능/머신러닝", "디자인", "QA/테스트"],
    subDuties: {
      "개발": ["FE", "BE", "APP"],
      "데이터": ["데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어"],
      "인공지능/머신러닝": ["머신러닝 엔지니어", "AI 연구원", "데이터 사이언티스트"],
      "디자인": ["UIUX", "BX", "그래픽 디자이너", "모션 디자이너"],
      "QA/테스트": ["QA", "테스트 엔지니어"]
    },
    positions: ["신입", "주임", "대리", "과장", "차장", "부장", "임원"],
    regions: [
      "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
      "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
    ]
  };

  useEffect(() => {
    // 페이지 로드 시 스펙 로드
    console.log('🔄 Spec component mounted, loading specs...');
    loadSpecs();
  }, []);

  const loadSpecs = async () => {
    try {
      setLoading(true);
      
      // localStorage에서 이전 사용자의 스펙 데이터 정리
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('userSpecs_')) {
          localStorage.removeItem(key);
        }
      });
      
      const token = localStorage.getItem('access_token');
      console.log('🔑 Token being used:', token);
      
      const response = await fetch(`${API_BASE_URL}/api/specs/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`스펙 로드 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Full API response:', data);
      console.log('📦 Loaded specs from server:', data.specs);
      console.log('📊 Current logged-in user from token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
      if (data.specs && data.specs.length > 0) {
        const formattedSpecs = data.specs.map(spec => {
          // description에서 duty와 subDuty 파싱 (형식: "개발 - FE")
          let duty = '';
          let subDuty = '';
          
          if (spec.description) {
            const parts = spec.description.split(' - ');
            duty = parts[0] || '';
            subDuty = parts[1] || '';
          }
          
          return {
            id: spec.id,
            duty: duty,
            subDuty: subDuty,
            companyName: spec.company,
            career: spec.career_type || '경력 없음',
            position: spec.role,
            region: spec.region || '',
            skills: spec.skills || '',
            savedAt: spec.created_at
          };
        });
        console.log('✅ Formatted specs:', formattedSpecs);
        setSpecs(formattedSpecs);
      } else {
        console.log('❌ No specs found');
        setSpecs([]);
      }
    } catch (e) {
      console.error('⚠️ Error loading specs:', e);
      setError(e.message);
      setSpecs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (item, category) => {
    setState(prevState => {
      const key = `selected${category}`;
      const selectedItems = prevState[key];

      if (category === 'Duties') {
        // 직무는 단일 선택 - 이미 선택된 항목을 다시 클릭하면 해제, 다른 항목 클릭하면 변경
        const isCurrentlySelected = selectedItems?.includes(item);
        const newSelected = isCurrentlySelected ? [] : [item];
        
        if (newSelected.length > 0) {
          return {
            ...prevState,
            selectedDuties: newSelected,
            selectedSubDuty: null,
            showDetailBox: true,
            showAdditionalBox: false
          };
        } else {
          return {
            ...prevState,
            selectedDuties: [],
            selectedSubDuty: null,
            showDetailBox: false,
            showAdditionalBox: false
          };
        }
      }

      return prevState;
    });
  };

  const selectSubDuty = (subDuty) => {
    setState(prevState => {
      if (prevState.selectedSubDuty === subDuty) {
        return {
          ...prevState,
          selectedSubDuty: null,
          showAdditionalBox: false
        };
      } else {
        return {
          ...prevState,
          selectedSubDuty: subDuty,
          showAdditionalBox: true
        };
      }
    });
  };

  const selectItem = (item, stateKey) => {
    console.log(`🔘 Selecting item: ${item}, stateKey: ${stateKey}`);
    setState(prevState => {
      const currentValue = prevState[stateKey];
      console.log(`   Current value: ${currentValue}, New value: ${currentValue === item ? 'null' : item}`);
      return {
        ...prevState,
        [stateKey]: currentValue === item ? null : item
      };
    });
  };

  const renderButtons = (category) => {
    const items = data[category];
    let selectedItems;
    
    // 카테고리별로 올바른 state 키 매핑
    if (category === 'duties') {
      selectedItems = state.selectedDuties;
    } else {
      const key = `selected${category.charAt(0).toUpperCase() + category.slice(1)}`;
      selectedItems = state[key];
    }

    if (!items) {
      return <div>No items found for {category}</div>;
    }

    return items.map((item, idx) => {
      const isSelected = selectedItems?.includes(item);

      return (
        <button
          key={idx}
          className={isSelected ? 'selected' : ''}
          onClick={() => toggleSelect(item, category === 'duties' ? 'Duties' : category.charAt(0).toUpperCase() + category.slice(1))}
        >
          {item}
        </button>
      );
    });
  };

  const renderSelectionButtons = (items, selectedItem, stateKey) => {
    return items.map((item, idx) => {
      const isSelected = selectedItem === item;
      
      return (
        <button
          key={idx}
          className={isSelected ? 'selected' : ''}
          onClick={() => selectItem(item, stateKey)}
        >
          {item}
        </button>
      );
    });
  };

  const handleSave = async () => {
    // 필수 필드 검증
    if (!state.selectedDuties || state.selectedDuties.length === 0) {
      alert('직무를 선택해주세요.');
      return;
    }
    
    if (!state.selectedSubDuty) {
      alert('세부 직무를 선택해주세요.');
      return;
    }

    const years = parseInt(careerYears) || 0;
    const months = parseInt(careerMonths) || 0;

    // 경력 문자열 생성
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

    // 경력 기간을 기반으로 start_date와 end_date 계산
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);
    startDate.setMonth(startDate.getMonth() - months);

    const newSpec = {
      company: companyName.trim(),
      role: state.selectedPosition || '',
      region: state.selectedRegion || '',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      career_type: careerString,
      skills: state.selectedSubDuty || '',
      description: `${state.selectedDuties[0]} - ${state.selectedSubDuty}`
    };

    console.log('💾 Saving new spec to server:', newSpec);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/api/specs/save/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSpec)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '스펙 저장 실패');
      }

      const data = await response.json();
      console.log('✨ Spec saved successfully:', data);
      alert('스펙이 저장되었습니다!');

    } catch (e) {
      console.error('❌ Error saving spec:', e);
      alert(`오류: ${e.message}`);
      return;
    }
    
    // 폼 초기화
    setState({
      selectedDuties: [],
      selectedSubDuty: null,
      selectedPosition: null,
      selectedRegion: null,
      showDetailBox: false,
      showAdditionalBox: false,
      editingSpecId: null
    });
    setCompanyName('');
    setCareerYears('');
    setCareerMonths('');
    
    // 스펙 목록 다시 로드
    loadSpecs();
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/profile');
  };

  const handleEditSpec = (specId) => {
    const spec = specs.find(s => s.id === specId);
    if (spec) {
      console.log('🔧 Editing spec:', spec);
      
      const duty = spec.duty || '';
      const subDuty = spec.subDuty || '';
      
      setState({
        selectedDuties: duty ? [duty] : [],
        selectedSubDuty: subDuty || null,
        selectedPosition: spec.position || null,
        selectedRegion: spec.region || null,
        showDetailBox: !!duty,
        showAdditionalBox: !!subDuty,
        editingSpecId: specId
      });
      
      setCompanyName(spec.companyName || '');
      
      // career 필드에서 년도와 월 추출
      let years = 0;
      let months = 0;
      
      const yearMatch = spec.career?.match(/(\d+)년/);
      const monthMatch = spec.career?.match(/(\d+)개월/);
      
      if (yearMatch) {
        years = parseInt(yearMatch[1]);
      }
      if (monthMatch) {
        months = parseInt(monthMatch[1]);
      }
      
      setCareerYears(years.toString());
      setCareerMonths(months.toString());
      
      // 페이지 상단(직무 선택 영역)으로 스크롤
      setTimeout(() => {
        const dutySection = document.querySelector('.spec-container section');
        if (dutySection) {
          dutySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleDeleteSpec = async (specId) => {
    if (window.confirm('이 스펙을 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/api/specs/${specId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '스펙 삭제 실패');
        }

        console.log('🗑️ Spec deleted:', specId);
        alert('스펙이 삭제되었습니다!');
        loadSpecs();
      } catch (e) {
        console.error('Error deleting spec:', e);
        alert(`오류: ${e.message}`);
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
          {loading ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>로딩 중...</p>
          ) : specs.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>등록된 스펙이 없습니다.</p>
          ) : (
            specs.map(spec => (
              <div key={spec.id} className="spec-preview-box">
                <div className="spec-preview-header" onClick={() => handleToggleSpec(`spec-${spec.id}`)}>
                  <div className="spec-preview-info">
                    <span className="preview-company">{spec.companyName || '회사명 없음'}</span>
                    <span className="preview-career">
                      {spec.career || '경력 없음'}
                    </span>
                  </div>
                  <span className="toggle-icon">▼</span>
                </div>
                <div id={`spec-${spec.id}`} className="current-spec-content collapsed">
                  <div className="spec-section">
                    {spec.duty && (
                      <div className="spec-item">
                        <strong>직무:</strong> {spec.duty}
                      </div>
                    )}
                    {spec.subDuty && (
                      <div className="spec-item">
                        <strong>세부직무:</strong> {spec.subDuty}
                      </div>
                    )}
                    {spec.position && (
                      <div className="spec-item">
                        <strong>직급:</strong> {spec.position}
                      </div>
                    )}
                    {spec.career && (
                      <div className="spec-item">
                        <strong>경력:</strong> {spec.career}
                      </div>
                    )}
                    <div className="spec-item">
                      <strong>지역:</strong> {spec.region ? spec.region : '미선택'}
                    </div>
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
      </div>

      <section>
        <h3>직무</h3>
        <div className="grid" id="duties-grid">
          {renderButtons('duties')}
        </div>
      </section>

      {state.showDetailBox && (
        <section className="detail-box">
          <h3>세부 직무</h3>
          <div className="grid" id="sub-duties-grid">
            {state.selectedDuties[0] && data.subDuties[state.selectedDuties[0]]?.map((subDuty, idx) => (
              <button
                key={idx}
                className={state.selectedSubDuty === subDuty ? 'selected' : ''}
                onClick={() => selectSubDuty(subDuty)}
              >
                {subDuty}
              </button>
            ))}
          </div>
        </section>
      )}

      {state.showDetailBox && (
        <div className="additional-box">
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
            </div>
          </section>

          <section>
            <h3>직급/직책</h3>
            <div className="grid" id="positions-grid">
              {renderSelectionButtons(data.positions, state.selectedPosition, 'selectedPosition')}
            </div>
          </section>

          <section>
            <h3>근무지역</h3>
            <div className="grid" id="regions-grid">
              {renderSelectionButtons(data.regions, state.selectedRegion, 'selectedRegion')}
            </div>
          </section>
        </div>
      )}

      <div className="save-box">
        <button 
          className="save-btn" 
          id="save-button" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '저장 중...' : '정보 저장하기'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
          {error}
        </div>
      )}

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
