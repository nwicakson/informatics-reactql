import React, { PureComponent } from 'react';
import { gql, graphql } from 'react-apollo';
import PostContent from 'src/components/postContent';

const PageQuery = gql`
  query getPage($page: String){
    post(name: $page){
      id,
      post_title
      post_content
      thumbnail
    }
  }
`;

@graphql(PageQuery, {
  options: ({ match }) => ({
    variables: {
      page: match.params.page,
    },
  }),
})
export default class Page extends PureComponent {
  render() {
    return (
      <PostContent data={this.props.data} />
    );
  }
}
