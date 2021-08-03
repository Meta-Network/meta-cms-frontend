export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  return {
    loggedIn: Boolean(currentUser),
  };
}
