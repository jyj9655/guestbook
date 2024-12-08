const fetch = require('node-fetch');

exports.handler = async (event) => {
  // OPTIONS 요청 처리
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

  const apiUrl = 'https://script.google.com/macros/s/AKfycbz8Ici8hGEAayABnrjw_dAZhGphUkLlNTY2JAEO90SIa57jzxMK4MrA95q5NmLLKngk/exec'; // Google Apps Script 배포 URL

  const options = {
    method: event.httpMethod,
    headers: { 'Content-Type': 'application/json' },
    body: event.body,
  };

  try {
    const response = await fetch(apiUrl, options);
    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch Google Apps Script' }),
    };
  }
};
