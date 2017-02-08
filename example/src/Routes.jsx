import React from 'react';
import {Router, Route, browserHistory} from 'react-router';
import Home from './Home';
import Post from './Components/Post';
import Test from './Components/Test';

const Routes = (
  <Router history={browserHistory}>
    <Route path="/" component={Home}/>
    <Route path="/post/:postId" component={Post}/>
    <Route path="/test" component={Test}/>
  </Router>
);

export default Routes;
