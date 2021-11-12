export default function access(initialState: GLOBAL.InitialState) {
  const { siteConfig } = initialState || {};
  return {
    hasSite: Boolean(siteConfig?.domain),
    hasNoSite: !siteConfig?.domain,
  };
}
