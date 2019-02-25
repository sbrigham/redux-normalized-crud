import { select, put, call, takeEvery, all } from 'redux-saga/effects';
import { BEGIN, COMMIT, REVERT } from 'redux-optimistic-ui';
import uuid from 'uuid';

export default ({
  constants,
  creators,
  fetchConfigSelector,
  schema,
  handleResponse,
  onLoadRequest,
  onServerError,
}) => {
  const resourceUrl = schema._key;
  const getRequest = function*(api, action) {
    const {
      query = {},
      group = {},
      onError,
      onSuccess,
      deferLoadRequest = false,
    } = action;
    if (deferLoadRequest) return;
    const { path = {} } = action;
    const { url = '', method = 'get', params = {}, payload = {} } = query;

    const methodVerb = method.toLowerCase();
    if (methodVerb !== 'get' && methodVerb !== 'post') {
      throw new Error('Method not supported in getRequest');
    }

    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    try {
      const promise = new Promise(resolve => {
        if (methodVerb === 'get') {
          resolve(api.get(url, params, fetchConfig));
        } else {
          resolve(api.post(url, payload, params, fetchConfig));
        }
      });

      onLoadRequest(promise);

      const response = yield promise;

      if (onSuccess) onSuccess(response);

      const { normalize, totalItems = null, meta = {} } = handleResponse(
        response.data,
        schema,
      );

      const successAction = creators.getSuccess;

      yield put(
        successAction({
          query,
          response,
          group,
          normalize,
          meta: {
            totalItems,
            responseMeta: meta,
          },
        }),
      );
    } catch (error) {
      if (onError) onError(error);
      onServerError(error);
      const failureAction = creators.getFailure;
      yield put(failureAction({ error, path, group }));
    }
  };
  const onCreateRequest = function*(api, action) {
    const {
      query = {},
      group = {},
      optimistic = false,
      onSuccess,
      onError,
    } = action;
    const { url = '', payload = {}, params = {} } = query;

    const optimisticTransactionId = uuid.v4();
    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    try {
      if (optimistic) {
        const { normalize: optimisticNormalize, meta = {} } = handleResponse(
          { id: optimisticTransactionId, ...payload },
          schema,
        );
        yield put(
          creators.optimisticRequest({
            meta: {
              optimisticTransactionId,
              optimistic: {
                type: BEGIN,
                id: optimisticTransactionId,
              },
              responseMeta: meta,
            },
            group,
            payload,
            normalize: optimisticNormalize,
          }),
        );
      }

      const response = yield call(api.post, url, payload, params, fetchConfig);
      const { normalize, meta } = handleResponse(response.data, schema);

      yield put(
        creators.createSuccess({
          query,
          group,
          response,
          normalize,
          meta: {
            optimisticTransactionId: optimistic
              ? optimisticTransactionId
              : null,
            optimistic: optimistic
              ? {
                  type: COMMIT,
                  id: optimisticTransactionId,
                }
              : null,
            responseMeta: meta,
          },
        }),
      );
      if (onSuccess) onSuccess(response);
    } catch (error) {
      onServerError(error);
      if (onError) onError(error);
      yield put(
        creators.createFailure({
          error,
          group,
          meta: {
            optimisticTransactionId,
            optimistic: optimistic
              ? {
                  type: REVERT,
                  id: optimisticTransactionId,
                }
              : null,
          },
        }),
      );
    }
  };

  const onPatchRequest = function*(api, action) {
    const {
      query = {},
      group = {},
      optimistic = false,
      onSuccess,
      onError,
    } = action;
    const { url = '', payload = {}, params = {} } = query;

    const optimisticTransactionId = uuid.v4();
    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    try {
      if (optimistic) {
        const { normalize: optimisticNormalize, meta = {} } = handleResponse(
          { id: optimisticTransactionId, ...payload },
          schema,
        );
        yield put(
          creators.optimisticRequest({
            meta: {
              optimisticTransactionId,
              optimistic: {
                type: BEGIN,
                id: optimisticTransactionId,
              },
              responseMeta: meta,
            },
            group,
            payload,
            normalize: optimisticNormalize,
          }),
        );
      }

      const response = yield call(api.patch, url, payload, params, fetchConfig);
      const { normalize, meta } = handleResponse(response.data, schema);

      yield put(
        creators.patchSuccess({
          query,
          group,
          response,
          normalize,
          meta: {
            optimisticTransactionId: optimistic
              ? optimisticTransactionId
              : null,
            optimistic: optimistic
              ? {
                  type: COMMIT,
                  id: optimisticTransactionId,
                }
              : null,
            responseMeta: meta,
          },
        }),
      );
      if (onSuccess) onSuccess(response);
    } catch (error) {
      onServerError(error);
      if (onError) onError(error);
      yield put(
        creators.patchFailure({
          error,
          group,
          meta: {
            optimisticTransactionId: optimistic
              ? optimisticTransactionId
              : null,
            optimistic: optimistic
              ? {
                  type: REVERT,
                  id: optimisticTransactionId,
                }
              : null,
          },
        }),
      );
    }
  };

  const onUpdateRequest = function*(api, action) {
    const {
      query = {},
      group = {},
      optimistic = false,
      onSuccess,
      onError,
    } = action;
    const { payload = {}, url = '', params = {} } = query;

    if (payload.id === undefined) {
      throw new Error(
        'You need to specify an id on query.payload this update request',
      );
    }

    const optimisticTransactionId = uuid.v4();
    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    try {
      if (optimistic) {
        const { normalize: optimisticNormalize, meta = {} } = handleResponse(
          payload,
          schema,
        );
        yield put(
          creators.optimisticRequest({
            meta: {
              optimisticTransactionId: optimistic
                ? optimisticTransactionId
                : null,
              optimistic: {
                type: BEGIN,
                id: optimisticTransactionId,
              },
              responseMeta: meta,
            },
            query,
            group,
            payload,
            normalize: optimisticNormalize,
          }),
        );
      }

      const response = yield call(api.put, url, payload, params, fetchConfig);

      yield put(
        creators.updateSuccess({
          query,
          group,
          response,
          meta: {
            optimisticTransactionId: optimistic
              ? optimisticTransactionId
              : null,
            optimistic: optimistic
              ? {
                  type: COMMIT,
                  id: optimisticTransactionId,
                }
              : null,
          },
        }),
      );
      if (onSuccess) onSuccess(response);
    } catch (error) {
      onServerError(error);
      if (onError) onError(error);
      yield put(
        creators.updateFailure({
          error,
          meta: {
            optimisticTransactionId,
            optimistic: optimistic
              ? {
                  type: REVERT,
                  id: optimisticTransactionId,
                }
              : null,
          },
        }),
      );
    }
  };

  const onDeleteRequest = function*(api, action) {
    const {
      query = {},
      group = {},
      optimistic = false,
      onSuccess,
      onError,
    } = action;
    const { url = '', params = {} } = query;

    let fetchConfig = {};
    if (fetchConfigSelector) fetchConfig = yield select(fetchConfigSelector);

    const optimisticTransactionId = uuid.v4();
    try {
      if (optimistic) {
        yield put(
          creators.optimisticRequest({
            meta: {
              optimisticTransactionId,
              optimistic: {
                type: BEGIN,
                id: optimisticTransactionId,
              },
            },
            group,
            removeEntity: {
              id: payload.id,
              entityName: resourceUrl,
            },
          }),
        );
      }
      const response = yield call(api.delete, url, params, fetchConfig);
      yield put(
        creators.deleteSuccess({
          group,
          meta: {
            optimisticTransactionId,
            optimistic: optimistic
              ? {
                  type: COMMIT,
                  id: optimisticTransactionId,
                }
              : null,
          },
        }),
      );
      if (onSuccess) onSuccess(response);
    } catch (error) {
      onServerError(error);
      if (onError) onError(error);
      yield put(
        creators.deleteFailure({
          error,
          group,
          meta: {
            optimisticTransactionId,
            optimistic: optimistic
              ? {
                  type: REVERT,
                  id: optimisticTransactionId,
                }
              : null,
          },
        }),
      );
    }
  };

  return {
    init(api, readOnly = false) {
      return function*() {
        if (!api) throw new Error('you must specify an api');
        const readOnlyTasks = [
          takeEvery(constants.GET_REQUEST, getRequest, api),
        ];
        const cudTasks = [
          takeEvery(constants.CREATE_REQUEST, onCreateRequest, api),
          takeEvery(constants.UPDATE_REQUEST, onUpdateRequest, api),
          takeEvery(constants.DELETE_REQUEST, onDeleteRequest, api),
          takeEvery(constants.PATCH_REQUEST, onPatchRequest, api),
        ];

        yield readOnly
          ? all(readOnlyTasks)
          : all(cudTasks.concat(readOnlyTasks));
      };
    },
  };
};
