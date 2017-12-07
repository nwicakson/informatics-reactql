import React from 'react';
import { Carousel } from 'antd';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import postsQuery from 'src/graphql/gql/queries/posts.gql';
import css from './home.scss';

const Home = props => {
  const { data } = props;
  if (data.loading) return <div>Loading ...</div>;
  if (!SERVER) {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }
  return (
    <Carousel
      autoplay
      className={css.carousel}>
      {data.posts.map(post => {
        const { post_title: title, post_name: name, thumbnail, post_excerpt: postExcerpt } = post;
        const image = thumbnail || data.setting.defaultThumbnail;
        return (
          <div className={css.carouselImage} style={{ backgroundImage: `url(${image})` }}>
            <Link to={`/${encodeURIComponent(name)}`}><div className={css.carouselLink} /></Link>
            <div className={css.carouselDescription}>
              <h2>{title}</h2>
              <div className={css.carouselContent}>
                <p>{postExcerpt}</p>
              </div>
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
