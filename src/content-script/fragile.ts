// This contians functions that are fragile and may break with changes to the DOM structure of the page.

// checks for a hyperlink to the logged-in user's profile page
export const getLoggedInUser = (): string | null => {
  const loggedInUserA = document.querySelector(
    'li.user li a'
  ) as HTMLLinkElement;
  if (!loggedInUserA) {
    return null;
  }
  const ref = loggedInUserA.href;
  const usernameArr = ref.split('/');
  return usernameArr[usernameArr.length - 1];
};
