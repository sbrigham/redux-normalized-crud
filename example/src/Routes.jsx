import React from 'react';
import {Router, Route, browserHistory} from 'react-router';
import Home from './Home';
import Post from './Components/Post';

const Routes = (
  <Router history={browserHistory}>
    <Route path="/" component={Home}/>
    <Route path="/post/:postId" component={Post}/>
  </Router>
);

export default Routes;
