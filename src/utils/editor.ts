/**
 * generate summary
 * @returns
 */
export const generateSummary = (): string => {
  // TODO: modify
  try {
    const htmlContent = (window as any).vditor!.getHTML();
    if (htmlContent) {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      return div.innerText.length >= 100 ? `${div.innerText.slice(0, 97)}...` : div.innerText;
    }
    return '';
  } catch (e) {
    console.log(e);
    return '';
  }
};