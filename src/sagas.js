import {put, call, takeEvery} from 'redux-saga/effects';
import {BEGIN, COMMIT, REVERT} from 'redux-optimistic-ui';
import uuid from 'uuid';

export default ({constants, creators, schema, normalizeResponse, onLoadRequest, onServerError}) => {
  const resourceUrl = schema._key;
  const loadRequest = function *(api, action) {
    const {query, paginate = {}} = action;
    let {path, onSuccess} = action;
    path = path || {};
    let {id, url} = path;

    try {
      let response;
      if (id !== undefined) {
        var promise = new Promise(function(resolve, reject) {
          resolve(api.get(`${url || resourceUrl}/${id}`, query))
        });
        onLoadRequest(promise);
        response = yield promise;
      } else {
        var promise = new Promise(function(resolve, reject) {
          resolve(api.get(`${url || resourceUrl}`, query))
        });
        onLoadRequest(promise);
        response = yield promise;
      }
      if(onSuccess) yield put(onSuccess(response));

      yield put(creators.loadSuccess({
        response, paginate, path,
        normalize: normalizeResponse(response, schema)
      }));

    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.log(error);
      onServerError(error);
      yield put(creators.loadFailure({error, path, paginate}));
    }
  };
  const onAddRequest = function *(api, action) {
    const {path, payload, query, paginate = {}, optimistic = true} = action;
    let {url} = path;
    let optimisticTransactionId = uuid.v4();

    try {
      if(optimistic) {
        payload.id = optimisticTransactionId;
        yield put(creators.optimisticRequest({
          meta: {
            optimisticTransactionId,
            optimistic: {
              type: BEGIN,
              id: optimisticTransactionId
            }
          },
          paginate,
          payload,
          normalize: normalizeResponse(payload, schema)
        }))
      }

      const response = yield call(api.post, url || resourceUrl, payload, query);

      yield put(creators.addSuccess({
        path, query, paginate, response,
        normalize: normalizeResponse(response, schema),
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: COMMIT,
            id: optimisticTransactionId
          } : null
        }
      }));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.log(error);
      onServerError(error);
      yield put(creators.addFailure({
        error,
        path,
        paginate,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: REVERT,
            id: optimisticTransactionId
          } : null
        }
      }));
    }
  };
  const onUpdateRequest = function *(api, action) {
    const {path, payload, query, paginate = {}, optimistic = true, onSuccess} = action;

    if (path === undefined && payload.id === undefined) throw new Error('You need to specify an id for this update request');

    let id = path != undefined ? path.id : payload.id;
    let url = path != undefined ? path.url : resourceUrl;

    let optimisticTransactionId = uuid.v4();

    try {
      // if optimistic try to set the response as if it came back from the server
      if(optimistic) {
        yield put(creators.optimisticRequest({
          meta: {
            optimisticTransactionId,
            optimistic: {
              type: BEGIN,
              id: optimisticTransactionId
            }
          },
          path, query, paginate,
          normalize: normalizeResponse(payload, schema)
        }))
      }

      const response = yield call(api.put, `${url}${id ? '/' + id :''}`, payload, query);

      // NO ERRORS FROM THE SERVER
      yield put(creators.updateSuccess({
        path, query, paginate, response,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: COMMIT,
            id: optimisticTransactionId
          } : null
        }
      }));
    } catch (error) {
      onServerError(error);
      if (process.env.NODE_ENV === 'development') console.log(error);
      yield put(creators.updateFailure({
        error,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: REVERT,
            id: optimisticTransactionId
          } : null
        }
      }))
    }
  };
  const onDeleteRequest = function *(api, action) {
    const {path, payload, paginate = {}, optimistic = true} = action;
    let {url, id} = path;

    let optimisticTransactionId = uuid.v4();
    try {
      if(optimistic) {
        yield put(creators.optimisticRequest({
          meta: {
            optimisticTransactionId,
            optimistic: {
              type: BEGIN,
              id: optimisticTransactionId
            }
          },
          removeEntity: {
            id: path.id,
            entityName: resourceUrl
          }
        }))
      }
      yield call(api.delete, url, id);
      yield put(creators.deleteSuccess({
        path, paginate,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: COMMIT,
            id: optimisticTransactionId
          } : null
        },
        normalize: {result: payload}
      }));
    } catch (error) {
      onServerError(error);
      if (process.env.NODE_ENV === 'development') console.log(error);
      yield put(creators.deleteFailure({
        error,
        path,
        paginate,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: REVERT,
            id: optimisticTransactionId
          } : null
        }
      }));
    }
  };
  return {
    init: function *(api) {
      if(!api) throw new Error('you must specify an api');
      yield [
        takeEvery(constants.LOAD_REQUEST, loadRequest, api),
        takeEvery(constants.ADD_REQUEST, onAddRequest, api),
        takeEvery(constants.UPDATE_REQUEST, onUpdateRequest, api),
        takeEvery(constants.DELETE_REQUEST, onDeleteRequest, api)
      ];
    }
  };
};
