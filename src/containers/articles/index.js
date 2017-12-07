import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'react-apollo';
import postsQuery from 'src/graphql/gql/queries/posts.gql';
import ListCards from 'src/components/listCards';
import { webSettings } from 'src/settings';

const Articles = props => {
  const { loading } = props.data;
  if (loading) return <div>Loading...</div>;
  const {
    refetch,
    posts,
    setting: { defaultThumbnail },
    total_posts: totalPosts, variables,
  } = props.data;
  return (
    <div>
      <Helmet>
        <title>Articles</title>
        <meta property="og:title" content="Articles" />
        <meta property="og:description" content="List of articles that has been published" />
        <meta property="og:url" content={`${webSettings.baseUrl}/daftar-artikel`} />
      </Helmet>
      <h1 style={{ textAlign: 'center' }}>Daftar Artikel</h1>
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
