import React from 'react';
import { connect } from 'react-redux';
import { creators, entitySelector } from '../redux/post-redux';

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.changeTitle = this.changeTitle.bind(this);
  }

  componentWillMount() {
    const {params, loadPost} = this.props;
    const {postId} = params;
    loadPost({
      path: {
        id: postId
      }
    })
  }

  changeTitle(e) {
    const { updateTitle, post } = this.props;
    updateTitle({
      payload: {
        ...post,
        title: e.target.value
      }
    })
  }

  render() {
    const {post} = this.props;

    if(post == null) return <div> Loading post... </div>;

    const {title} = post;
    return (
      <div>
        <p>Current title: {title} </p>
        <input
          type="text"
          placeholder="Change post title"
          onChange={this.changeTitle}/>
      </div>
    )
  }
}

export default connect((state, props) => {
  const post = entitySelector(props.params.postId)(state);
  return {
    post
  }
}, { loadPost: creators.loadRequest, updateTitle:  creators.updateRequest})(Post);
