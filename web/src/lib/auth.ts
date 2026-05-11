export const handleGoogleLogin = () => {
  const clientId = '151107023675-usa3bao0tmtc4637lgo4e2ederv6b6qa.apps.googleusercontent.com';
  const redirectUri = `${window.location.origin}/in`;
  const scope = encodeURIComponent('openid email profile');
  const responseType = 'id_token';
  const nonce = Math.random().toString(36).substring(2);
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&nonce=${nonce}`;
  
  window.location.href = authUrl;
};
