// 팝업 열기 및 닫기
const openPopup = document.getElementById('openPopup');
const closePopup = document.getElementById('closePopup');
const popup = document.getElementById('popup');

openPopup.addEventListener('click', () => {
  popup.classList.remove('hidden'); // 팝업 표시
  popup.style.display = 'flex'; // 팝업 보이기
});

closePopup.addEventListener('click', () => {
  popup.classList.add('hidden'); // 팝업 숨김 클래스 추가
  popup.style.display = 'none'; // 팝업 숨기기
});

// 방명록 데이터 로드
const apiUrl = '/.netlify/functions/proxy';

async function loadGuestbook() {
  try {
    const response = await fetch(apiUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    const guestbook = document.getElementById('guestbook');
    guestbook.innerHTML = data.map(entry => `
      <div class="entry">
        <strong>${entry.name}</strong>
        <div>${entry.message}</div>
        <small>${new Date(entry.timestamp).toLocaleString()}</small>
      </div>
    `).join('');
  } catch (error) {
    console.error("Error loading guestbook:", error);
  }
}

// 초기 데이터 로드
loadGuestbook();
