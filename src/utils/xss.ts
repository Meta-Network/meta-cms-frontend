import xss from 'xss';

export const xssSummary = (source: string) => {
  const html = xss(source, {
    whiteList: {}, // empty, means filter out all tags
    stripIgnoreTag: true, // filter out all HTML not in the whitelist
    stripIgnoreTagBody: ['script'], // the script tag is a special case, we need
    // to filter out its content
  });

  // console.log('text: %s', html);

  return html;
};
