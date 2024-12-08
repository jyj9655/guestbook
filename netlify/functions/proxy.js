const fetch = require('node-fetch');

exports.handler = async (event) => {
  const apiUrl =
    'https://script.google.com/macros/s/AKfycbzxgCyAMdYaIBb_pgHIco4UlGjPmGGUmOFfCNog8rUfOSS8P49Q-hFXADhg_Im2Y3BB/exec'; // Google Apps Script URL

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

  const options = {
    method: event.httpMethod,
    headers: { 'Content-Type': 'application/json' },
  };

  if (event.httpMethod === 'POST') {
    options.body = event.body;
  }

  try {
    const response = await fetch(apiUrl, options);
    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(
        `Error from Google Apps Script: ${response.status} - ${responseBody}`
      );
    }

    if (responseBody.startsWith('<!DOCTYPE html>')) {
      throw new Error('Unexpected HTML response from Google Apps Script');
    }

    const data = JSON.parse(responseBody);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    };
  } catch (error) {
    console.error('Error in proxy.js:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch Google Apps Script',
        details: error.message,
      }),
    };
  }
};
