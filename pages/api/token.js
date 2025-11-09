import fetch from 'node-fetch';

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim()).filter(Boolean).map(s => {
      const idx = s.indexOf('=');
      return [s.substring(0, idx), s.substring(idx + 1)];
    })
  );
}

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  let access_token = cookies.spotify_access_token;
  const refresh_token = cookies.spotify_refresh_token;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!access_token && refresh_token) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token
    });

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) return res.status(500).json(tokenData);

    access_token = tokenData.access_token;
    const expires = new Date(Date.now() + tokenData.expires_in * 1000).toUTCString();
    res.setHeader('Set-Cookie', `spotify_access_token=${access_token}; Expires=${expires}; Path=/; HttpOnly=false; SameSite=Lax`);
    return res.json({ access_token, expires_in: tokenData.expires_in });
  }

  if (!access_token) return res.status(401).json({ error: 'No token, please login' });

  res.json({ access_token });
}
