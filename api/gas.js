export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check env var is set
  if (!process.env.GAS_URL) {
    return res.status(500).json({ error: 'GAS_URL not configured in environment variables' });
  }

  try {
    const body = typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body);

    const response = await fetch(process.env.GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: body,
      redirect: 'follow'
    });

    const text = await response.text();

    // Try to parse as JSON, show raw text if it fails
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch(e) {
      console.error('GAS returned non-JSON:', text.slice(0, 300));
      res.status(500).json({ error: 'GAS returned invalid response', raw: text.slice(0, 300) });
    }

  } catch(e) {
    res.status(500).json({ error: 'Proxy error: ' + e.message });
  }
}
