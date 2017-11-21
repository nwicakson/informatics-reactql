import React from 'react';
import { Carousel } from 'antd';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import postsQuery from 'src/graphql/gql/queries/posts.gql';
import css from './home.scss';

const Home = props => {
  const { data } = props;
  if (data.loading) return <div />;
  return (
    <Carousel
      autoplay
      className={css.carousel}>
      {data.posts.map(post => {
        const { post_title: title, post_name: name, thumbnail, post_excerpt: postExcerpt } = post;
        const image = thumbnail || data.settings.defaultThumbnail;
        return (
          <div className={css.carouselBackground} style={{ backgroundImage: `url(${image})` }}>
            <Link to={`${encodeURIComponent(name)}`}><div className={css.carouselImage} /></Link>
            <div className={css.carouselContent}>
              <h2>{title}</h2>
              <p>{postExcerpt}</p>
            </div>
          </div>
        );
      })}
    </Carousel>
  );
};

export default graphql(postsQuery, {
  options: () => ({
    variables: {
      postType: 'post',
      limit: 5,
      skip: 0,
    },
  }),
})(Home);
