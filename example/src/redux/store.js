import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { combineWithCrudReducers, getCrudSagas } from 'redux-normalized-crud';

// SAGAS
const mySaga = function* () {
  yield getCrudSagas();
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
