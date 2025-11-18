// 상태 관리
const state = {
    selectedRanks: [],
    selectedJobs: [],
    selectedCompanies: [],
    selectedRegions: [],
    editingSpecId: null // 수정 중인 스펙 ID
};

// 데이터
const data = {
    ranks: [
        "과장·차장급", "부장급", "팀장/매니저/실장", "파트장/그룹장",
        "임원/CEO", "주임·대리급", "본부장/센터장", "인턴"
    ],
    jobs: [
        // 개발자 그룹
        "개발자",
        "FE (프론트엔드)",
        "BE (백엔드)",
        "App (모바일 앱 개발)",
        "Data Engineer/Data Scientist",
        "",
        // 개발자 상세 그룹
        "DevOps (시스템 운영/배포 엔지니어)",
        "",
        // 기획자 그룹
        "PM/PO/기획자",
        "서비스 기획",
        "PO (프로덕트 오너)",
        "PM (프로젝트/프로덕트 매니저)",
        "",
        // 디자이너 그룹
        "UI/UX",
        "BX (브랜드 경험 디자이너)",
        "그래픽 디자이너",
        "모션 디자이너",
        "",
        // 데이터 그룹
        "데이터 분석가",
        "데이터 엔지니어",
        "머신러닝 엔지니어",
        "",
        // 인프라 그룹
        "인프라/클라우드",
        "클라우드",
        "보안",
        "",
        // QA 그룹
        "QA/테스터",
        "QA 테스트 엔지니어",
        "",
        // 마케터 그룹
        "마케터",
        "콘텐츠",
        "브랜드",
        "성장 마케터",
        "",
        // 경영/운영 그룹
        "경영/운영",
        "사업전략",
        "운영 매니저",
        "",
        // HR 그룹
        "HR/리크루터",
        "HR 매니저",
        "리크루터"
    ],
    companies: ["대기업", "중견기업", "중소기업", "외국계", "공기업", "벤처기업"],
    regions: [
        "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
        "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
    ]
};

// DOM 요소
const elements = {
    ranksGrid: document.getElementById('ranks-grid'),
    careerYears: document.getElementById('careerYears'),
    careerMonths: document.getElementById('careerMonths'),
    jobsGrid: document.getElementById('jobs-grid'),
    companiesGrid: document.getElementById('companies-grid'),
    regionsGrid: document.getElementById('regions-grid'),
    companiesCount: document.getElementById('companies-count'),
    regionsCount: document.getElementById('regions-count'),
    jobsCount: document.getElementById('jobs-count'),
    saveButton: document.getElementById('save-button'),
    companyNameInput: document.getElementById('companyNameInput'),
    companyNameConfirmBtn: document.getElementById('companyNameConfirmBtn'),
    companyNameDisplay: document.getElementById('companyNameDisplay'),
    careerConfirmBtn: document.getElementById('careerConfirmBtn'),
    careerDisplay: document.getElementById('careerDisplay')
};

// 토글 선택 함수
function toggleSelect(item, category, max = null) {
    const key = `selected${category}`;
    const selectedItems = state[key];

    // 단일 선택 모드: 이미 선택된 항목 클릭 시 해제, 다른 항목 클릭 시 교체
    if (selectedItems.includes(item)) {
        state[key] = [];
    } else {
        state[key] = [item];
    }

    // UI 업데이트
    renderButtons(category.toLowerCase());
    updateCounters();
}

// 버튼 렌더링 함수
function renderButtons(category) {
    const gridElement = elements[`${category}Grid`];
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
    if (elements.companiesCount) elements.companiesCount.textContent = state.selectedCompanies.length;
    if (elements.regionsCount) elements.regionsCount.textContent = state.selectedRegions.length;
    if (elements.jobsCount) elements.jobsCount.textContent = state.selectedJobs.length;
}

// 모든 그리드 버튼 상태를 현재 선택된 값에 맞게 업데이트
function updateAllGridButtons() {
    ['ranks', 'jobs', 'companies', 'regions'].forEach(category => {
        renderButtons(category);
    });
    updateCounters();
}

// 저장 버튼 이벤트 핸들러
function handleSave() {
    // 경력 입력값 가져오기
    const years = parseInt(elements.careerYears.value) || 0;
    const months = parseInt(elements.careerMonths.value) || 0;
    
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
    
    // 새 스펙 데이터 생성
    const newSpec = {
        id: state.editingSpecId || Date.now().toString(),
        ranks: state.selectedRanks,
        careers: [careerString],
        jobs: state.selectedJobs,
        companies: state.selectedCompanies,
        regions: state.selectedRegions,
        companyName: (elements.companyNameInput?.value || '').trim(),
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
    
    // Show modal (same design as profile.html). On confirm, navigate to profile.html
    const modal = document.getElementById('saveModal');
    const okBtn = document.getElementById('modalOk');
    if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');

        // Ensure we don't register multiple handlers
        okBtn.onclick = function () {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            // Navigate to profile page in same folder
            window.location.href = './profile.html';
        };
    } else {
        // Fallback: if modal is not present, use confirm as before
        const ok = confirm("✅ 수정사항이 저장되었습니다!\n\n확인을 누르면 프로필 페이지로 이동합니다.");
        if (ok) window.location.href = './profile.html';
    }
}

// 초기화 함수
function initialize() {
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
    ['ranks', 'jobs', 'companies', 'regions'].forEach(category => {
        renderButtons(category);
    });

    // 회사명 확인 버튼 동작
    if (elements.companyNameConfirmBtn) {
        elements.companyNameConfirmBtn.addEventListener('click', () => {
            const name = (elements.companyNameInput?.value || '').trim();
            if (elements.companyNameDisplay) elements.companyNameDisplay.textContent = name || '';
        });
    }

    // 경력 확인 버튼 동작
    if (elements.careerConfirmBtn) {
        elements.careerConfirmBtn.addEventListener('click', () => {
            const years = parseInt(elements.careerYears.value) || 0;
            const months = parseInt(elements.careerMonths.value) || 0;
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
            if (elements.careerDisplay) elements.careerDisplay.textContent = careerString;
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
        const career = spec.careers && spec.careers[0] ? spec.careers[0] : '경력 없음';
        const savedDate = spec.savedAt ? new Date(spec.savedAt).toLocaleDateString('ko-KR') : '';
        
        html += `
            <div class="spec-preview-box">
                <div class="spec-preview-header" onclick="toggleSpecContent('spec-${spec.id}')">
                    <div class="spec-preview-info">
                        <span class="preview-company">${companyName}</span>
                        <span class="preview-career">${career}</span>
                        ${savedDate ? `<span class="preview-modified">${savedDate}</span>` : ''}
                    </div>
                    <span class="toggle-icon">▼</span>
                </div>
                <div id="spec-${spec.id}" class="current-spec-content collapsed">
                    <div class="spec-section">
                        ${spec.ranks && spec.ranks.length > 0 ? `
                            <div class="spec-item">
                                <strong>직급:</strong> ${spec.ranks.join(', ')}
                            </div>
                        ` : ''}
                        ${spec.careers && spec.careers.length > 0 ? `
                            <div class="spec-item">
                                <strong>경력:</strong> ${spec.careers.join(', ')}
                            </div>
                        ` : ''}
                        ${spec.jobs && spec.jobs.length > 0 ? `
                            <div class="spec-item">
                                <strong>직무:</strong> ${spec.jobs.join(', ')}
                            </div>
                        ` : ''}
                        ${spec.companies && spec.companies.length > 0 ? `
                            <div class="spec-item">
                                <strong>기업형태:</strong> ${spec.companies.join(', ')}
                            </div>
                        ` : ''}
                        ${spec.regions && spec.regions.length > 0 ? `
                            <div class="spec-item">
                                <strong>지역:</strong> ${spec.regions.join(', ')}
                            </div>
                        ` : ''}
                        ${spec.companyName ? `
                            <div class="spec-item">
                                <strong>회사명:</strong> ${spec.companyName}
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
        state.selectedRanks = spec.ranks || [];
        state.selectedJobs = spec.jobs || [];
        state.selectedCompanies = spec.companies || [];
        state.selectedRegions = spec.regions || [];
        
        console.log('State updated:', state);
        
        // 경력 복원
        if (spec.careers && spec.careers.length > 0) {
            const careerStr = spec.careers[0];
            const yearMatch = careerStr.match(/(\d+)년/);
            const monthMatch = careerStr.match(/(\d+)개월/);
            
            if (yearMatch) elements.careerYears.value = yearMatch[1];
            if (monthMatch) elements.careerMonths.value = monthMatch[1];
        }
        
        // 회사명 복원
        if (spec.companyName && elements.companyNameInput) {
            elements.companyNameInput.value = spec.companyName;
            if (elements.companyNameDisplay) {
                elements.companyNameDisplay.textContent = spec.companyName;
            }
        }
        
        // 경력 확인 버튼 눌러서 표시
        if (spec.careers && spec.careers.length > 0 && elements.careerDisplay) {
            elements.careerDisplay.textContent = spec.careers[0];
        }
        
        // 모든 그리드 버튼 상태 업데이트
        updateAllGridButtons();
        
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
    state.selectedRanks = [];
    state.selectedJobs = [];
    state.selectedCompanies = [];
    state.selectedRegions = [];
    
    if (elements.careerYears) elements.careerYears.value = '';
    if (elements.careerMonths) elements.careerMonths.value = '';
    if (elements.companyNameInput) elements.companyNameInput.value = '';
    if (elements.careerDisplay) elements.careerDisplay.textContent = '';
    if (elements.companyNameDisplay) elements.companyNameDisplay.textContent = '';
    if (elements.saveButton) elements.saveButton.textContent = '저장하기';
    
    updateAllGridButtons();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initialize);