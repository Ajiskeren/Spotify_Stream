// pages/index.js
import { useEffect, useState } from 'react';

export default function Home() {
  const [token, setToken] = useState(null);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    // Ambil token dari server
    fetch('/api/token').then(r => r.json()).then(j => {
      if (j.access_token) setToken(j.access_token);
    });
  }, []);

  useEffect(() => {
    if (!token) return;
    // load SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'My Web Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.8
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.connect();
      setPlayer(player);
    };
  }, [token]);

  const play = async (uri) => {
    // gunakan Web API untuk memulai playback di deviceId
    if (!deviceId) return alert('Player belum siap');
    const r = await fetch('/api/token').then(r=>r.json());
    const access_token = r.access_token;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,{
      method:'PUT',
      headers:{
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: [uri] })
    });
  };

  return (
    <div style={{padding:20}}>
      <h1>Spotify Web Player Demo</h1>
      {!token ? (
        <a href="/api/login"><button>Login with Spotify</button></a>
      ) : (
        <>
          <p>Player siap. Device ID: {deviceId || 'loading...'}</p>
          <button onClick={()=>play('spotify:track:3n3Ppam7vgaVa1iaRUc9Lp')}>Play Example Track</button>
        </>
      )}
    </div>
  );
}