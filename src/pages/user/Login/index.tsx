export default () => {
  const fe = new URL(META_NETWORK_FE);
  fe.pathname = '/oauth/login';
  fe.searchParams.set('redirect', encodeURIComponent(window.location.origin));
  window.location.href = fe.href;
};
