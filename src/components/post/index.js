import React, { PureComponent } from 'react';
import { gql, graphql } from 'react-apollo';
import PostContent from 'src/components/postContent';

const PostQuery = gql`
  query getPost($post: String){
    post(name:$post){
      id
      post_title
      post_content
      thumbnail
    },
    settings{
      uploads
      amazonS3
    }
  }
`;

@graphql(PostQuery, {
  options: ({ match }) => ({
    variables: {
      post: match.params.post,
    },
  }),
})
export default class Post extends PureComponent {
  render() {
    return (
      <PostContent data={this.props.data} />
    );
  }
}
