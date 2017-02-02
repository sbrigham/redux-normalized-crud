import {createSelector} from 'reselect';
import {defaultState, groupByKey} from './reducer';

const pagination = state => state.pagination;
const entities = state => state.entities;

export const pagedData = ({key, index}, resource) => createSelector([pagination], pagination => {
  if (!resource || !key || !index) throw new Error('Key, index and resource need to be specified in the pagedData selector');
  const byKey = groupByKey(key);
  if(pagination[resource][byKey] !== undefined && pagination[resource][byKey][index] !== undefined) return pagination[resource][byKey][index];
  return defaultState;
});

export const entityData = (entityName, id) => createSelector([entities], entities => {
  return entityName in entities ? entities[entityName][id] : null;
});
