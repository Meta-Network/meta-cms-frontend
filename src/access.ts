export default function access(initialState: { currentUser?: GLOBAL.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  return {
    loggedIn: Boolean(currentUser),
  };
}
