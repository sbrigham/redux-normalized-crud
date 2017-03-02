import { createSelector } from 'reselect';
import { ensureState } from 'redux-optimistic-ui';
import { defaultState, groupByKey } from './reducer';

const pagination = state => ensureState(state.crud).pagination;
const entities = state => ensureState(state.crud).entities;

export const paginationSelector = resourceKey => (grouping = null) => createSelector([pagination], pagination => {
  if (grouping) {
    const { key, index } = grouping;
    const byKey = groupByKey(key);
    if (pagination[resourceKey]['groupings'] != null && pagination[resourceKey]['groupings'][byKey] != undefined && pagination[resourceKey]['groupings'][byKey][index] !== undefined) {
      return pagination[resourceKey]['groupings'][byKey][index];
    }
  }
  const { groupings, ...flatGrouping } = pagination[resourceKey];

  if ('ids' in flatGrouping) return flatGrouping;

  return defaultState;
});

export const entitySelector = resourceKey => (id = null) => createSelector([entities], entities => {
  if (entities[resourceKey] === undefined) return null;

  if (id === null) return entities[resourceKey];

  if (entities[resourceKey][id] === undefined) return null;

  return entities[resourceKey][id];
});
