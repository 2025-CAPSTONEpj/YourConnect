// State management for all selectable grids
const state = {
    // 직무 (스펙과 동일 구조)
    selectedDuty: null,
    selectedSubDuty: null,
    // 기존 헤드헌팅 필터 상태
    selectedRanks: [],
    selectedCareers: [],
    selectedJobs: [],
    selectedCompanies: [],
    selectedRegions: [],
    searchKeyword: '',
    currentPage: 1,
    itemsPerPage: 9
};

// Data for all grids
const data = {
    // 스펙 페이지와 동일한 직무 대분류/세부조건
    duties: ["개발", "데이터", "인프라/플랫폼/Devops", "기획", "디자인", "QA/테스트"],
    subDuties: {
        "개발": ["FE", "BE", "APP"],
        "데이터": ["데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어"],
        "인프라/플랫폼/Devops": ["Devops", "클라우드", "보안"],
        "기획": ["서비스 기획", "PO", "PM"],
        "디자인": ["UIUX", "BX", "그래픽 디자이너", "모션 디자이너"],
        "QA/테스트": ["QA", "테스트 엔지니어"]
    },
    // 직급은 스펙 페이지와 동일한 메뉴로 사용
    ranks: ["사원", "주임", "대리", "과장", "차장", "부장", "임원"],
    careers: ["1년~3년", "3년~5년", "5년~7년", "7년~10년", "10년~15년", "15년~"],
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
        "전국", "서울", "경기", "인천", "대전", "세종", "충남", "충북", "광주",
        "전남", "전북", "대구", "경북", "부산", "울산", "경남", "강원", "제주"
    ]
};

// Job parent-child hierarchy (parent -> children array)
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

// Helper: get parent of a job if exists
function getJobParent(job) {
    for (const [parent, children] of Object.entries(jobHierarchy)) {
        if (children.includes(job)) return parent;
    }
    return null;
}

// Helper: check if a job should be disabled due to hierarchy
function isJobDisabledByHierarchy(job, selectedJobs) {
    // If job is a parent and any child is selected → disable parent
    if (jobHierarchy[job]) {
        return jobHierarchy[job].some(child => selectedJobs.includes(child));
    }
    // If job is a child and parent is selected → disable child
    const parent = getJobParent(job);
    if (parent && selectedJobs.includes(parent)) {
        return true;
    }
    return false;
}

// Maximum selections per category
function getMaxSelection(category) {
    const maxSelections = {
        ranks: 3,
        careers: 1,
        jobs: 5,
        companies: 2,
        regions: 2
    };
    return maxSelections[category];
}

// DOM elements
const elements = {
    headhuntDutyGrid: document.getElementById('headhunt-duty-grid'),
    headhuntSubDutyGrid: document.getElementById('headhunt-sub-duty-grid'),
    ranksGrid: document.getElementById('ranks-grid'),
    careersGrid: document.getElementById('careers-grid'),
    jobsGrid: document.getElementById('jobs-grid'),
    companiesGrid: document.getElementById('companies-grid'),
    regionsGrid: document.getElementById('regions-grid'),
    ranksCount: document.getElementById('ranks-count'),
    careersCount: document.getElementById('careers-count'),
    jobsCount: document.getElementById('jobs-count'),
    companiesCount: document.getElementById('companies-count'),
    regionsCount: document.getElementById('regions-count')
};

// Toggle selection is handled by event delegation (see listener below)


// Render buttons for a category
function renderButtons(category) {
    // 직무 대분류/세부조건은 요소 id가 headhunt-duty-grid / headhunt-sub-duty-grid 이므로 직접 매핑
    let gridElement;
    if (category === 'duties') {
        gridElement = elements.headhuntDutyGrid;
    } else if (category === 'subDuties') {
        gridElement = elements.headhuntSubDutyGrid;
    } else {
        gridElement = elements[`${category}Grid`];
    }
    if (!gridElement) return; // 요소 없으면 중단

    const items = data[category];
    const capitalized = category.charAt(0).toUpperCase() + category.slice(1);

    // 직무(대분류/세부)일 경우 별도 처리
    if (category === 'duties') {
        const selected = state.selectedDuty;
        gridElement.innerHTML = items.map(item => `
            <button type="button" class="${selected === item ? 'selected' : ''}" data-value="${item}">
                ${item}
            </button>
        `).join('');
        return;
    }

    if (category === 'subDuties') {
        const duty = state.selectedDuty;
        const subList = duty ? data.subDuties[duty] || [] : [];
        const selected = state.selectedSubDuty;
        gridElement.innerHTML = subList.map(sub => `
            <button type="button" class="${selected === sub ? 'selected' : ''}" data-value="${sub}">
                ${sub}
            </button>
        `).join('');
        return;
    }

    const selectedItems = state[`selected${capitalized}`];
    const max = getMaxSelection(category);
    const atMax = selectedItems.length >= max;

    gridElement.innerHTML = items.map(item => {
        // Separator / group break
        if (item === "") {
            return '<button class="separator"></button>';
        }

        const isSelected = selectedItems.includes(item);
        let disabled = false;
        
        // For jobs category, check hierarchy
        if (category === 'jobs') {
            disabled = isJobDisabledByHierarchy(item, selectedItems);
        }
        
        // For regions category, check "전국" logic
        if (category === 'regions') {
            if (item === '전국') {
                // Disable "전국" if any other region is selected
                disabled = selectedItems.some(r => r !== '전국');
            } else {
                // Disable other regions if "전국" is selected
                disabled = selectedItems.includes('전국');
            }
        }
        
        // Also disable if at max and not already selected
        if (!isSelected && atMax) {
            disabled = true;
        }

        const disabledClass = disabled ? 'disabled' : '';
        const disabledAttr = disabled ? 'disabled' : '';
        return `
            <button type="button" data-value="${item}" class="${isSelected ? 'selected' : ''} ${disabledClass}" ${disabledAttr}>${item}</button>
        `;
    }).join('');
}

// Update counters
function updateCounters() {
    Object.keys(state).forEach(key => {
        const category = key.replace('selected', '').toLowerCase();
        const countElement = elements[`${category}Count`];
        if (countElement) {
            countElement.textContent = state[key].length;
        }
    });
}

// Update "선택된 조건" summary chips
function updateSelectedSummary() {
    const selectedSection = document.querySelector('section.selected');
    if (!selectedSection) return;

    // Ensure chips container exists
    let chips = selectedSection.querySelector('.selected-chips');
    let placeholder = selectedSection.querySelector('.selected-placeholder');
    if (!chips) {
        chips = document.createElement('div');
        chips.className = 'selected-chips';
        selectedSection.appendChild(chips);
    }

    // Collect all selected items across categories (only array properties)
    const all = [];
    const categories = ['selectedRanks', 'selectedCareers', 'selectedJobs', 'selectedCompanies', 'selectedRegions'];
    
    categories.forEach(key => {
        const category = key.replace('selected', '').toLowerCase();
        const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
        state[key].forEach(value => {
            all.push({ category, capitalized, value });
        });
    });

    if (all.length === 0) {
        chips.innerHTML = '';
        chips.style.display = 'none';
        if (placeholder) {
            placeholder.style.display = 'block';
        }
        return;
    }

    chips.style.display = 'flex';
    if (placeholder) {
        placeholder.style.display = 'none';
    }

    chips.innerHTML = all.map(item => `
        <span class="chip" data-category="${item.category}" data-value="${item.value}">
          ${item.value}
          <button class="chip-remove" aria-label="삭제">×</button>
        </span>
    `).join('');
}

// Initialize all grids
document.addEventListener('DOMContentLoaded', () => {
    // 최초 로드시 직무 대분류/세부조건도 함께 렌더링
    ['duties', 'subDuties', 'ranks', 'careers', 'jobs', 'companies', 'regions'].forEach(category => {
        renderButtons(category);
    });
    updateCounters();
    updateSelectedSummary();
    
    // Show pagination on initial load and set to page 1
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.style.display = 'flex';
        // Initialize pagination to page 1 with prev button disabled
        updatePagination();
    }
    
    // Apply initial pagination to show only first 9 cards
    applyCurrentFilter();
});

// Event delegation: toggle .selected when any grid or options button is clicked
// Toggle selection with max enforcement
function toggleSelect(category, value) {
    const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
    const key = `selected${capitalized}`;
    const list = state[key];
    const max = getMaxSelection(category);

    const idx = list.indexOf(value);
    if (idx >= 0) {
        list.splice(idx, 1);
    } else {
        // Check if selection is blocked by hierarchy (jobs only)
        if (category === 'jobs') {
            if (isJobDisabledByHierarchy(value, list)) {
                return; // Cannot select due to parent/child conflict
            }
        }
        
        // Check if selection is blocked by "전국" logic (regions only)
        if (category === 'regions') {
            if (value === '전국' && list.length > 0) {
                return; // Cannot select "전국" if other regions are selected
            }
            if (value !== '전국' && list.includes('전국')) {
                return; // Cannot select other regions if "전국" is selected
            }
        }
        
        if (list.length >= max) {
            // Reached max; do nothing
            return;
        }
        list.push(value);
    }

    // Rerender affected grid, counters, and summary
    renderButtons(category);
    updateCounters();
    updateSelectedSummary();
    
    // Apply filtering based on selected conditions
    applyCurrentFilter();
}

// Grid button click handler (event delegation)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.grid button');
    if (!btn) return;
    if (btn.classList.contains('separator')) return;

    const grid = btn.closest('.grid');
    if (!grid || !grid.id.endsWith('-grid')) return;
    const category = grid.id.replace('-grid', '');
    const value = btn.dataset.value || btn.textContent.trim();

    // 헤드헌팅 직무(대분류/세부) 처리
    if (category === 'headhunt-duty') {
        state.selectedDuty = (state.selectedDuty === value) ? null : value;
        state.selectedSubDuty = null;
        renderButtons('duties');
        renderButtons('subDuties');
        updateSelectedSummary();
        // 직무는 아직 필터 조건에는 직접 쓰지 않으므로 여기서 종료
        return;
    }

    if (category === 'headhunt-sub-duty') {
        state.selectedSubDuty = (state.selectedSubDuty === value) ? null : value;
        renderButtons('subDuties');
        updateSelectedSummary();
        // 필요 시, selectedJobs와 연동하는 로직을 나중에 추가 가능
        return;
    }

    toggleSelect(category, value);
});

// Chip remove handler
document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.chip-remove');
    if (!removeBtn) return;
    const chip = removeBtn.closest('.chip');
    if (!chip) return;
    const category = chip.dataset.category;
    const value = chip.dataset.value;

    const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
    const key = `selected${capitalized}`;
    state[key] = state[key].filter(v => v !== value);
    renderButtons(category);
    updateCounters();
    updateSelectedSummary();
    
    // Apply filtering based on updated conditions
    applyCurrentFilter();
});

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const keyword = searchInput.value.trim();
            
            // Check if search input is empty
            if (!keyword) {
                alert('검색어를 작성해주세요.');
                return; // Do not proceed with search
            }
            
            state.searchKeyword = keyword;
            state.currentPage = 1; // Reset to first page on new search
            filterJobCards();
        });
        
        // Also trigger search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                
                // Check if search input is empty
                if (!keyword) {
                    alert('검색어를 작성해주세요.');
                    return; // Do not proceed with search
                }
                
                state.searchKeyword = keyword;
                state.currentPage = 1; // Reset to first page on new search
                filterJobCards();
            }
        });
    }
    
    // Reset button functionality
    if (resetBtn && searchInput) {
        resetBtn.addEventListener('click', () => {
            // Clear search input
            searchInput.value = '';
            // Reset search state
            state.searchKeyword = '';
            state.currentPage = 1;
            
            // Hide no-result message if visible
            const noResultMsg = document.querySelector('.no-result-message');
            if (noResultMsg) {
                noResultMsg.style.display = 'none';
            }
            
            // Reset total count
            const totalCountEl = document.getElementById('total-count');
            if (totalCountEl) {
                totalCountEl.textContent = '총 6,402건';
            }
            
            // Apply current filter state (will handle pagination correctly)
            applyCurrentFilter();
        });
    }
    
    // Pagination click handlers
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('pagination-num')) {
            const page = parseInt(e.target.dataset.page);
            if (!isNaN(page)) {
                state.currentPage = page;
                applyCurrentFilter();
            }
        }
        
        if (e.target.classList.contains('pagination-prev')) {
            if (state.currentPage > 1) {
                state.currentPage--;
                applyCurrentFilter();
            }
        }
        
        if (e.target.classList.contains('pagination-next')) {
            const totalPages = getTotalPages();
            if (state.currentPage < totalPages) {
                state.currentPage++;
                applyCurrentFilter();
            }
        }
    });
});

// Get total number of pages based on visible cards
function getTotalPages() {
    const allCards = document.querySelectorAll('.job-card');
    
    // Check if any filter is active
    const hasFilter = state.searchKeyword || 
                      state.selectedRanks.length > 0 || 
                      state.selectedCareers.length > 0 || 
                      state.selectedJobs.length > 0 || 
                      state.selectedCompanies.length > 0 || 
                      state.selectedRegions.length > 0;
    
    // If no filter, use total card count
    if (!hasFilter) {
        return Math.ceil(allCards.length / state.itemsPerPage);
    }
    
    // With filter, count visible cards
    let visibleCount = 0;
    allCards.forEach(card => {
        const style = window.getComputedStyle(card);
        if (style.display !== 'none') {
            visibleCount++;
        }
    });
    
    return Math.ceil(visibleCount / state.itemsPerPage);
}

// Update pagination UI
function updatePagination() {
    const totalPages = getTotalPages();
    const paginationNums = document.querySelectorAll('.pagination-num');
    const prevBtn = document.querySelector('.pagination-prev');
    const nextBtn = document.querySelector('.pagination-next');
    
    // Check if showing default total count (6,402)
    const totalCountEl = document.getElementById('total-count');
    const isDefaultTotal = totalCountEl && totalCountEl.textContent === '총 6,402건';
    
    // Update number buttons
    paginationNums.forEach((btn, index) => {
        const pageNum = index + 1;
        
        // If default total, enable all 5 pages
        if (isDefaultTotal || pageNum <= totalPages) {
            btn.classList.remove('disabled');
            btn.disabled = false;
            btn.classList.toggle('active', pageNum === state.currentPage);
        } else {
            btn.classList.add('disabled');
            btn.disabled = true;
            btn.classList.remove('active');
        }
    });
    
    // Update prev/next buttons
    if (prevBtn) {
        if (state.currentPage <= 1) {
            prevBtn.classList.add('disabled');
            prevBtn.disabled = true;
        } else {
            prevBtn.classList.remove('disabled');
            prevBtn.disabled = false;
        }
    }
    
    if (nextBtn) {
        // If default total, always enable next button (unless on last page)
        if (isDefaultTotal) {
            if (state.currentPage >= 5) {
                nextBtn.classList.add('disabled');
                nextBtn.disabled = true;
            } else {
                nextBtn.classList.remove('disabled');
                nextBtn.disabled = false;
            }
        } else {
            if (state.currentPage >= totalPages) {
                nextBtn.classList.add('disabled');
                nextBtn.disabled = true;
            } else {
                nextBtn.classList.remove('disabled');
                nextBtn.disabled = false;
            }
        }
    }
}

// Filter job cards based on search keyword
function filterJobCards() {
    const jobCards = document.querySelectorAll('.job-card');
    const keyword = state.searchKeyword.toLowerCase();
    const totalCountEl = document.getElementById('total-count');
    
    // 항상 메시지 상태 확인 및 초기화
    let noResultMsg = document.querySelector('.no-result-message');
    
    if (!keyword) {
        // No keyword: show all cards, no pagination
        jobCards.forEach(card => {
            card.style.display = 'flex';
        });
        
        if (totalCountEl) {
            totalCountEl.textContent = '총 6,402건';
        }
        
        // 메시지 숨김
        if (noResultMsg) {
            noResultMsg.style.display = 'none';
        }
        
        // Hide pagination when no search
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            pagination.style.display = 'none';
        }
        
        return;
    }
    
    // Filter and paginate cards
    let visibleCards = [];
    jobCards.forEach(card => {
        const title = card.querySelector('.job-info h4')?.textContent.toLowerCase() || '';
        const details = card.querySelector('.job-info p')?.textContent.toLowerCase() || '';
        const fullText = title + ' ' + details;
        
        if (fullText.includes(keyword)) {
            visibleCards.push(card);
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update total count
    const totalVisible = visibleCards.length;
    if (totalCountEl) {
        totalCountEl.textContent = `총 ${totalVisible}건`;
    }
    
    // 0건일 때 메시지 표시/숨김 처리 (검색어 기반)
    if (!noResultMsg) {
        noResultMsg = document.querySelector('.no-result-message');
    }
    if (totalVisible === 0) {
        if (!noResultMsg) {
            noResultMsg = document.createElement('div');
            noResultMsg.className = 'no-result-message';
            noResultMsg.textContent = '조건에 일치하는 공고가 존재하지 않습니다.';
            const jobList = document.querySelector('.job-list');
            const pagination = document.querySelector('.pagination');
            if (jobList && pagination) {
                jobList.insertBefore(noResultMsg, pagination);
            }
        }
        noResultMsg.style.display = 'block';
    } else {
        if (noResultMsg) {
            noResultMsg.style.display = 'none';
        }
    }
    
    // Show pagination if needed (45+ items or more than one page needed)
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        if (totalVisible === 0) {
            pagination.style.display = 'none';
        } else if (totalVisible >= 45 || totalVisible > state.itemsPerPage) {
            pagination.style.display = 'flex';
        } else {
            pagination.style.display = 'none';
        }
    }
    
    // Apply pagination to visible cards
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    
    visibleCards.forEach((card, index) => {
        if (index >= startIdx && index < endIdx) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update pagination UI
    updatePagination();
}

// Filter job cards based on selected conditions (auto-filter)
function filterJobCardsByConditions() {
    const jobCards = document.querySelectorAll('.job-card');
    const totalCountEl = document.getElementById('total-count');
    
    // 메시지 요소를 함수 시작 부분에서 가져오기
    let noResultMsg = document.querySelector('.no-result-message');
    
    // Check if any conditions are selected
    const hasConditions = state.selectedRanks.length > 0 || 
                          state.selectedCareers.length > 0 || 
                          state.selectedJobs.length > 0 || 
                          state.selectedCompanies.length > 0 || 
                          state.selectedRegions.length > 0;
    
    if (!hasConditions) {
        // No conditions: show all cards
        jobCards.forEach(card => {
            card.style.display = 'flex';
        });
        
        if (totalCountEl) {
            totalCountEl.textContent = '총 6,402건';
        }
        
        // 메시지 숨김
        if (noResultMsg) {
            noResultMsg.style.display = 'none';
        }
        
        // Hide pagination when no filter
        const pagination = document.querySelector('.pagination');
        if (pagination) {
            pagination.style.display = 'none';
        }
        
        return;
    }
    
    // Create keyword sets for matching
    const rankKeywords = new Set(state.selectedRanks.map(r => r.toLowerCase()));
    const careerKeywords = new Set(state.selectedCareers.map(c => c.toLowerCase()));
    const jobKeywords = new Set(state.selectedJobs.map(j => j.toLowerCase()));
    const companyKeywords = new Set(state.selectedCompanies.map(c => c.toLowerCase()));
    const regionKeywords = new Set(state.selectedRegions.map(r => r.toLowerCase()));
    
    // Filter cards
    let visibleCards = [];
    jobCards.forEach(card => {
        const title = card.querySelector('.job-info h4')?.textContent.toLowerCase() || '';
        const details = card.querySelector('.job-info p')?.textContent.toLowerCase() || '';
        const fullText = title + ' ' + details;
        
        let matches = true;
        
        // Check rank conditions (OR logic within category)
        if (rankKeywords.size > 0) {
            let rankMatch = false;
            for (const keyword of rankKeywords) {
                if (fullText.includes(keyword)) {
                    rankMatch = true;
                    break;
                }
            }
            if (!rankMatch) matches = false;
        }
        
        // Check career conditions
        if (careerKeywords.size > 0) {
            let careerMatch = false;
            for (const keyword of careerKeywords) {
                // Extract just the numbers for matching (e.g., "3년~5년" -> "3", "5")
                const yearMatch = keyword.match(/(\d+)년/g);
                if (yearMatch) {
                    for (const year of yearMatch) {
                        if (fullText.includes(year)) {
                            careerMatch = true;
                            break;
                        }
                    }
                }
                if (careerMatch) break;
            }
            if (!careerMatch) matches = false;
        }
        
        // Check job conditions
        if (jobKeywords.size > 0) {
            let jobMatch = false;
            for (const keyword of jobKeywords) {
                // Handle shortened forms and variations
                if (keyword.includes('fe') || keyword.includes('프론트엔드')) {
                    if (fullText.includes('프론트엔드') || fullText.includes('frontend') || fullText.includes('fe')) {
                        jobMatch = true;
                        break;
                    }
                } else if (keyword.includes('be') || keyword.includes('백엔드')) {
                    if (fullText.includes('백엔드') || fullText.includes('backend') || fullText.includes('be') || fullText.includes('java')) {
                        jobMatch = true;
                        break;
                    }
                } else if (keyword.includes('개발')) {
                    if (fullText.includes('개발')) {
                        jobMatch = true;
                        break;
                    }
                } else if (keyword.includes('pm') || keyword.includes('기획')) {
                    if (fullText.includes('pm') || fullText.includes('기획')) {
                        jobMatch = true;
                        break;
                    }
                } else if (keyword.includes('it')) {
                    if (fullText.includes('it')) {
                        jobMatch = true;
                        break;
                    }
                } else if (fullText.includes(keyword)) {
                    jobMatch = true;
                    break;
                }
            }
            if (!jobMatch) matches = false;
        }
        
        // Check company conditions
        if (companyKeywords.size > 0) {
            let companyMatch = false;
            for (const keyword of companyKeywords) {
                if (fullText.includes(keyword)) {
                    companyMatch = true;
                    break;
                }
            }
            if (!companyMatch) matches = false;
        }
        
        // Check region conditions
        if (regionKeywords.size > 0) {
            let regionMatch = false;
            for (const keyword of regionKeywords) {
                if (keyword === '전국' || fullText.includes(keyword)) {
                    regionMatch = true;
                    break;
                }
            }
            if (!regionMatch) matches = false;
        }
        
        if (matches) {
            visibleCards.push(card);
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update total count
    const totalVisible = visibleCards.length;
    if (totalCountEl) {
        totalCountEl.textContent = `총 ${totalVisible}건`;
    }
    
    // 0건일 때 메시지 표시/숨김 처리 (조건 필터 기반)
    if (!noResultMsg) {
        noResultMsg = document.querySelector('.no-result-message');
    }
    if (totalVisible === 0) {
        if (!noResultMsg) {
            noResultMsg = document.createElement('div');
            noResultMsg.className = 'no-result-message';
            noResultMsg.textContent = '조건에 일치하는 공고가 존재하지 않습니다.';
            const jobList = document.querySelector('.job-list');
            const pagination = document.querySelector('.pagination');
            if (jobList && pagination) {
                jobList.insertBefore(noResultMsg, pagination);
            }
        }
        noResultMsg.style.display = 'block';
    } else {
        if (noResultMsg) {
            noResultMsg.style.display = 'none';
        }
    }
    
    // Show pagination if needed (45+ items or more than one page needed)
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        if (totalVisible === 0) {
            pagination.style.display = 'none';
        } else if (totalVisible >= 45 || totalVisible > state.itemsPerPage) {
            pagination.style.display = 'flex';
        } else {
            pagination.style.display = 'none';
        }
    }
    
    // Apply pagination to visible cards
    state.currentPage = 1; // Reset to first page when filter changes
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    
    visibleCards.forEach((card, index) => {
        if (index >= startIdx && index < endIdx) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update pagination UI
    updatePagination();
}

// Helper function to apply current filter state (used by pagination)
function applyCurrentFilter() {
    // Check if search keyword exists
    if (state.searchKeyword) {
        filterJobCards();
        return;
    }
    
    // Check if any conditions are selected
    const hasConditions = state.selectedRanks.length > 0 || 
                          state.selectedCareers.length > 0 || 
                          state.selectedJobs.length > 0 || 
                          state.selectedCompanies.length > 0 || 
                          state.selectedRegions.length > 0;
    
    if (hasConditions) {
        filterJobCardsByConditions();
        return;
    }
    
    // No filters: apply pagination to all cards
    const jobCards = document.querySelectorAll('.job-card');
    const totalCountEl = document.getElementById('total-count');
    if (totalCountEl) {
        totalCountEl.textContent = '총 6,402건';
    }
    
    // Apply pagination
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    
    jobCards.forEach((card, index) => {
        if (index >= startIdx && index < endIdx) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
    
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.style.display = 'flex';
        updatePagination();
    }
}

// 드롭다운 토글 기능
document.addEventListener('DOMContentLoaded', function() {
    const collapsibleLabel = document.querySelector('.collapsible-label');
    const collapsibleContent = document.querySelector('.collapsible-content');
    const toggleBtn = document.querySelector('.toggle-btn');
    const toggleText = document.querySelector('.toggle-text');

    if (collapsibleLabel && collapsibleContent && toggleBtn && toggleText) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            collapsibleContent.classList.toggle('collapsed');
            toggleBtn.classList.toggle('expanded');
            
            if (toggleBtn.classList.contains('expanded')) {
                toggleText.textContent = '접기';
            } else {
                toggleText.textContent = '펼쳐보기';
            }
        });
    }
    
    // 보유 스펙 박스에 저장된 스펙 표시
    loadAndDisplaySpecs();
});

// 저장된 스펙 불러와서 표시
function loadAndDisplaySpecs() {
    const container = document.getElementById('specBoxesContainer');
    if (!container) return;
    
    const savedSpecs = localStorage.getItem('userSpecs');
    
    if (!savedSpecs) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">저장된 스펙이 없습니다.</p>';
        return;
    }
    
    try {
        const parsed = JSON.parse(savedSpecs);
        const specsArray = Array.isArray(parsed) ? parsed : [parsed];
        
        if (specsArray.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">저장된 스펙이 없습니다.</p>';
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
                <div class="headhunt-spec-box">
                    <div class="headhunt-spec-header" onclick="toggleHeadhuntSpec('headhunt-spec-${spec.id}')">
                        <div class="headhunt-spec-info">
                            <span class="preview-company">${companyName}</span>
                            <span class="preview-career">${duty}${subDuty ? ' > ' + subDuty : ''}</span>
                            ${savedDate ? `<span class="preview-modified">${savedDate}</span>` : ''}
                        </div>
                        <span class="toggle-icon">▼</span>
                    </div>
                    <div id="headhunt-spec-${spec.id}" class="headhunt-spec-content collapsed">
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
                            <button class="edit-spec-btn" onclick="editSpecFromHeadhunt('${spec.id}')">수정</button>
                            <button class="select-spec-btn" onclick="selectSpecForSearch('${spec.id}')">선택</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error('스펙 로드 오류:', e);
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">스펙 정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 헤드헌팅 스펙 박스 토글
function toggleHeadhuntSpec(contentId) {
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

// 스펙 선택하여 검색
function selectSpecForSearch(specId) {
    const savedSpecs = localStorage.getItem('userSpecs');
    if (!savedSpecs) return;
    
    try {
        const specsArray = JSON.parse(savedSpecs);
        const spec = specsArray.find(s => s.id === specId);
        if (!spec) return;
        
        // 기존 선택 상태 초기화
        state.selectedRanks = [];
        state.selectedCareers = [];
        state.selectedJobs = [];
        state.selectedCompanies = [];
        state.selectedRegions = [];
        state.searchKeyword = '';

        // 스펙 구조: spec.position, spec.career, spec.companyType, spec.region

        // 1) 직급 → ranks 그리드에 매핑
        if (spec.position) {
            // headhunting 데이터의 ranks 값과 spec.position(사원/주임/대리/과장/차장/부장/임원)을
            // 최대한 자연스럽게 매칭 (텍스트에 해당 단어가 포함되면 선택)
            data.ranks.forEach(rankLabel => {
                if (rankLabel.includes(spec.position)) {
                    state.selectedRanks.push(rankLabel);
                }
            });
        }

        // 2) 경력 → careers 그리드에 매핑
        if (spec.career && spec.career !== '경력 없음') {
            // spec.career 예: "3년 5개월", "4년", "8개월"
            const yearMatch = spec.career.match(/(\d+)년/);
            const years = yearMatch ? parseInt(yearMatch[1]) : 0;

            // headhunting의 careers 범위 중 최소 연차 기준으로 하나 선택
            // ["1년~3년", "3년~5년", "5년~7년", "7년~10년", "10년~15년", "15년~"]
            let careerLabel = null;
            if (years > 0) {
                if (years <= 3) careerLabel = '1년~3년';
                else if (years <= 5) careerLabel = '3년~5년';
                else if (years <= 7) careerLabel = '5년~7년';
                else if (years <= 10) careerLabel = '7년~10년';
                else if (years <= 15) careerLabel = '10년~15년';
                else careerLabel = '15년~';
            }

            if (careerLabel && data.careers.includes(careerLabel)) {
                state.selectedCareers = [careerLabel];
            }
        }

        // 3) 기업 형태 → companies 그리드에 매핑
        if (spec.companyType && data.companies.includes(spec.companyType)) {
            state.selectedCompanies = [spec.companyType];
        }

        // 4) 근무지역 → regions 그리드에 매핑
        if (spec.region && data.regions.includes(spec.region)) {
            state.selectedRegions = [spec.region];
        }

        // 그리드/카운트/요약 UI 다시 그림
        ['ranks', 'careers', 'jobs', 'companies', 'regions'].forEach(category => {
            renderButtons(category);
        });
        updateCounters();
        updateSelectedSummary();
        
        // 필터 적용 (선택한 스펙 조건으로 공고 필터링)
        state.currentPage = 1;
        filterJobCardsByConditions();
        
    } catch (e) {
        console.error('스펙 선택 오류:', e);
    }
}

// 헤드헌팅 페이지에서 스펙 수정 페이지로 이동
function editSpecFromHeadhunt(specId) {
    // 스펙 ID를 쿼리 파라미터로 전달하여 스펙 페이지로 이동
    window.location.href = `./spec.html?edit=${specId}`;
}

// 선택된 스펙으로 공고 필터링
function filterJobsBySelectedSpec(spec) {
    const allJobCards = document.querySelectorAll('.job-card');
    let visibleCount = 0;
    
    // 검색어 입력창 초기화
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // 경력 범위 계산
    let minCareer = null;
    if (spec.careers && spec.careers.length > 0) {
        const careerRange = parseCareerRange(spec.careers[0]);
        if (careerRange) {
            minCareer = careerRange.min;
        }
    }
    
    allJobCards.forEach(card => {
        const jobInfo = card.querySelector('.job-info p').textContent;
        const companyName = card.querySelector('.job-info h4').textContent;
        
        // 각 조건 체크
        let matchesCareer = true;
        if (minCareer !== null) {
            matchesCareer = checkCareerMatch(jobInfo, { min: minCareer });
        }
        
        let matchesCompany = !spec.companies || spec.companies.length === 0;
        if (spec.companies && spec.companies.length > 0) {
            for (let company of spec.companies) {
                if (checkCompanyMatch(companyName, company)) {
                    matchesCompany = true;
                    break;
                }
            }
        }
        
        let matchesJob = !spec.jobs || spec.jobs.length === 0;
        if (spec.jobs && spec.jobs.length > 0) {
            for (let job of spec.jobs) {
                if (checkJobMatch(jobInfo, job)) {
                    matchesJob = true;
                    break;
                }
            }
        }
        
        let matchesRegion = !spec.regions || spec.regions.length === 0;
        if (spec.regions && spec.regions.length > 0) {
            for (let region of spec.regions) {
                if (checkRegionMatch(jobInfo, region)) {
                    matchesRegion = true;
                    break;
                }
            }
        }
        
        // 모든 조건이 맞으면 표시
        if (matchesCareer && matchesCompany && matchesJob && matchesRegion) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // 총 건수 업데이트
    const totalCountEl = document.getElementById('total-count');
    if (totalCountEl) {
        totalCountEl.textContent = `총 ${visibleCount}건`;
    }
    
    // 페이지네이션 업데이트
    updatePaginationForSpec(visibleCount);
    
    // 0건일 때 메시지 표시
    let noResultMsg = document.querySelector('.no-result-message');
    if (visibleCount === 0) {
        if (!noResultMsg) {
            noResultMsg = document.createElement('div');
            noResultMsg.className = 'no-result-message';
            noResultMsg.textContent = '조건에 일치하는 공고가 존재하지 않습니다.';
            const jobList = document.querySelector('.job-list');
            const pagination = document.querySelector('.pagination');
            if (jobList && pagination) {
                jobList.insertBefore(noResultMsg, pagination);
            }
        }
        noResultMsg.style.display = 'block';
    } else {
        if (noResultMsg) {
            noResultMsg.style.display = 'none';
        }
    }
}

// 전역 함수로 등록
window.toggleHeadhuntSpec = toggleHeadhuntSpec;
window.selectSpecForSearch = selectSpecForSearch;
window.editSpecFromHeadhunt = editSpecFromHeadhunt;

// 보유 스펙 기반 필터링 함수
function filterJobsBySpec() {
    const allJobCards = document.querySelectorAll('.job-card');
    let visibleCount = 0;
    
    // 검색어 입력창 초기화
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // localStorage에서 저장된 스펙들 불러오기
    const savedSpecs = localStorage.getItem('userSpecs');
    if (!savedSpecs) {
        alert('저장된 스펙이 없습니다.');
        return;
    }
    
    let specsArray = [];
    try {
        const parsed = JSON.parse(savedSpecs);
        specsArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
        alert('스펙 정보를 불러오는 중 오류가 발생했습니다.');
        return;
    }
    
    if (specsArray.length === 0) {
        alert('저장된 스펙이 없습니다.');
        return;
    }
    
    // 모든 스펙의 조건을 수집 (OR 조건으로 처리)
    const allRanks = new Set();
    const allJobs = new Set();
    const allCompanies = new Set();
    const allRegions = new Set();
    let minCareer = null;
    
    specsArray.forEach(spec => {
        if (spec.ranks) spec.ranks.forEach(r => allRanks.add(r));
        if (spec.jobs) spec.jobs.forEach(j => allJobs.add(j));
        if (spec.companies) spec.companies.forEach(c => allCompanies.add(c));
        if (spec.regions) spec.regions.forEach(r => allRegions.add(r));
        
        // 최소 경력 계산
        if (spec.careers && spec.careers.length > 0) {
            const careerRange = parseCareerRange(spec.careers[0]);
            if (careerRange) {
                if (minCareer === null || careerRange.min < minCareer) {
                    minCareer = careerRange.min;
                }
            }
        }
    });
    
    allJobCards.forEach(card => {
        const jobInfo = card.querySelector('.job-info p').textContent;
        const companyName = card.querySelector('.job-info h4').textContent;
        
        // 각 조건 체크 (OR 조건)
        let matchesCareer = true;
        if (minCareer !== null) {
            matchesCareer = checkCareerMatch(jobInfo, { min: minCareer });
        }
        
        let matchesCompany = allCompanies.size === 0;
        for (let company of allCompanies) {
            if (checkCompanyMatch(companyName, company)) {
                matchesCompany = true;
                break;
            }
        }
        
        let matchesJob = allJobs.size === 0;
        for (let job of allJobs) {
            if (checkJobMatch(jobInfo, job)) {
                matchesJob = true;
                break;
            }
        }
        
        let matchesRegion = allRegions.size === 0;
        for (let region of allRegions) {
            if (checkRegionMatch(jobInfo, region)) {
                matchesRegion = true;
                break;
            }
        }
        
        // 모든 조건이 맞으면 표시
        if (matchesCareer && matchesCompany && matchesJob && matchesRegion) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // 총 건수 업데이트
    const totalCountEl = document.getElementById('total-count');
    if (totalCountEl) {
        totalCountEl.textContent = `총 ${visibleCount}건`;
    }
    
    // 페이지네이션 업데이트
    updatePaginationForSpec(visibleCount);
    
    // 0건일 때 메시지 표시
    let noResultMsg = document.querySelector('.no-result-message');
    if (visibleCount === 0) {
        if (!noResultMsg) {
            noResultMsg = document.createElement('div');
            noResultMsg.className = 'no-result-message';
            noResultMsg.textContent = '조건에 일치하는 공고가 존재하지 않습니다.';
            const jobList = document.querySelector('.job-list');
            const pagination = document.querySelector('.pagination');
            if (jobList && pagination) {
                jobList.insertBefore(noResultMsg, pagination);
            }
        }
        noResultMsg.style.display = 'block';
    } else {
        if (noResultMsg) {
            noResultMsg.style.display = 'none';
        }
    }
}

// 보유 스펙 검색 결과에 따른 페이지네이션 업데이트
function updatePaginationForSpec(totalCount) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    // 0건이면 페이지네이션 숨기기
    if (totalCount === 0) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    
    // 페이지당 9건 기준으로 필요한 페이지 수 계산
    const itemsPerPage = 9;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    // 페이지 번호 버튼들 가져오기
    const pageButtons = pagination.querySelectorAll('.pagination-num');
    const prevBtn = pagination.querySelector('.pagination-prev');
    const nextBtn = pagination.querySelector('.pagination-next');
    
    // 각 페이지 버튼 활성화/비활성화
    pageButtons.forEach((btn, index) => {
        const pageNum = index + 1;
        if (pageNum <= totalPages) {
            btn.style.display = 'inline-block';
            btn.disabled = false;
            btn.classList.remove('disabled');
            // 첫 페이지 활성화
            if (pageNum === 1) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        } else {
            btn.style.display = 'none';
        }
    });
    
    // 이전/다음 버튼 상태
    if (prevBtn) {
        prevBtn.classList.add('disabled');
        prevBtn.disabled = true;
    }
    
    if (nextBtn) {
        if (totalPages <= 1) {
            nextBtn.classList.add('disabled');
            nextBtn.disabled = true;
        } else {
            nextBtn.classList.remove('disabled');
            nextBtn.disabled = false;
        }
    }
}

// 경력 범위 파싱 (예: "3~5년" -> [3, 4, 5])
function parseCareerRange(careerStr) {
    if (careerStr === "1년~3년") return [1, 2, 3];
    if (careerStr === "3년~5년") return [3, 4, 5];
    if (careerStr === "5년~7년") return [5, 6, 7];
    if (careerStr === "7년~10년") return [7, 8, 9, 10];
    if (careerStr === "10년~15년") return [10, 11, 12, 13, 14, 15];
    if (careerStr === "15년~") return Array.from({length: 20}, (_, i) => i + 15); // 15~35년
    return [];
}

// 경력 매칭 체크
function checkCareerMatch(jobInfo, careerRange) {
    // "경력: 5년 이상" 또는 "경력: 3년 이상" 등의 패턴 파싱
    const careerMatch = jobInfo.match(/경력:\s*(\d+)년\s*이상/);
    if (!careerMatch) return false;
    
    const jobCareerYears = parseInt(careerMatch[1]);
    
    // 보유 스펙의 경력 범위 중 최소값 확인
    const minCareer = Math.min(...careerRange);
    
    // 공고의 "X년 이상" 조건과 보유 경력 비교
    // 예: 공고가 "3년 이상"이고 보유 경력이 3~5년이면 매칭
    return minCareer >= jobCareerYears;
}

// 기업 형태 매칭 체크
function checkCompanyMatch(jobTitle, specCompany) {
    const titleLower = jobTitle.toLowerCase();
    
    const companyKeywords = {
        "대기업": ["대기업"],
        "중견기업": ["중견기업", "중견"],
        "중소기업": ["중소기업", "중소"],
        "외국계": ["외국계"],
        "공기업": ["공기업", "공공기관"],
        "벤처기업": ["벤처", "스타트업", "벤처기업"]
    };
    
    const keywords = companyKeywords[specCompany] || [];
    return keywords.some(keyword => titleLower.includes(keyword.toLowerCase()));
}

// 직무 매칭 체크
function checkJobMatch(jobInfo, specJob) {
    // "직무: 프론트엔드 개발" 등의 패턴에서 직무 추출
    const jobMatch = jobInfo.match(/직무:\s*([^|]+)/);
    if (!jobMatch) return false;
    
    const jobText = jobMatch[1].trim().toLowerCase();
    
    // 직무 키워드 매칭 (대소문자 구분 없음)
    const jobKeywords = {
        "개발자": ["개발", "프론트엔드", "백엔드", "풀스택", "fe", "be", "frontend", "backend"],
        "PM/PO/기획자": ["기획", "pm", "po"],
        "데이터 분석가": ["데이터", "분석"],
        "인프라/클라우드": ["인프라", "클라우드", "시스템", "운영"],
        "UI/UX": ["디자인", "ui", "ux"],
        "마케터": ["마케팅", "마케터"],
        "QA/테스터": ["qa", "테스트"],
        "HR/리크루터": ["hr", "인사"]
    };
    
    const keywords = jobKeywords[specJob] || [specJob.toLowerCase()];
    return keywords.some(keyword => jobText.includes(keyword));
}

// 지역 매칭 체크
function checkRegionMatch(jobInfo, specRegion) {
    // "지역: 서울" 등의 패턴에서 지역 추출
    const regionMatch = jobInfo.match(/지역:\s*([^|]+)/);
    if (!regionMatch) return false;
    
    const regionText = regionMatch[1].trim();
    return regionText.includes(specRegion);
}