const fetch = require('node-fetch');

exports.handler = async (event) => {
  const apiUrl = 'https://script.google.com/macros/s/AKfycbzGFLLiU8GO84F4tcM2HohRkELdEDNtTuyq7kPH4YhsTgUZ3mS4x9VQBoPNfKv_cai7/exec'; // Google Apps Script 배포 URL

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
