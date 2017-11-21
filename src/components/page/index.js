import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Card } from 'antd';
import { graphql } from 'react-apollo';
import postQuery from 'src/graphql/gql/queries/post.gql';
import { WhenNotFound } from 'src/components/routes';
import { ShareButtons, generateShareIcon } from 'react-share';
import SinglePost from './singlePost';
import css from './page.scss';

@graphql(postQuery, {
  options: ({ match }) => ({
    variables: {
      post: match.params.page,
    },
  }),
})
export default class Page extends Component {
  render() {
    const { data } = this.props;
    const { loading, post } = data;

    if (!loading) {
      if (!post) return <WhenNotFound />;
      const {
        post_title: title, post_excerpt: excerpt, post_content: content,
        thumbnail, author: { display_name: displayName, user_nicename: userNicename },
      } = post;

      const { FacebookShareButton, GooglePlusShareButton, TwitterShareButton } = ShareButtons;
      const FacebookIcon = generateShareIcon('facebook');
      const TwitterIcon = generateShareIcon('twitter');
      const GooglePlusIcon = generateShareIcon('google');
      const shareUrl = window.location.pathname;
      const share = (
        <div className={css.share}>
          <FacebookShareButton url={shareUrl} quote={title} className={css.shareButton}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton url={shareUrl} title={title} className={css.shareButton}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>
          <GooglePlusShareButton url={shareUrl} className={css.shareButton}>
            <GooglePlusIcon size={32} round />
          </GooglePlusShareButton>
        </div>
      );

      return (
        <div>
          <Helmet>
            <title>{title}</title>
            <meta property="og:title" content={title} />
            <meta property="og:url" content={window.location.pathname} />
            <meta property="og:description" content={excerpt} />
            {thumbnail ? <meta property="og:image" content={thumbnail} /> : <div />}
          </Helmet>
          <Card
            title={<h1>{title}</h1>}
            extra={share}
            bordered={false}
            noHovering
            bodyStyle={{ padding: '0px' }}>
            <Card
              title={<h3>by : {displayName || userNicename}</h3>}
              bordered={false}
              noHovering
              className={css.card}>
              <SinglePost content={content} />
            </Card>
          </Card>
        </div>
      );
    }

    return <div>Loading ...</div>;
  }
}
