// pages/api/callback.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const code = req.query.code || null;
  const redirect_uri = process.env.REDIRECT_URI;
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!code) return res.status(400).send('No code');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri
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

  if (tokenData.error) {
    return res.status(500).json(tokenData);
  }

  // Simpel: simpan refresh_token & access_token di cookie (demo)
  // Untuk produksi, simpan refresh_token di DB yang aman.
  const expires = new Date(Date.now() + tokenData.expires_in * 1000).toUTCString();
  res.setHeader('Set-Cookie', [
    `spotify_access_token=${tokenData.access_token}; Expires=${expires}; Path=/; HttpOnly=false; SameSite=Lax`,
    `spotify_refresh_token=${tokenData.refresh_token}; Path=/; HttpOnly=true; SameSite=Lax` // httpOnly untuk refresh token
  ]);

  // Redirect ke halaman utama
  res.redirect('/');
}