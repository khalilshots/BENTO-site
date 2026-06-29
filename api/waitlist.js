export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, source = 'Landing Page' } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = 'a701fb523be74488bf3695ecc3de40e2';

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: email } }]
          },
          Email: {
            email: email
          },
          Source: {
            select: { name: source }
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Notion error:', err);
      return res.status(500).json({ error: 'Failed to save' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
