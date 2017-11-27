import React from 'react';
import { Helmet } from 'react-helmet';
import { graphql } from 'react-apollo';
import postsCategoryQuery from 'src/graphql/gql/queries/postsCategory.gql';
import ListCards from 'src/components/listCards';
import { lowerCase, startCase } from 'lodash';

const Category = props => {
  const { loading } = props.data;
  if (loading) return <div>Loading</div>;
  const {
    refetch, category: { posts, total_posts: totalPosts },
    settings: { defaultThumbnail }, variables,
  } = props.data;
  const { category } = props.match.params;
  return (
    <div>
      <Helmet>
        <title>Category : {startCase(category)}</title>
        <meta property="og:title" content={`Category : ${startCase(category)}`} />
        <meta property="og:description" content={`List of category ${lowerCase(category)}`} />
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

export default graphql(postsCategoryQuery, {
  options: ({ match }) => ({
    variables: {
      slug: match.params.category,
      limit: 12,
      skip: 0,
    },
  }),
})(Category);
