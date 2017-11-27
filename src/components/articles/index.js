import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'react-apollo';
import postsQuery from 'src/graphql/gql/queries/posts.gql';
import ListCards from 'src/components/listCards';

const Articles = props => {
  const { loading } = props.data;
  if (loading) return <div />;
  const {
    refetch,
    posts,
    settings: { defaultThumbnail },
    total_posts: totalPosts, variables,
  } = props.data;
  return (
    <div>
      <Helmet>
        <title>Articles</title>
        <meta property="og:title" content="Articles" />
        <meta property="og:description" content="List of articles that has been published" />
      </Helmet>
      <ListCards
        posts={posts}
        defaultThumbnail={defaultThumbnail}
        totalPosts={totalPosts}
        refetch={refetch}
        variables={variables} />
    </div>
  );
};

export default graphql(postsQuery, {
  options: () => ({
    variables: {
      postType: 'post',
      limit: 12,
      skip: 0,
    },
  }),
})(Articles);
