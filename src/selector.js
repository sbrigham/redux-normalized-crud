import {createSelector} from 'reselect';
import {defaultState, groupByKey} from './reducer';

const pagination = state => state.pagination;
const entities = state => state.entities;

export const paginationSelector = resourceKey => ({key, index}) => createSelector([pagination], pagination => {
  if (!resourceKey || !key || !index) throw new Error('Key, index and resource need to be specified in the pagedData selector');
  const byKey = groupByKey(key);
  if(pagination[resourceKey][byKey] !== undefined && pagination[resourceKey][byKey][index] !== undefined) return pagination[resourceKey][byKey][index];
  return defaultState;
});

export const entitySelector = resourceKey => (id) => createSelector([entities], entities => {
  if(!resourceKey in entities) return null;

  if (id != undefined) return entities[resourceKey][id];

  return entities[resourceKey];
});
