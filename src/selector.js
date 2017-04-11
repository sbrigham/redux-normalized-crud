import { createSelector } from 'reselect';
import { ensureState } from 'redux-optimistic-ui';
import { defaultState, groupByKey } from './reducer';

const groupings = state => ensureState(state.crud).groupings;
const entities = state => ensureState(state.crud).entities;

export const groupSelector = resourceKey => (grouping = null) => createSelector([groupings], (groupings) => {
  if (!groupings[resourceKey]) return defaultState;

  if (grouping) {
    const { key, index } = grouping;
    const byKey = groupByKey(key);
    if (groupings[resourceKey].groups != null && groupings[resourceKey].groups[byKey] !== undefined && groupings[resourceKey].groups[byKey][index] !== undefined) {
      return groupings[resourceKey].groups[byKey][index];
    }
  }
  const { groups, ...flatGrouping } = groupings[resourceKey];

  if ('ids' in flatGrouping) return flatGrouping;

  return defaultState;
});

export const entitySelector = resourceKey => (id = null) => createSelector([entities], (ents) => {
  if (ents[resourceKey] === undefined) return null;

  if (id === null) return ents[resourceKey];

  if (ents[resourceKey][id] === undefined) return null;

  return ents[resourceKey][id];
});
