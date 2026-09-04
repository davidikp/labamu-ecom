/**
 * translator.js
 * Utility for auto-translating website content using the Google Gemini API.
 */

// We use the JSON response schema format recommended for Gemini.
export async function translateContent(sourcePayload, targetLanguage) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in environment variables.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Build the prompt for Gemini
  const prompt = `You are a professional website translator and copywriter.
Translate the following JSON object's string values into ${targetLanguage}.
Respond ONLY with a valid, raw JSON object containing the exact same keys, but with the translated strings as values.
Do not wrap it in markdown block quotes. Just the JSON.

Source JSON:
${JSON.stringify(sourcePayload, null, 2)}`;

  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    // Parse the generated JSON seamlessly
    return JSON.parse(resultText);

  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
}
