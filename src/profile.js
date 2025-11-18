document.addEventListener('DOMContentLoaded', function () {
  // 기존 모달 기능
  const form = document.querySelector('.profile-detail form');
  const modal = document.getElementById('saveModal');
  const okBtn = document.getElementById('modalOk');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
  });

  okBtn.addEventListener('click', function () {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  });

  // 스펙 정보 표시 기능
  loadAndDisplaySpecs();

  // 히스토리로 돌아왔을 때 또는 페이지가 다시 보여질 때 최신 스펙 반영
  window.addEventListener('pageshow', function() {
    loadAndDisplaySpecs();
  });
});

function loadAndDisplaySpecs() {
  const specDisplay = document.getElementById('specDisplay');
  const specContent = document.getElementById('specContent');
  
  // 박스는 항상 표시
  specDisplay.style.display = 'block';
  
  const savedSpecs = localStorage.getItem('userSpecs');
  
  // 저장된 스펙이 없는 경우
  if (!savedSpecs) {
    specContent.innerHTML = `
      <div class="no-spec-container">
        <p class="no-spec-message">아직 작성된 정보가 없습니다.</p>
        <button class="create-spec-btn" onclick="createSpec()">작성하기</button>
      </div>
    `;
    return;
  }

  try {
    const parsed = JSON.parse(savedSpecs);
    const specsArray = Array.isArray(parsed) ? parsed : [parsed];
    
    // 스펙이 하나라도 있으면 표시
    if (specsArray.length > 0) {
      // 총 경력 계산 (모든 스펙의 경력을 합산)
      let totalYears = 0;
      let totalMonths = 0;
      
      specsArray.forEach(spec => {
        if (spec.careers && spec.careers.length > 0) {
          const careerStr = spec.careers[0];
          const yearMatch = careerStr.match(/(\d+)년/);
          const monthMatch = careerStr.match(/(\d+)개월/);
          
          if (yearMatch) totalYears += parseInt(yearMatch[1]);
          if (monthMatch) totalMonths += parseInt(monthMatch[1]);
        }
      });
      
      // 개월을 년으로 변환
      totalYears += Math.floor(totalMonths / 12);
      totalMonths = totalMonths % 12;
      
      let totalCareerStr = '';
      if (totalYears === 0 && totalMonths === 0) {
        totalCareerStr = '경력 없음';
      } else if (totalYears === 0) {
        totalCareerStr = `${totalMonths}개월`;
      } else if (totalMonths === 0) {
        totalCareerStr = `${totalYears}년`;
      } else {
        totalCareerStr = `${totalYears}년 ${totalMonths}개월`;
      }
      
      let html = `
        <div class="spec-items-list">
          <div class="total-career">
            <strong>총 경력:</strong> ${totalCareerStr}
          </div>
          <button class="edit-btn" onclick="editSpec()">스펙 수정</button>
        </div>
      `;
      
      specContent.innerHTML = html;
    } else {
      specContent.innerHTML = `
        <div class="no-spec-container">
          <p class="no-spec-message">아직 작성된 정보가 없습니다.</p>
          <button class="create-spec-btn" onclick="createSpec()">작성하기</button>
        </div>
      `;
    }
  } catch (e) {
    specContent.innerHTML = '<p class="no-spec-message">스펙 정보를 불러오는 중 오류가 발생했습니다.</p>';
  }
}

function editSpec() {
  // 스펙 수정 페이지로 이동 (이미 선택된 값들이 spec.js에서 로드됨)
  window.location.href = './spec.html';
}

function createSpec() {
  // 스펙 작성 페이지로 이동
  window.location.href = './spec.html';
}
