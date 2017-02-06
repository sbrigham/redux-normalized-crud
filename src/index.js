import genCreators from './action-creators';
import genConstants from './constants';
import genSagas from './sagas';
import createApi from './rest-api';
import { paginateReducer } from './reducer';
import { paginationSelector, entitySelector } from './selector';

export const registerEntity = function (config, schema) {
    const { baseUrl, normalizeResponse, onLoadRequest = () => {} } = config;
    if (!baseUrl) throw new Error('The baseUrl property needs to be defined in the config object.');
    if (!normalizeResponse) throw new Error('A normalizeResponse property needs to be defined in the config object');

    const key = schema._key;
    const constants = genConstants(key);
    const creators = genCreators(constants);
    const sagas = genSagas({
      constants,
      creators,
      schema,
      normalizeResponse,
      onLoadRequest,
    });

    const api = createApi(baseUrl);

    return {
      constants,
      creators,
      sagas: sagas.init(api),
      pagination: {
        [key]: paginateReducer(constants)
      },
      entitySelector: entitySelector(key),
      paginationSelector: paginationSelector(key)
    };
}

export { entitiesReducer } from './reducer';
