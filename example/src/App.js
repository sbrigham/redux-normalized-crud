import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { connect } from 'react-redux';
import {
  creators as postCreators,
  paginationSelector as pagedPosts,
  entitySelector as postSelector
} from './redux/post-redux';
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
    const { posts } = this.props;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <ul>
          {
            posts.map(p => (
              <li key={p.id}>
                {p.title}
              </li>
            )
          )}
        </ul>
      </div>
    );
  }
}

export default connect(state => {
  const groupedPosts = pagedPosts({key: 'user', index: 1})(state);
  const posts = groupedPosts.ids.map(id => postSelector(id)(state));
  return {
    posts
  }
}, {
  loadPosts: postCreators.loadRequest,
  loadComments: commentCreators.loadRequest
})(App);
