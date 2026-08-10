const ALLOWED_MODELS = ['gemini-2.5-flash'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  let parsed = req.body;

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return res.status(400).json({ error: { message: 'Invalid JSON body' } });
    }
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    typeof parsed.model !== 'string' ||
    !parsed.body ||
    typeof parsed.body !== 'object' ||
    Array.isArray(parsed.body)
  ) {
    return res.status(400).json({ error: { message: 'Invalid request body' } });
  }

  if (!ALLOWED_MODELS.includes(parsed.model)) {
    return res.status(400).json({ error: { message: 'Unsupported model' } });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Server is missing GEMINI_API_KEY' } });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${parsed.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(parsed.body),
      },
    );
    const responseBody = await response.json();

    return res.status(response.status).json(responseBody);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return res.status(502).json({ error: { message } });
  }
};
