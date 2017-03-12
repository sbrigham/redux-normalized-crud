# redux-normalized-crud

[![npm version](https://img.shields.io/npm/v/redux-normalized-crud.svg)](https://www.npmjs.com/package/redux-normalized-crud)

An attempt to standardize RESTful calls and responses within a growing redux application. 

## Installation

To install the latest version:

```
npm install --save redux-normalized-crud
```

This assumes you are using [npm](https://www.npmjs.com/) as your package manager.  

This library uses: 
* [redux-optimistic-ui](https://github.com/mattkrick/redux-optimistic-ui)
* [redux-saga](https://github.com/redux-saga/redux-saga)
* [reselect](https://github.com/reactjs/reselect)
* [redux](https://github.com/reactjs/redux)

In it's current version, you're expected to use these libraries in your application:
* [normalizr](https://github.com/paularmstrong/normalizr)
* [redux-saga](https://github.com/redux-saga/redux-saga)
* [redux](https://github.com/reactjs/redux)


##What do you get out of using it?
This library provides you with a suite of standardized sagas, reducers, action creators, and selectors to make all CRUD calls super easy.
* Standardized server responses turned into entities
* Standardized paging with grouping
* Optimistic update, create, and delete server requests out of the box

##Example Usage:

####Create a config file that exports an object

~~~~javascript
  // config.js
  import { normalize } from 'normalizr';
  export default {
    baseUrl: 'http://localhost:3000/api/',
    // This is a callback you hook into when the server comes back with an OK (Status 200) response
    // You normalize it depending on how your sever returns paged lists, or resources
    normalizeResponse: (response, schema) => {
      let normalizedResult;
      if (Array.isArray(response.data) && 'data' in response) {
        // Paged Result set
        normalizedResult = normalize(response.data, [schema]);
      } else if(Array.isArray(response)) {
        // Just an array of items
        normalizedResult = normalize(response, [schema]);
      } else {
        // Just an object
        normalizedResult = normalize(response, schema);
      }
      return normalizedResult;
    },
    /*
       Here you define where the total items key is on the response object
       In this case the response looks like:
       
       {
        total: 5,
        data: [
          {},
          ... more data
        ]
       }
    */
    paginationResponseKeys: {
      totalItems: 'total'
    },
    // This is the callback gets triggered when the server response is not Ok 
    onServerError: (e) => {
      // This is a fetch response
      const statusCode = e.response.statusCode;
      // do something
    }
  };
~~~~ 
Note: This can be defined on for every resource in your system or you could define 1 per resource if you wanted

#### Register your entity
~~~javascript
  // post.js
  import { schema } from 'normalizr';
  import { registerEntity } from 'redux-normalized-crud';
  
  // Grab the config file we just made
  import config  from './config';
  
  // Use normalizr here to create your entity
  const userEntity = new schema.Entity('POSTS');
  
  export const {
    sagas, // All crud actions for a given entity (this gets registered with your redux-saga)
    constants, // An object full of user constants that contain all of the crud actions
    creators, // An object full of all the action creators for the user entity
    entitySelector, // A helpful selector that is ready to key off the user entities
    paginationSelector, // Another helpful selector ready to key off of your defined paged lists
  } = registerEntity(config, userEntity);
~~~

#### Register the sagas and enhance your reducer
~~~javascript
  // store.js
  import { createStore, applyMiddleware, compose } from 'redux';
  import createSagaMiddleware from 'redux-saga';
  import { combineWithCrudReducers } from 'redux-normalized-crud';
  import { sagas as postCrudSagas } from './user';
  
  // SAGAS
  const mySaga = function* () {
    yield [
      postCrudSagas(),
      // any other crud sagas go here
    ];
  };
  
  const sagaMiddleware = createSagaMiddleware();
  
  /*
    Wrap your reducer with "combineWithCrudReducers". This acts the same as
    combine with reducers. You can put other reducers in that empty object.
  */
  const rootReducer = combineWithCrudReducers({});
  
  const initialState = {};
  
  const enhancer = applyMiddleware(sagaMiddleware);
  
  const store = createStore(
    rootReducer,
    initialState,
    enhancer
  );
  
  sagaMiddleware.run(mySaga);
  
  export default store;
~~~

#### Fire off actions in your components

~~~javascript
// Posts.jsx
import React, {  PropTypes } from 'react'
import { connect } from 'react-redux';
import {
  creators as UserCrudActions,
  entitySelector as userSelector,
  paginationSelector as pagedUsers
} from './post-redux';

class UserList extends React.Component {
  componentWillMount() {
    const { loadUsers } = this.props;
    loadUsers({
      path: {
        url: 'users'
      }
    });
  }

  render() {
    const { users, loading } = this.props;

    if(loading) return <div> Loading... </div>;

    return (
      <div>
        Users:
        {
          users.map(u => <div> {u.name} </div>)
        }
      </div>
    )
  }
}

UserList.propTypes = {
  users: PropTypes.arrayOf({
    name: PropTypes.string
  })
};

export default connect(state => {
  const pagedData = pagedUsers()(state);
  const users = pagedData.ids.map(id => userSelector(id)(state));
  return { users, loading: pagedData.isLoading }
}, 
{
  loadUsers: UserCrudActions.loadRequest
})(UserList);

  
~~~

##### Your State will now look like:

![redux store example](http://imgur.com/f5IbOjM)
