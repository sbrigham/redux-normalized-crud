import { uniq } from 'lodash/fp';

export const entitiesReducer = (state = {}, action) => {
  const { payload, normalize, meta, removeEntity } = action;
  let entities;
  if (removeEntity && removeEntity.entityName in state && removeEntity.id in state[removeEntity.entityName]) {
    const newEntities = { ...state[removeEntity.entityName] };
    delete newEntities[removeEntity.id];
    const newState = {
      ...state,
    };
    newState[removeEntity.entityName] = newEntities;
    return newState;
  }

  if (payload && 'entities' in payload) entities = payload.entities;
  if (normalize && 'entities' in normalize) entities = normalize.entities;

  if (entities) {
    // merge entities
    const ent = Object.keys(entities).reduce((acc, key) => {
      // deep merge keys in entities
      const n = Object.keys(entities[key]).reduce((a, k) => {
        const existingEntity = key in state && k in state[key] ? state[key][k] : {};
        const newEntity = entities[key][k];
        a[k] = { ...existingEntity, ...newEntity };
        return a;
      }, {});
      const existingEntities = state[key];
      if (meta && meta.optimisticTransactionId && normalize.result && normalize.result != meta.optimisticTransactionId) {
        delete existingEntities[meta.optimisticTransactionId];
      }

      acc[key] = { ...existingEntities, ...n };
      return acc;
    }, {});
    // merge state
    return { ...state, ...ent };
  }
  return state;
};

export const defaultState = {
  lastQuery: null,
  hasMadeRequest: false,
  isLoading: false,
  ids: [],
  hasError: false,
  totalItems: 0,
  meta: {},
};

export const groupByKey = (key) => {
  return `by${key.charAt(0).toUpperCase() + key.slice(1)}`;
};

export const groupingReducer = (reduxConst) => {
  const reducer = (state = defaultState, action) => {
    const { normalize, group, removeEntity, meta = {} } = action;
    let result = [];
    let totalItems = state.totalItems || 0;
    let direction = 'next';

    if (!removeEntity && normalize && 'result' in normalize) result = normalize.result;

    if (meta && meta.totalItems) totalItems = meta.totalItems;

    if (group && 'direction' in group) direction = group.direction;
    const isNext = direction === 'next';

    switch (action.type) {
      case reduxConst.LIST_REQUEST:
      case reduxConst.CREATE_REQUEST:
      case reduxConst.UPDATE_REQUEST:
      case reduxConst.DELETE_REQUEST: {
        const override = {
          isLoading: true,
          hasMadeRequest: true,
          lastQuery: action.query ? action.query : null,
          totalItems,
        };
        return {
          ...state,
          ...override,
        };
      }
      case reduxConst.LIST_SUCCESS: {
        if (!Array.isArray(result)) return state;

        const newIDs = result !== null && Array.isArray(result) ? result : [result];
        const reset = 'reset' in group ? group.reset : false;
        let existingIds = [...state.ids];
        if (reset) existingIds = [];

        const ids = isNext ? [...newIDs, ...existingIds] : [...existingIds, ...newIDs];
        return Object.assign({}, state, {
          isLoading: false,
          ids: uniq(ids),
          totalItems: (totalItems ? totalItems : ids.length),
          meta: meta.responseMeta ? meta.responseMeta : state.meta,
        });
      }
      case reduxConst.OPTIMISTIC_REQUEST: {
        const reset = 'reset' in group ? group.reset : false;
        let existingIds = [...state.ids];
        if (reset) existingIds = [];

        let ids = existingIds;
        if (removeEntity && ids.indexOf(removeEntity.id) !== -1) {
          ids.splice(ids.indexOf(removeEntity.id), 1);
          totalItems = totalItems - 1;
        } else {
          if (existingIds.indexOf(result) === -1) {
            ids = isNext ? [...existingIds, result] : [result, ...existingIds];
          }
        }

        return Object.assign({}, state, {
          isLoading: false,
          ids: uniq(ids),
          totalItems: ids.length > totalItems ? ids.length : totalItems,
        });
      }
      case reduxConst.CREATE_SUCCESS: {
        const reset = 'reset' in group ? group.reset : false;
        let existingIds = [...state.ids];
        let newIds = [];
        if (reset) existingIds = [];

        // Swap out the temp "optimistic id" for the actual id
        if (meta && meta.optimisticTransactionId && existingIds.indexOf(meta.optimisticTransactionId) !== -1) {
          const tempIndex = existingIds.indexOf(meta.optimisticTransactionId);
          existingIds[tempIndex] = result;
        } else {
          existingIds = [result, ...existingIds];
        }

        newIds = [...existingIds];

        return Object.assign({}, state, {
          isLoading: false,
          ids: uniq(newIds),
          totalItems: (totalItems ? totalItems : newIds.length),
        });
      }
      case reduxConst.DELETE_SUCCESS: {
        const ids = state.ids.filter(id => id !== result);
        return Object.assign({}, state, {
          isLoading: false,
          ids,
          totalItems: state.totalItems ? state.totalItems - 1 : 0
        });
      }
      case reduxConst.LIST_FAILURE:
      case reduxConst.CREATE_FAILURE:
      case reduxConst.UPDATE_SUCCESS:
      case reduxConst.UPDATE_FAILURE:
      case reduxConst.DELETE_FAILURE:
        return Object.assign({}, state, {
          isLoading: false,
          hasError: true,
        });
      default:
        return state;
    }
  };

  return (state = { groups: null }, action) => {
    const { group = false } = action;
    if (group === false) return state;

    switch (action.type) {
      case reduxConst.LIST_REQUEST:
      case reduxConst.LIST_SUCCESS:
      case reduxConst.LIST_FAILURE:
      case reduxConst.CREATE_REQUEST:
      case reduxConst.CREATE_SUCCESS:
      case reduxConst.CREATE_FAILURE:
      case reduxConst.UPDATE_REQUEST:
      case reduxConst.UPDATE_SUCCESS:
      case reduxConst.UPDATE_FAILURE:
      case reduxConst.DELETE_REQUEST:
      case reduxConst.DELETE_SUCCESS:
      case reduxConst.DELETE_FAILURE:
      case reduxConst.OPTIMISTIC_REQUEST: {
        const { by, removeFromGrouping = false } = group;
        if (by) {
          if (group && !('by' in group)) throw new Error(`"by" must be specified in the form by: { index: number, key: string}. For action type: ${action.type} `);
          if (group.by && !('key' in group.by)) throw new Error(`A key as a string must be specified in your by. For action type: ${action.type}`);
          if (group.by && !('index' in group.by)) throw new Error(`An index as an int/string must be specified in your by. For action type: ${action.type}`);

          const { key, index } = by;
          const byKey = groupByKey(key);

          const existingGroups = state.groups ? state.groups[byKey] : {};
          const existingValues = state.groups && state.groups[byKey] ? state.groups[byKey][index] : defaultState;
          const updatedGroups = {};

          if (removeFromGrouping && action.payload && action.payload.id > -1) {
            const { key: keyToRemove, index: indexToRemove } = removeFromGrouping;
            const valuesToRemove = state.groups ? state.groups[groupByKey(keyToRemove)][indexToRemove] : { ids: [] };
            updatedGroups[indexToRemove] = reducer(valuesToRemove, { ...action, removeEntity: { id: action.payload.id } });
          }
          return {
            ...state,
            groups: {
              ...state.groups,
              [byKey]: {
                ...existingGroups,
                ...updatedGroups,
                [index]: { ...existingValues, ...reducer(existingValues, action) },
              },
            },
          };
        }
        let { groups, ...everythingElse } = state;
        everythingElse = { ids: [], ...everythingElse };
        return {
          groups,
          ...reducer(everythingElse, action),
        };
      }
      default:
        return state;
    }
  };
};
