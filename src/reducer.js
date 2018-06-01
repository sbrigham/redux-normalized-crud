import { uniq } from './utils';

export const entitiesReducer = (state = {}, action) => {
  const { payload, normalize, meta, removeEntity } = action;
  let entities;
  if (
    removeEntity &&
    removeEntity.entityName in state &&
    removeEntity.id in state[removeEntity.entityName]
  ) {
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
      if (
        meta &&
        meta.optimisticTransactionId &&
        normalize.result &&
        normalize.result != meta.optimisticTransactionId
      ) {
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
  isList: null,
  lastQuery: null,
  hasMadeRequest: false,
  isLoading: false,
  ids: [],
  hasError: false,
  totalItems: 0,
  meta: {},
  hasMadeSuccess: false,
};

export const groupByKey = key => `by_${key}`;

export const groupingReducer = (reduxConst) => {
  const reducer = (state = defaultState, action) => {
    const { normalize, group, removeEntity, meta = {} } = action;
    let result = [];
    let totalItems = state.totalItems || 0;
    let direction = 'next';

    if (!removeEntity && normalize && 'result' in normalize) result = normalize.result;
    if (meta && meta.totalItems !== undefined) totalItems = meta.totalItems;

    if (group && 'direction' in group) direction = group.direction;
    const isNext = direction === 'next';

    switch (action.type) {
      case reduxConst.GET_REQUEST:
      case reduxConst.LIST_REQUEST:
      case reduxConst.CREATE_REQUEST:
      case reduxConst.UPDATE_REQUEST:
      case reduxConst.DELETE_REQUEST: {
        return {
          ...state,
          isLoading: true,
          hasMadeRequest: true,
          lastQuery: action.query ? action.query : null,
          totalItems,
        };
      }
      case reduxConst.GET_SUCCESS: {
        const newIDs = Array.isArray(result) ? result : [result];
        const reset = 'reset' in group ? group.reset : false;
        let existingIds = [...state.ids];

        if (reset) existingIds = [];
        const ids = !isNext ? [...newIDs, ...existingIds] : [...existingIds, ...newIDs];
        return Object.assign({}, state, {
          isList: Array.isArray(result),
          ids: uniq(ids),
          hasMadeSuccess: true,
          isLoading: false,
          totalItems: totalItems || ids.length,
          meta: meta.responseMeta ? meta.responseMeta : state.meta,
        });
      }
      case reduxConst.LIST_SUCCESS: {
        if (!Array.isArray(result)) return state;
        const newIDs = result;
        const reset = 'reset' in group ? group.reset : false;
        let existingIds = [...state.ids];

        if (reset) existingIds = [];
        const ids = !isNext ? [...newIDs, ...existingIds] : [...existingIds, ...newIDs];
        return Object.assign({}, state, {
          hasMadeSuccess: true,
          isLoading: false,
          ids: uniq(ids),
          totalItems: totalItems || ids.length,
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
          totalItems -= 1;
        } else if (existingIds.indexOf(result) === -1) {
          ids = isNext ? [...existingIds, result] : [result, ...existingIds];
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
        if (reset) existingIds = [];

        // Swap out the temp "optimistic id" for the actual id
        if (
          meta &&
          meta.optimisticTransactionId &&
          existingIds.indexOf(meta.optimisticTransactionId) !== -1
        ) {
          const tempIndex = existingIds.indexOf(meta.optimisticTransactionId);
          existingIds[tempIndex] = result;
        } else {
          existingIds = isNext ? [...existingIds, result] : [result, ...existingIds];
        }

        const isOptimistic = meta && meta.optimisticTransactionId;
        let newTotal = totalItems || existingIds.length;
        if (!isOptimistic) {
          newTotal += 1;
        }

        return Object.assign({}, state, {
          isLoading: false,
          ids: uniq(existingIds),
          totalItems: newTotal,
        });
      }
      case reduxConst.DELETE_SUCCESS: {
        const ids = state.ids.filter(id => id !== result);
        const newTotal = ids.length !== state.ids.length ? state.totalItems - 1 : state.totalItems;
        return Object.assign({}, state, {
          isLoading: false,
          ids,
          totalItems: newTotal || ids.length,
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
      case reduxConst.GET_REQUEST:
      case reduxConst.LIST_SUCCESS:
      case reduxConst.GET_SUCCESS:
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
        const { byKey, removeFromGrouping = false } = group;
        if (byKey) {
          const prefixedByKey = groupByKey(byKey);

          const existingGroups = state.groups || {};
          const existingValues =
            state.groups && state.groups[prefixedByKey]
              ? state.groups[prefixedByKey]
              : defaultState;
          const updatedGroups = {};

          if (removeFromGrouping && action.payload && action.payload.id > -1) {
            const { byKey: keyToRemove } = removeFromGrouping;
            const valuesToRemove = state.groups
              ? state.groups[groupByKey(keyToRemove)]
              : { ids: [] };
            updatedGroups[groupByKey(keyToRemove)] = reducer(valuesToRemove, {
              ...action,
              removeEntity: { id: action.payload.id },
            });
          }
          return {
            ...state,
            groups: {
              ...existingGroups,
              ...updatedGroups,
              [prefixedByKey]: { ...existingValues, ...reducer(existingValues, action) },
            },
          };
        }

        const { groups, ...everythingElse } = state;
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
