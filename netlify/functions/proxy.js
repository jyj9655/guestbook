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

  const body = event.body ? JSON.parse(event.body) : {};
  const action = body.action || event.queryStringParameters?.action;

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, action }),
  };

  try {
    const response = await fetch(apiUrl, options);
    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(`Error from Google Apps Script: ${response.status} - ${responseBody}`);
    }

    const data = JSON.parse(responseBody);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
