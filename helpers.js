/* eslint-disable no-param-reassign */
module.exports.cleanSlug = ({ slug, name }) => {
  if (!slug) {
    slug = name.substr(0, 3);
  }
  const newSlug = slug.toUpperCase().trim();
  return newSlug;
};
