import { select, put, call, takeEvery } from 'redux-saga/effects';
import { BEGIN, COMMIT, REVERT } from 'redux-optimistic-ui';
import uuid from 'uuid';

export default ({
  constants,
  creators,
  fetchConfigSelector,
  schema,
  normalizeResponse,
  onLoadRequest,
  onServerError,
}) => {
  const resourceUrl = schema._key;
  const loadRequest = function* (api, action) {
    const { query, paginate = {}, onError } = action;
    const { path = {}, onSuccess } = action;
    const { id, url } = path;

    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    try {
      let response;
      if (id !== undefined) {
        const promise = new Promise((resolve) => {
          resolve(api.get(`${url || resourceUrl}/${id}`, query, fetchConfig));
        });
        onLoadRequest(promise);
        response = yield promise;
      } else {
        const promise = new Promise((resolve) => {
          resolve(api.get(`${url || resourceUrl}`, query, fetchConfig));
        });
        onLoadRequest(promise);
        response = yield promise;
      }
      if (onSuccess) yield put(onSuccess(response));

      yield put(creators.loadSuccess({
        response,
        paginate,
        path,
        normalize: normalizeResponse(response, schema),
      }));
    } catch (error) {
      if (onError) onError(error);
      if (process.env.NODE_ENV === 'development') console.log(error);
      onServerError(error);
      yield put(creators.loadFailure({ error, path, paginate }));
    }
  };
  const onAddRequest = function* (api, action) {
    const { path, payload, query, paginate = {}, optimistic = true, onSuccess, onError } = action;
    const { url } = path;
    const optimisticTransactionId = uuid.v4();
    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    try {
      if (optimistic) {
        payload.id = optimisticTransactionId;
        yield put(creators.optimisticRequest({
          meta: {
            optimisticTransactionId,
            optimistic: {
              type: BEGIN,
              id: optimisticTransactionId,
            },
          },
          paginate,
          payload,
          normalize: normalizeResponse(payload, schema),
        }));
      }

      const response = yield call(api.post, url || resourceUrl, payload, query, fetchConfig);
      yield put(creators.addSuccess({
        path,
        query,
        paginate,
        response,
        normalize: normalizeResponse(response, schema),
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: COMMIT,
            id: optimisticTransactionId,
          } : null,
        },
      }));
      if (onSuccess) onSuccess(response);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.log(error);
      onServerError(error);
      if (onError) onError(error);
      yield put(creators.addFailure({
        error,
        path,
        paginate,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: REVERT,
            id: optimisticTransactionId,
          } : null,
        },
      }));
    }
  };
  const onUpdateRequest = function* (api, action) {
    const { path, payload, query, paginate = {}, optimistic = true, onSuccess, onError } = action;

    if (path === undefined && payload.id === undefined) throw new Error('You need to specify an id for this update request');

    const id = path !== undefined ? path.id : payload.id;
    const url = path !== undefined ? path.url : resourceUrl;
    const optimisticTransactionId = uuid.v4();
    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    try {
      // if optimistic try to set the response as if it came back from the server
      if (optimistic) {
        yield put(creators.optimisticRequest({
          meta: {
            optimisticTransactionId,
            optimistic: {
              type: BEGIN,
              id: optimisticTransactionId,
            },
          },
          path,
          query,
          paginate,
          payload,
          normalize: normalizeResponse(payload, schema),
        }));
      }

      const response = yield call(api.put, `${url}${id ? `/${id}` : ''}`, payload, query, fetchConfig);
      // NO ERRORS FROM THE SERVER
      yield put(creators.updateSuccess({
        path,
        query,
        paginate,
        response,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: COMMIT,
            id: optimisticTransactionId,
          } : null,
        },
      }));
      if (onSuccess) onSuccess(response);
    } catch (error) {
      onServerError(error);
      if (onError) onError(error);
      if (process.env.NODE_ENV === 'development') console.log(error);
      yield put(creators.updateFailure({
        error,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: REVERT,
            id: optimisticTransactionId,
          } : null,
        },
      }));
    }
  };
  const onDeleteRequest = function* (api, action) {
    const { path, payload = {}, query = {}, paginate = {}, optimistic = true, onSuccess, onError } = action;
    const { url, id } = path;
    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    const optimisticTransactionId = uuid.v4();
    try {
      if (optimistic) {
        yield put(creators.optimisticRequest({
          meta: {
            optimisticTransactionId,
            optimistic: {
              type: BEGIN,
              id: optimisticTransactionId,
            },
          },
          removeEntity: {
            id,
            entityName: resourceUrl,
          },
        }));
      }
      const response = yield call(api.delete, url, payload, query, fetchConfig);
      yield put(creators.deleteSuccess({
        path,
        paginate,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: COMMIT,
            id: optimisticTransactionId,
          } : null,
        },
        normalize: { result: payload },
      }));
      if (onSuccess) onSuccess(response);
    } catch (error) {
      onServerError(error);
      if (onError) onError(error);
      if (process.env.NODE_ENV === 'development') console.log(error);
      yield put(creators.deleteFailure({
        error,
        path,
        paginate,
        meta: {
          optimisticTransactionId,
          optimistic: optimistic ? {
            type: REVERT,
            id: optimisticTransactionId,
          } : null,
        },
      }));
    }
  };
  return {
    init: function (api) {
      return function* () {
        if (!api) throw new Error('you must specify an api');
        yield [
          takeEvery(constants.LOAD_REQUEST, loadRequest, api),
          takeEvery(constants.ADD_REQUEST, onAddRequest, api),
          takeEvery(constants.UPDATE_REQUEST, onUpdateRequest, api),
          takeEvery(constants.DELETE_REQUEST, onDeleteRequest, api),
        ];
      };
    },
  };
};
