import {createSelector} from 'reselect';
import {defaultState, groupByKey} from './reducer';
import {ensureState} from 'redux-optimistic-ui';

const pagination = state => ensureState(state.pagination);
const entities = state => ensureState(state.entities);

export const paginationSelector = resourceKey => (grouping = null) => createSelector([pagination], pagination => {
  if (grouping) {
    const { key, index } = grouping;
    const byKey = groupByKey(key);
    if(pagination[resourceKey]['groupings'] != null && pagination[resourceKey]['groupings'][byKey] != undefined && pagination[resourceKey]['groupings'][byKey][index] !== undefined) {
      return pagination[resourceKey]['groupings'][byKey][index];
    }
  }
  return defaultState;
});

export const entitySelector = resourceKey => (id = null) => createSelector([entities], entities => {
  if(entities[resourceKey] === undefined) return null;

  if(id === null) return entities[resourceKey];

  if(entities[resourceKey][id] === undefined) return null;

  return entities[resourceKey][id];
});
