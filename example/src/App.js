import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import { creators as postCreators } from './redux/post-redux';
import { creators as commentCreators } from './redux/comment-redux';

class App extends Component {
  componentWillMount() {
    this.props.loadPosts({
      paginate: {
        groupBy: {
          key: 'user',
          index: 1
        }
      }
    });
    this.props.loadComments({});
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default connect(state => state, {
  loadPosts: postCreators.loadRequest,
  loadComments: commentCreators.loadRequest
})(App);
