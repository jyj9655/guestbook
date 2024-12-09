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
