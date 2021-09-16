export default () => {
  window.location.href = `https://meta-network.mttk.net/oauth/login?redirect=${encodeURIComponent(
    window.location.origin,
  )}`;
};
