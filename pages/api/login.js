export default function handler(req, res) {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = process.env.REDIRECT_URI;
  const scope = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state'
  ].join(' ');
  const state = Math.random().toString(36).substring(2, 15);

  const params = new URLSearchParams({
    client_id,
    response_type: 'code',
    redirect_uri,
    state,
    scope
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
