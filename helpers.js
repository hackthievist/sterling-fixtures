/* eslint-disable no-param-reassign */
module.exports.cleanSlug = ({ slug, name }) => {
  if (!slug) {
    slug = name.substr(1, 3);
  }
  const newSlug = slug.toUpperCase().trim();
  return newSlug;
};
