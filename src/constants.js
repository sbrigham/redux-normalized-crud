export const genRSF = (action, name) => {
  return ['REQUEST', 'SUCCESS', 'FAILURE'].reduce((acc, type) => {
    acc[`${action}_${type}`.toUpperCase()] = `${name}_${action}_${type}`.toUpperCase();
    return acc;
  }, {});
};

export default (name, readOnly = false) => {
  let constants = [];
  const readConstants = ['GET', 'LIST'];
  const cudConstants = ['CREATE', 'UPDATE', 'DELETE', 'OPTIMISTIC'];
  constants = readOnly ? readConstants : cudConstants.concat(readConstants);
  return constants.reduce((acc, action) => {
    return Object.assign({}, acc, genRSF(action, name));
  }, {});
};
