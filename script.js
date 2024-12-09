// 별 생성
const starContainer = document.createElement("div");
starContainer.id = "background-stars";
document.body.appendChild(starContainer);

const MAX_STARS = 80; // 별 갯수 설정
const EXCLUDED_AREA = { top: 0, left: 25, width: 50, height: 100 }; // 중앙 영역 비율(%)

for (let i = 0; i < MAX_STARS; i++) {
    const star = document.createElement("div");
    star.className = "star";

    let top, left;

    // 별이 중앙 영역을 벗어날 때까지 반복
    do {
        top = Math.random() * 100; // 0% ~ 100%
        left = Math.random() * 100; // 0% ~ 100%
    } while (
        left > EXCLUDED_AREA.left &&
        left < EXCLUDED_AREA.left + EXCLUDED_AREA.width &&
        top > EXCLUDED_AREA.top &&
        top < EXCLUDED_AREA.top + EXCLUDED_AREA.height
    );

    // 랜덤 크기
    const size = Math.random() * 2 + 1; // 1px ~ 3px
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // 별 위치
    star.style.top = `${top}%`;
    star.style.left = `${left}%`;

    // 랜덤 반짝임 딜레이
    star.style.animationDelay = `${Math.random() * 4}s`;

    // 별 추가
    starContainer.appendChild(star);
}

// 팝업 열기 및 닫기
const openPopup = document.getElementById('openPopup');
const closePopup = document.getElementById('closePopup');
const popup = document.getElementById('popup');
const popupForm = document.getElementById('popupForm');
const apiUrl = '/.netlify/functions/proxy';

// 팝업 열기
openPopup.addEventListener('click', () => {
  popup.classList.remove('hidden');
  popup.style.display = 'flex';
});

// 팝업 닫기
closePopup.addEventListener('click', () => {
  popup.classList.add('hidden');
  popup.style.display = 'none';
});

// 방명록 데이터 로드
async function loadGuestbook() {
  try {
    const response = await fetch(apiUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    const guestbook = document.getElementById('guestbook');
    guestbook.innerHTML = data
      .map(
        (entry) => `
      <div class="entry">
        <strong>${entry.name}</strong>
        <div>${entry.message}</div>
        <small>${new Date(entry.timestamp).toLocaleString()}</small>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error loading guestbook:', error);
  }
}

// 방명록 작성 (비동기 처리)
popupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message').value;

  try {
    // 작성 중 상태 표시
    const submitButton = popupForm.querySelector('button[type="submit"]');
    submitButton.textContent = '작성 중...';
    submitButton.disabled = true;

    // API 호출
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password, message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 성공 처리
    alert('방명록이 등록되었습니다!');
    popupForm.reset(); // 폼 리셋
    popup.classList.add('hidden'); // 팝업 닫기
    popup.style.display = 'none';
    loadGuestbook(); // 방명록 새로고침
  } catch (error) {
    console.error('Error adding to guestbook:', error);
    alert('방명록 등록에 실패했습니다. 다시 시도해주세요.');
  } finally {
    // 작성 중 상태 해제
    const submitButton = popupForm.querySelector('button[type="submit"]');
    submitButton.textContent = '작성하기';
    submitButton.disabled = false;
  }
});

// 초기 데이터 로드
loadGuestbook();
