import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { combineWithCrudReducers } from 'redux-normalized-crud';
import { sagas as postSagas } from './post-redux';
import { sagas as commentSagas } from './comment-redux';

// SAGAS
const mySaga = function* () {
  yield [
    postSagas(),
    commentSagas(),
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

const rootReducer = combineWithCrudReducers({});

const initialState = {};

const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware));

const store = createStore(
  rootReducer,
  initialState,
  enhancer
);

sagaMiddleware.run(mySaga);

export default store;
