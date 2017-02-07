import { optimistic } from 'redux-optimistic-ui';
import { combineReducers, compose } from 'redux';
import _ from 'lodash';
import genCreators from './action-creators';
import genConstants from './constants';
import genSagas from './sagas';
import createApi from './rest-api';
import { paginateReducer, entitiesReducer } from './reducer';
import { paginationSelector, entitySelector } from './selector';

const registeredEntities = {};

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

    const registeredEntity = {
      constants,
      creators,
      sagas: sagas.init(api),
      entitySelector: entitySelector(key),
      paginationSelector: paginationSelector(key)
    };

    registeredEntities[key] = registeredEntity
    return registeredEntity;
}

export function getRegisteredEntities() {
  return registeredEntities;
}

export function combineWithCrudReducers(reducerObjects) {
  let paginationReducers = {};
  _.forEach(Object.keys(registeredEntities), key => {
    paginationReducers[key] = paginateReducer(registeredEntities[key].constants);
  });

  return combineReducers({
    ...reducerObjects,
    entities: optimistic(entitiesReducer),
    pagination: optimistic(combineReducers(paginationReducers))
  });
}
