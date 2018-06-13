export const genRSF = (action, name) =>
  ['REQUEST', 'SUCCESS', 'FAILURE'].reduce((acc, type) => {
    acc[`${action}_${type}`.toUpperCase()] = `${name}_${action}_${type}`.toUpperCase();
    return acc;
  }, {});

export default (name, readOnly = false) => {
  let constants = [];
  const readConstants = ['GET'];
  const cudConstants = ['CREATE', 'UPDATE', 'DELETE', 'OPTIMISTIC', 'PATCH'];
  constants = readOnly ? readConstants : cudConstants.concat(readConstants);
  return constants.reduce((acc, action) => Object.assign({}, acc, genRSF(action, name)), {});
};
