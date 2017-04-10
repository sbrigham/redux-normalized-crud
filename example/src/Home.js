import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import logo from './logo.svg';
import './App.css';
import {
  creators as postCreators,
  groupingSelector as pagedPosts,
  entitySelector as postSelector,
} from './redux/post-redux';
import { creators as commentCreators } from './redux/comment-redux';


class App extends Component {
  componentWillMount() {
    this.props.getPosts({
      query: { url: 'posts' },
      group: {
        by: {
          key: 'user',
          index: 1,
        },
      },
    });
    this.props.getPosts({
      query: { url: 'posts' },
      group: {
        by: {
          key: 'user',
          index: 2,
        },
      },
    });
    this.props.getComments();
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
        <div>
          {
            posts.map(p => (
              <div key={p.id}>
                <Link to={`/post/${p.id}`}>
                  {p.title}
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    );
  }
}

export default connect((state) => {
  const groupedPosts = pagedPosts({ key: 'user', index: 1 })(state);
  const posts = groupedPosts.ids.map(id => postSelector(id)(state));
  return {
    posts,
  };
}, {
  getPosts: postCreators.listRequest,
  getComments: commentCreators.listRequest,
})(App);
