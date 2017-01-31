import genCreators from './action-creators';
import genConstants from './constants';
import genSagas from './sagas';
import createApi from './rest-api';

export default function(config) {
  const {baseUrl, normalizeResponse} = config;
  if (!baseUrl) throw new Error('The base url needs to be defined!');

  const registerEntity = function(schema, key) {
    const key = key || schema._key;

    const constants = genConstants(key);
    const creators = genCreators(constants);
    const sagas = genSagas({
      constants,
      creators,
      schema,
      normalizeResponse
    });

    const api = createApi(config.baseUrl);

    return {
      constants,
      creators,
      sagas: sagas.init(api)
    };
  };

  return {
    registerEntity
  }
}
