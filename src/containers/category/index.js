import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'react-apollo';
import postsCategoryQuery from 'src/graphql/gql/queries/postsCategory.gql';
import ListCards from 'src/components/listCards';
import { webSettings } from 'src/settings';

const Category = props => {
  if (props.data && props.data.loading) return <div>Loading ...</div>;
  const {
    refetch, category: { name, posts, total_posts: totalPosts },
    setting: { defaultThumbnail }, variables,
  } = props.data;
  return (
    <div>
      <Helmet>
        <title>Category : {name}</title>
        <meta property="og:title" content={`Category : ${name}`} />
        <meta property="og:description" content={`List of category ${name}`} />
        <meta property="og:url" content={`${webSettings.baseUrl}/kategori/${props.match.params.category}`} />
      </Helmet>
      <h1 style={{ textAlign: 'center' }}>Kategori {name}</h1>
      <ListCards
        posts={posts}
        defaultThumbnail={defaultThumbnail}
        totalPosts={totalPosts}
        refetch={refetch}
        variables={variables} />
    </div>
  );
};

export default graphql(postsCategoryQuery, {
  options: ({ match }) => ({
    variables: {
      slug: match.params.category,
      postType: 'post',
      limit: 12,
      skip: 0,
    },
  }),
})(Category);
