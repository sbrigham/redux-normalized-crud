import { optimistic } from 'redux-optimistic-ui';
import { combineReducers } from 'redux';
import genCreators from './action-creators';
import genConstants from './constants';
import genSagas from './sagas';
import createApi from './rest-api';
import { groupingReducer, entitiesReducer } from './reducer';
import { groupingSelector, entitySelector } from './selector';

require('isomorphic-fetch');

const registeredEntities = {};

const restApi = createApi('/');

export function setBaseUrl(baseUrl) {
  restApi.setBaseUrl(baseUrl);
}

export function registerEntity(config, schema) {
  const {
    handleResponse,
    onLoadRequest = () => { },
    onServerError = () => { },
    fetchConfigSelector = null,
    readOnly = false,
  } = config;
  if (!handleResponse) throw new Error('A handleResponse property needs to be defined in the config object');

  const key = schema._key;
  const constants = genConstants(key, readOnly);
  const creators = genCreators(constants);
  const sagas = genSagas({
    constants,
    creators,
    fetchConfigSelector,
    schema,
    handleResponse,
    onLoadRequest,
    onServerError,
  });

  const registeredEntity = {
    key,
    constants,
    creators,
    sagas: sagas.init(restApi, readOnly),
    entitySelector: entitySelector(key),
    groupingSelector: groupingSelector(key),
    config,
    restApi,
  };

  registeredEntities[key] = registeredEntity;
  return registeredEntity;
}

export { groupingSelector } from './selector';

export function combineWithCrudReducers(reducerObjects) {
  const groupingReducers = {};

  Object.keys(registeredEntities).forEach((key) => {
    groupingReducers[key] = groupingReducer(registeredEntities[key].constants);
  });

  return combineReducers({
    ...reducerObjects,
    crud: optimistic(
      combineReducers({
        entities: entitiesReducer,
        groupings: combineReducers(groupingReducers),
      })
    ),
  });
}
