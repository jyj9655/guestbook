const fetch = require('node-fetch');

exports.handler = async (event) => {
  const apiUrl = "https://script.google.com/macros/s/AKfycbxtDAF592tDH_IGYnUBzE5hQ6fvkayGO6R3c2YUHBuehPc9wnz39oFlMoCtLVKDwXdX/exec";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const options = {
      method: event.httpMethod,
      headers: { "Content-Type": "application/json" },
    };

    if (event.httpMethod === "POST") {
      // POST 요청일 경우 본문 추가
      const body = JSON.parse(event.body || "{}");
      options.body = JSON.stringify(body);
    }

    // Google Apps Script에 요청 전달
    const response = await fetch(apiUrl, options);
    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(`Error from Google Apps Script: ${response.status} - ${responseBody}`);
    }

    return {
      statusCode: 200,
      body: responseBody,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    console.error("Error in proxy:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
