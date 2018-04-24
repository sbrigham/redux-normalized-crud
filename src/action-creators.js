import camelCase from 'lodash.camelcase';

export default (constants) => {
  if (constants !== undefined) {
    return Object.keys(constants).reduce((acc, key) => {
      acc[camelCase(key)] = (params = {}) => Object.assign({ type: constants[key] }, params);
      return acc;
    }, {});
  }
  return {};
};
