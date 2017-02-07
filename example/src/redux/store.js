import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { entitiesReducer } from 'redux-normalized-crud';
import { sagas as postSagas, pagination as pagedPosts } from './post-redux';
import { sagas as commentSagas, pagination as pagedComments } from './comment-redux';
import {optimistic} from 'redux-optimistic-ui';

// SAGAS
const mySaga = function* () {
  yield [
    postSagas,
    commentSagas
  ];
};

const sagaMiddleware = createSagaMiddleware();

// OTHER MIDDLEWARE
const composeEnhancers =
  process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

// REDUCERS
const rootReducer = combineReducers({
  entities: optimistic(entitiesReducer),
  pagination: optimistic(combineReducers({
    ...pagedPosts,
    ...pagedComments
  })),
});

const initialState = {};

const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware));

const store = createStore(
  rootReducer,
  initialState,
  enhancer
);

sagaMiddleware.run(mySaga);

export default store;
