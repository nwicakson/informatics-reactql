import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { WhenNotFound } from 'src/components/routes';
import Content from './postContent';
import css from './postContent.css';

export default class PostContent extends Component {
  render() {
    const { data } = this.props;
    const { loading, post } = data;

    if (!loading) {
      if (!post) { return <WhenNotFound />; }

      const { post_title: title, post_content: content, thumbnail } = post;
      return [
        <Helmet>
          <title>{title}</title>
          <meta name="description" content="Helmet application" />
        </Helmet>,
        <div className={css.postContent}>
          <h1>{title}</h1>
          <Content content={content} />
        </div>,
      ];
    }

    return <div>Loading ...</div>;
  }
}
