# Google Sheets로 만드는 방명록

이 프로젝트는 Google Sheets와 Google Apps Script를 활용해 간단한 방명록을 구현한 것입니다.  
사용자는 이름과 메시지를 입력하면 Google Sheets에 데이터가 저장되고, 저장된 데이터를 웹 페이지에서 확인할 수 있습니다.  
간단한 서버리스 환경을 구성해보고자 이 프로젝트를 시작했습니다.

---

## 프로젝트 개요

### 기능:
- 사용자 입력(이름, 메시지)을 Google Sheets에 저장.
- 저장된 데이터를 웹 페이지에 표시.
- 입력과 조회는 실시간으로 동작.
- CORS 문제를 해결하기 위해 Netlify Functions를 사용.

### 사용 기술:
- **Google Sheets**: 데이터 저장소.
- **Google Apps Script**: 데이터 처리 및 API 생성.
- **HTML, CSS, JavaScript**: 웹 페이지 구현.
- **Netlify Functions**: CORS 문제 해결 및 API 프록시.

---

## 프로젝트 구조

```bash
project-root/
  ├── index.html          # 웹 인터페이스
  ├── netlify.toml        # Netlify 설정 파일
  ├── netlify/
  │    └── functions/
  │         └── proxy.js  # Netlify Functions 프록시
  ├── package.json        # Node.js 의존성 관리 파일
  ├── node_modules/       # Node.js 모듈 (자동 생성)
  └── README.md           # 프로젝트 설명 파일
```

---

## Google Apps Script 설정

### Google Sheets 준비
1. Google Sheets에서 새로운 스프레드시트를 생성합니다.
2. 첫 번째 행에 **이름, 메시지, 작성날짜**를 입력합니다.

### Google Apps Script 코드
Google Sheets와 연결된 Apps Script에서 아래 코드를 추가합니다:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('방명록');
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.name, data.message, new Date()]);
  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('방명록');
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const result = rows.map(row => ({
    name: row[0],
    message: row[1],
    timestamp: row[2],
  }));
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Apps Script 배포
1. 상단 메뉴에서 **배포 > 웹 앱으로 배포**를 선택.
2. 익명 사용자에게 액세스를 허용하도록 설정.
3. 배포된 URL을 복사하여 사용.

---

## Netlify Functions 설정

### Netlify Functions란?
브라우저와 Google Apps Script 간의 통신을 중계하여 CORS 문제를 해결합니다.

### proxy.js 파일
`netlify/functions/` 디렉토리에 `proxy.js` 파일을 생성하고 아래 코드를 추가합니다:

```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  const apiUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

  try {
    const response = await fetch(apiUrl, {
      method: event.httpMethod,
      headers: { 'Content-Type': 'application/json' },
      body: event.body,
    });
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to fetch Google Apps Script' }),
    };
  }
};
```

---

### Netlify 설정
`netlify.toml` 파일을 프로젝트 루트에 생성하고 아래 내용을 추가합니다:

```toml
[functions]
directory = "netlify/functions"
```

---

### 의존성 설치
프로젝트 루트에서 `node-fetch`를 설치:

```bash
npm install node-fetch
```

---

## HTML 파일 구현

`index.html` 파일에 방명록 UI를 작성합니다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>방명록</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { text-align: center; }
    form { margin-bottom: 20px; }
    .entry { margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; }
  </style>
</head>
<body>
  <h1>방명록</h1>
  <form id="guestbookForm">
    <input type="text" id="name" placeholder="이름" required>
    <textarea id="message" placeholder="메시지를 작성해주세요" required></textarea>
    <button type="submit">작성</button>
  </form>
  <div id="guestbook"></div>
  <script>
    const apiUrl = '/.netlify/functions/proxy';
    async function loadGuestbook() {
      const response = await fetch(apiUrl, { method: 'GET' });
      const data = await response.json();
      const guestbook = document.getElementById('guestbook');
      guestbook.innerHTML = data.map(entry => `
        <div class="entry">
          <strong>${entry.name}</strong>
          <div>${entry.message}</div>
          <small>${new Date(entry.timestamp).toLocaleString()}</small>
        </div>
      `).join('');
    }
    document.getElementById('guestbookForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('name').value;
      const message = document.getElementById('message').value;
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      loadGuestbook();
    });
    loadGuestbook();
  </script>
</body>
</html>
```

---

## 배포 및 테스트

### Netlify에 배포
- Netlify에 프로젝트를 업로드하거나 GitHub과 연결.
- 자동 배포 후 생성된 URL에서 방명록 테스트.

### 테스트
1. 이름과 메시지를 입력하고 저장되는지 확인.
2. 저장된 메시지가 Google Sheets에 반영되는지 확인.

---

## CORS 문제 해결 과정

### 기존 문제:
- 브라우저에서 Google Apps Script로 직접 요청하려다 CORS 에러 발생.
- Google Apps Script는 기본적으로 Access-Control-Allow-Origin 헤더를 제공하지 않음.

### 해결 방법:
- Netlify Functions를 통해 브라우저와 Google Apps Script 간의 요청을 중계.
- Functions에서 CORS 헤더를 명시적으로 추가하여 문제 해결.

---

## 결론

이 프로젝트는 Google Apps Script와 Netlify Functions를 활용하여 간단한 방명록을 구현하는 예제입니다.  
CORS 문제를 해결하기 위해 Netlify Functions를 도입하였으며, 브라우저와 서버 간 통신이 원활하게 작동하도록 구성되었습니다.  
Netlify와 Google Apps Script의 강력한 기능을 활용하여 다양한 프로젝트에 확장 가능하며, 서버리스 환경에서 효율적인 데이터 관리를 제공합니다.  