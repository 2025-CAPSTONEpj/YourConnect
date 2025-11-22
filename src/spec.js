// 상태 관리
const state = {
    selectedDuties: [],
    selectedSubDuty: null,
    selectedPosition: null,
    selectedCompanyType: null,
    selectedRegion: null,
    careerYears: '',
    careerMonths: '',
    specCompanyName: '',
    editingSpecId: null // 수정 중인 스펙 ID
};

// 데이터
const data = {
    duties: ["개발", "데이터", "인프라/플랫폼/Devops", "기획", "디자인", "QA/테스트"],
    regions: [
        "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
        "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
    ],
    subDuties: {
        "개발": ["FE", "BE", "APP"],
        "데이터": ["데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어"],
        "인프라/플랫폼/Devops": ["Devops", "클라우드", "보안"],
        "기획": ["서비스 기획", "PO", "PM"],
        "디자인": ["UIUX", "BX", "그래픽 디자이너", "모션 디자이너"],
        "QA/테스트": ["QA", "테스트 엔지니어"]
    },
    positions: ["사원", "주임", "대리", "과장", "차장", "부장", "임원"],
    companyTypes: ["대기업", "중견기업", "중소기업", "외국계", "공기업", "벤처기업"]
};

// DOM 요소
let elements = {};

function initializeElements() {
    elements = {
        dutyGrid: document.getElementById('duty-grid'),
        detailBox: document.getElementById('detail-box'),
        subDutyGrid: document.getElementById('sub-duty-grid'),
        additionalBox: document.getElementById('additional-box'),
        saveButton: document.getElementById('save-button')
    };
}

// 토글 선택 함수
function toggleSelect(item, category, max = null) {
    const key = `selected${category}`;
    const selectedItems = state[key];

    // 단일 선택 모드: 이미 선택된 항목 클릭 시 해제, 다른 항목 클릭 시 교체
    if (selectedItems.includes(item)) {
        state[key] = [];
        if (category === 'Duties') {
            state.selectedSubDuty = null;
            hideDetailBox();
        }
    } else {
        state[key] = [item];
        if (category === 'Duties') {
            state.selectedSubDuty = null;
            showDetailBox(item);
        }
    }

    // UI 업데이트
    renderButtons(category.toLowerCase());
    updateCounters();
}

// 세부 조건 박스 표시
function showDetailBox(duty) {
    if (!elements.detailBox || !elements.subDutyGrid) return;
    
    const subDuties = data.subDuties[duty];
    if (!subDuties) return;
    
    elements.detailBox.style.display = 'block';
    elements.subDutyGrid.innerHTML = subDuties.map(subDuty => `
        <button 
            class="${state.selectedSubDuty === subDuty ? 'selected' : ''}"
            onclick="selectSubDuty('${subDuty}')"
        >
            ${subDuty}
        </button>
    `).join('');
}

// 세부 조건 박스 숨기기
function hideDetailBox() {
    if (!elements.detailBox || !elements.subDutyGrid) return;
    elements.detailBox.style.display = 'none';
    elements.subDutyGrid.innerHTML = '';
}

// 세부 직무 선택
function selectSubDuty(subDuty) {
    if (state.selectedSubDuty === subDuty) {
        state.selectedSubDuty = null;
        hideAdditionalBox();
    } else {
        state.selectedSubDuty = subDuty;
        showAdditionalBox();
    }
    
    // 선택된 주 직무 가져오기
    const mainDuty = state.selectedDuties[0];
    if (mainDuty) {
        showDetailBox(mainDuty);
    }
}

// 추가 정보 박스 표시
function showAdditionalBox() {
    if (!elements.additionalBox) return;
    
    elements.additionalBox.style.display = 'block';
    
    // 직급 버튼 렌더링
    renderSelectionButtons('positions', 'position-grid', 'Position');
    
    // 기업 형태 버튼 렌더링
    renderSelectionButtons('companyTypes', 'company-type-grid', 'CompanyType');
    
    // 근무지역 버튼 렌더링
    renderSelectionButtons('regions', 'region-grid', 'Region');
    
    // 회사명 입력 이벤트
    const specCompanyNameBtn = document.getElementById('specCompanyNameBtn');
    if (specCompanyNameBtn) {
        specCompanyNameBtn.onclick = () => {
            const input = document.getElementById('specCompanyNameInput');
            if (input && input.value.trim()) {
                state.specCompanyName = input.value.trim();
            }
        };
    }
    
    // 경력 입력 이벤트
    const careerYearsInput = document.getElementById('careerYears');
    const careerMonthsInput = document.getElementById('careerMonths');
    if (careerYearsInput) {
        careerYearsInput.oninput = (e) => {
            state.careerYears = e.target.value;
        };
    }
    if (careerMonthsInput) {
        careerMonthsInput.oninput = (e) => {
            state.careerMonths = e.target.value;
        };
    }
}

// 추가 정보 박스 숨기기
function hideAdditionalBox() {
    if (!elements.additionalBox) return;
    elements.additionalBox.style.display = 'none';
}

// 선택 버튼 렌더링 (직급, 기업형태, 근무지역)
function renderSelectionButtons(dataKey, gridId, stateKey) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    const items = data[dataKey];
    const selectedItem = state[`selected${stateKey}`];
    
    grid.innerHTML = items.map(item => `
        <button
            class="${selectedItem === item ? 'selected' : ''}"
            onclick="selectItem('${item}', '${stateKey}')"
        >
            ${item}
        </button>
    `).join('');
}

// 아이템 선택 (직급, 기업형태, 근무지역)
function selectItem(item, stateKey) {
    const fullKey = `selected${stateKey}`;
    
    if (state[fullKey] === item) {
        state[fullKey] = null;
    } else {
        state[fullKey] = item;
    }
    
    // 해당 그리드만 다시 렌더링
    const gridMap = {
        'Position': 'position-grid',
        'CompanyType': 'company-type-grid',
        'Region': 'region-grid'
    };
    
    const dataMap = {
        'Position': 'positions',
        'CompanyType': 'companyTypes',
        'Region': 'regions'
    };
    
    renderSelectionButtons(dataMap[stateKey], gridMap[stateKey], stateKey);
}

// 버튼 렌더링 함수
function renderButtons(category) {
    // category가 'duties'이면 'duty'로 변환
    const gridKey = category === 'duties' ? 'duty' : category;
    const gridElement = elements[`${gridKey}Grid`];
    if (!gridElement) {
        console.error(`Grid element not found for category: ${category}`);
        return;
    }
    
    const items = data[category];
    const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
    const selectedItems = state[`selected${capitalized}`];

    gridElement.innerHTML = items.map(item => {
        // separator / group break
        if (item === "") {
            return '<button class="separator"></button>';
        }

        const isSelected = selectedItems.includes(item);
        // 단일 선택: 하나 선택되면 다른 버튼들 비활성화
        const isDisabled = !isSelected && selectedItems.length > 0;
        
        return `
            <button
                class="${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}"
                onclick="toggleSelect('${item}', '${capitalized}', ${getMaxSelection(category)})"
                ${isDisabled ? 'disabled' : ''}
            >
                ${item}
            </button>
        `;
    }).join('');
}

// 최대 선택 개수 반환
function getMaxSelection(category) {
    const maxSelections = {
        duties: 3,
        ranks: 1,
        careers: 1,
        jobs: 1,
        companies: 1,
        regions: 1
    };
    return maxSelections[category];
}

// 카운터 업데이트
function updateCounters() {
    if (elements.regionsCount) elements.regionsCount.textContent = state.selectedRegions.length;
}

// 모든 그리드 버튼 상태를 현재 선택된 값에 맞게 업데이트
function updateAllGridButtons() {
    ['duties', 'regions'].forEach(category => {
        renderButtons(category);
    });
    updateCounters();
}

// 저장 버튼 이벤트 핸들러
function handleSave() {
    // 경력 입력값 가져오기
    const careerYearsInput = document.getElementById('careerYears');
    const careerMonthsInput = document.getElementById('careerMonths');
    const years = parseInt(careerYearsInput?.value) || 0;
    const months = parseInt(careerMonthsInput?.value) || 0;
    
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
    
    // 회사명 입력값 가져오기
    const specCompanyNameInput = document.getElementById('specCompanyNameInput');
    const companyName = specCompanyNameInput?.value?.trim() || '';
    
    // 새 스펙 데이터 생성
    const newSpec = {
        id: state.editingSpecId || Date.now().toString(),
        duty: state.selectedDuties[0] || '',
        subDuty: state.selectedSubDuty || '',
        companyName: companyName,
        career: careerString,
        position: state.selectedPosition || '',
        companyType: state.selectedCompanyType || '',
        region: state.selectedRegion || '',
        savedAt: new Date().toISOString()
    };
    
    // 기존 스펙 배열 가져오기
    let specsArray = [];
    const savedSpecs = localStorage.getItem('userSpecs');
    if (savedSpecs) {
        try {
            const parsed = JSON.parse(savedSpecs);
            // 기존 단일 객체를 배열로 변환
            specsArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
            specsArray = [];
        }
    }
    
    if (state.editingSpecId) {
        // 기존 스펙 수정
        const index = specsArray.findIndex(s => s.id === state.editingSpecId);
        if (index !== -1) {
            specsArray[index] = newSpec;
        }
    } else {
        // 새 스펙 추가
        specsArray.push(newSpec);
    }
    
    localStorage.setItem('userSpecs', JSON.stringify(specsArray));
    
    // 모달 표시
    const modal = document.getElementById('saveModal');
    const okBtn = document.getElementById('modalOk');
    if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';

        okBtn.onclick = function () {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            window.location.href = './profile.html';
        };
    }
}

// 초기화 함수
function initialize() {
    // DOM 요소 초기화
    initializeElements();
    
    // localStorage에서 저장된 스펙 불러오기
    const savedSpecs = localStorage.getItem('userSpecs');
    let specsArray = [];
    
    if (savedSpecs) {
        try {
            const parsed = JSON.parse(savedSpecs);
            specsArray = Array.isArray(parsed) ? parsed : [parsed];
            // 기존 단일 객체에 ID 추가 (마이그레이션)
            specsArray = specsArray.map((spec, idx) => ({
                ...spec,
                id: spec.id || `legacy-${idx}`
            }));
        } catch (e) {
            specsArray = [];
        }
    }
    
    // URL 파라미터에서 edit 값 확인
    const urlParams = new URLSearchParams(window.location.search);
    const editSpecId = urlParams.get('edit');
    
    // 현재 등록된 스펙들 표시
    displayAllSpecs(specsArray);
    
    // 모든 그리드 렌더링
    renderButtons('duties');

    // 회사명 확인 버튼 동작
    if (elements.companyNameConfirmBtn) {
        elements.companyNameConfirmBtn.addEventListener('click', () => {
            const name = (elements.companyNameInput?.value || '').trim();
            if (elements.companyNameDisplay) elements.companyNameDisplay.textContent = name || '';
        });
    }

    // 저장 버튼 이벤트 리스너
    elements.saveButton.addEventListener('click', handleSave);
    // 초기 카운터 업데이트
    updateCounters();
    
    // URL 파라미터로 수정 모드인 경우 자동으로 해당 스펙 로드
    if (editSpecId) {
        editSpec(editSpecId);
    }
}

// 모든 스펙 표시
function displayAllSpecs(specsArray) {
    const container = document.getElementById('currentSpecsContainer');
    if (!container) return;
    
    if (!specsArray || specsArray.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">등록된 스펙이 없습니다.</p>';
        return;
    }
    
    let html = '';
    specsArray.forEach((spec, index) => {
        const companyName = spec.companyName || '회사명 없음';
        const career = spec.career || '경력 없음';
        const duty = spec.duty || '직무 없음';
        const subDuty = spec.subDuty || '';
        const position = spec.position || '';
        const companyType = spec.companyType || '';
        const region = spec.region || '';
        const savedDate = spec.savedAt ? new Date(spec.savedAt).toLocaleDateString('ko-KR') : '';
        
        html += `
            <div class="spec-preview-box">
                <div class="spec-preview-header" onclick="toggleSpecContent('spec-${spec.id}')">
                    <div class="spec-preview-info">
                        <span class="preview-company">${companyName}</span>
                        <span class="preview-career">${duty}${subDuty ? ' > ' + subDuty : ''}</span>
                        ${savedDate ? `<span class="preview-modified">${savedDate}</span>` : ''}
                    </div>
                    <span class="toggle-icon">▼</span>
                </div>
                <div id="spec-${spec.id}" class="current-spec-content collapsed">
                    <div class="spec-section">
                        ${duty ? `
                            <div class="spec-item">
                                <strong>직무:</strong> ${duty}${subDuty ? ' > ' + subDuty : ''}
                            </div>
                        ` : ''}
                        ${companyName && companyName !== '회사명 없음' ? `
                            <div class="spec-item">
                                <strong>회사명:</strong> ${companyName}
                            </div>
                        ` : ''}
                        ${career && career !== '경력 없음' ? `
                            <div class="spec-item">
                                <strong>경력:</strong> ${career}
                            </div>
                        ` : ''}
                        ${position ? `
                            <div class="spec-item">
                                <strong>직급:</strong> ${position}
                            </div>
                        ` : ''}
                        ${companyType ? `
                            <div class="spec-item">
                                <strong>기업 형태:</strong> ${companyType}
                            </div>
                        ` : ''}
                        ${region ? `
                            <div class="spec-item">
                                <strong>근무지역:</strong> ${region}
                            </div>
                        ` : ''}
                    </div>
                    <div class="spec-actions">
                        <button class="edit-spec-btn" onclick="editSpec('${spec.id}')">수정</button>
                        <button class="delete-spec-btn" onclick="deleteSpec('${spec.id}')">삭제</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 개별 스펙 접기/펼치기
function toggleSpecContent(contentId) {
    const content = document.getElementById(contentId);
    const header = content?.previousElementSibling;
    
    if (content) {
        content.classList.toggle('collapsed');
        if (header) {
            const icon = header.querySelector('.toggle-icon');
            if (icon) {
                icon.textContent = content.classList.contains('collapsed') ? '▼' : '▲';
            }
        }
    }
}

// 스펙 수정
function editSpec(specId) {
    console.log('editSpec called with ID:', specId);
    const savedSpecs = localStorage.getItem('userSpecs');
    if (!savedSpecs) {
        console.error('No saved specs found');
        return;
    }
    
    try {
        const specsArray = JSON.parse(savedSpecs);
        console.log('All specs:', specsArray);
        console.log('Looking for spec with ID:', specId);
        
        const spec = specsArray.find(s => s.id === specId);
        if (!spec) {
            console.error('Spec not found with ID:', specId);
            console.log('Available IDs:', specsArray.map(s => s.id));
            return;
        }
        
        console.log('Found spec:', spec);
        
        // 수정 모드로 전환
        state.editingSpecId = specId;
        state.selectedDuties = spec.duty ? [spec.duty] : [];
        state.selectedSubDuty = spec.subDuty || null;
        state.selectedPosition = spec.position || null;
        state.selectedCompanyType = spec.companyType || null;
        state.selectedRegion = spec.region || null;
        
        console.log('State updated:', state);
        
        // 직무 버튼 렌더링
        renderButtons('duties');
        
        // 직무가 선택되어 있으면 세부 조건 표시
        if (spec.duty) {
            showDetailBox(spec.duty);
        }
        
        // 세부 조건이 선택되어 있으면 추가 정보 표시
        if (spec.subDuty) {
            showAdditionalBox();
        }
        
        // 회사명 복원
        const specCompanyNameInput = document.getElementById('specCompanyNameInput');
        if (spec.companyName && specCompanyNameInput) {
            specCompanyNameInput.value = spec.companyName;
        }
        
        // 경력 복원
        if (spec.career && spec.career !== '경력 없음') {
            const careerYearsInput = document.getElementById('careerYears');
            const careerMonthsInput = document.getElementById('careerMonths');
            
            // "년 월" 형식 파싱
            const yearMatch = spec.career.match(/(\d+)년/);
            const monthMatch = spec.career.match(/(\d+)개월/);
            
            if (careerYearsInput && yearMatch) {
                careerYearsInput.value = yearMatch[1];
                state.careerYears = yearMatch[1];
            }
            if (careerMonthsInput && monthMatch) {
                careerMonthsInput.value = monthMatch[1];
                state.careerMonths = monthMatch[1];
            }
        }
        
        // 저장 버튼 텍스트 변경
        if (elements.saveButton) {
            elements.saveButton.textContent = '수정 완료';
        }
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (e) {
        console.error('스펙 수정 오류:', e);
    }
}

// 스펙 삭제
function deleteSpec(specId) {
    console.log('deleteSpec called with:', specId);
    
    if (!confirm('이 스펙을 삭제하시겠습니까?')) {
        console.log('User cancelled deletion');
        return;
    }
    
    const savedSpecs = localStorage.getItem('userSpecs');
    if (!savedSpecs) {
        console.log('No specs found in localStorage');
        return;
    }
    
    try {
        let specsArray = JSON.parse(savedSpecs);
        console.log('Before delete:', specsArray);
        console.log('Filtering out spec with id:', specId);
        
        const beforeCount = specsArray.length;
        specsArray = specsArray.filter(s => {
            console.log('Comparing:', s.id, '!==', specId, ':', s.id !== specId);
            return s.id !== specId;
        });
        const afterCount = specsArray.length;
        
        console.log('After delete:', specsArray);
        console.log('Deleted count:', beforeCount - afterCount);
        
        localStorage.setItem('userSpecs', JSON.stringify(specsArray));
        console.log('localStorage updated');
        
        // 삭제한 스펙을 수정 중이었다면 초기화
        if (state.editingSpecId === specId) {
            resetForm();
        }
        
        // 페이지 새로고침으로 확실하게 업데이트
        window.location.reload();
        
    } catch (e) {
        console.error('스펙 삭제 오류:', e);
        alert('스펙 삭제 중 오류가 발생했습니다.');
    }
}

// 전역 함수로 등록 (HTML onclick에서 사용)
window.toggleSpecContent = toggleSpecContent;
window.editSpec = editSpec;
window.deleteSpec = deleteSpec;

// 폼 초기화
function resetForm() {
    state.editingSpecId = null;
    state.selectedDuties = [];
    state.selectedRegions = [];
    
    if (elements.companyNameInput) elements.companyNameInput.value = '';
    if (elements.companyNameDisplay) elements.companyNameDisplay.textContent = '';
    if (elements.saveButton) elements.saveButton.textContent = '저장하기';
    
    updateAllGridButtons();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initialize);