import { optimistic } from 'redux-optimistic-ui';
import { combineReducers } from 'redux';
import genCreators from './action-creators';
import genConstants from './constants';
import genSagas from './sagas';
import createApi from './rest-api';
import { paginateReducer, entitiesReducer } from './reducer';
import { paginationSelector, entitySelector } from './selector';

const registeredEntities = {};

export function registerEntity(config, schema) {
  const {
    baseUrl,
    normalizeResponse,
    onLoadRequest = () => { },
    onServerError = () => { },
    fetchInstance = fetch,
    fetchConfig = {},
  } = config;
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
    onServerError,
  });

  const restApi = createApi(
    baseUrl,
    fetchInstance,
    fetchConfig
  );

  const registeredEntity = {
    key,
    constants,
    creators,
    sagas: sagas.init(restApi),
    entitySelector: entitySelector(key),
    paginationSelector: paginationSelector(key),
    config,
    restApi,
  };

  registeredEntities[key] = registeredEntity;
  return registeredEntity;
}

export { paginationSelector } from './selector';

export function getCrudSagas() {
  const registeredSagas = [];

  Object.keys(registeredEntities).forEach(key => {
    registeredSagas.push(registeredEntities[key].sagas);
  });

  return registeredSagas;
}

export function combineWithCrudReducers(reducerObjects) {
  let paginationReducers = {};

  Object.keys(registeredEntities).forEach(key => {
    paginationReducers[key] = paginateReducer(registeredEntities[key].constants, registeredEntities[key].config.paginationResponseKeys || {});
  });

  return combineReducers({
    ...reducerObjects,
    crud: optimistic(
      combineReducers({
        entities: entitiesReducer,
        pagination: combineReducers(paginationReducers)
      })
    )
  });
}
