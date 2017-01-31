export const genRSF = (action, name) => {
  return ['REQUEST', 'SUCCESS', 'FAILURE'].reduce((acc, type) => {
    acc[`${action}_${type}`.toUpperCase()] = `${name}_${action}_${type}`.toUpperCase();
    return acc;
  }, {});
};

export default (name) => {
  return ['LOAD', 'ADD', 'UPDATE', 'DELETE', 'OPTIMISTIC'].reduce((acc, action) => {
    return Object.assign({}, acc, genRSF(action, name));
  }, {});
};
