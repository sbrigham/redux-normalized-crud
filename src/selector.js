import {createSelector} from 'reselect';
import {defaultState, groupByKey} from './reducer';
import {ensureState} from 'redux-optimistic-ui';

const pagination = state => ensureState(state.pagination);
const entities = state => ensureState(state.entities);

export const paginationSelector = resourceKey => ({key, index}) => createSelector([pagination], pagination => {
  if (!resourceKey || !key || !index) throw new Error('Key, index and resource need to be specified in the pagedData selector');
  const byKey = groupByKey(key);
  if(pagination[resourceKey][byKey] !== undefined && pagination[resourceKey][byKey][index] !== undefined) return pagination[resourceKey][byKey][index];
  return defaultState;
});

export const entitySelector = resourceKey => (id = null) => createSelector([entities], entities => {
  if(entities[resourceKey] === undefined) return null;

  if(id === null) return entities[resourceKey];

  if(entities[resourceKey][id] === undefined) return null;

  return entities[resourceKey][id];
});
