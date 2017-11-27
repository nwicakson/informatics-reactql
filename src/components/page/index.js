import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Card, Icon } from 'antd';
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
        thumbnail, author, post_date: postDate,
      } = post;
      let displayName;
      let userNicename;
      if (author) {
        displayName = author.display_name;
        userNicename = author.user_nicename;
      }
      let date;
      let dateString;
      if (postDate) {
        date = new Date(0);
        date.setMilliseconds(postDate);
        dateString = date.toDateString();
      }

      const { FacebookShareButton, GooglePlusShareButton, TwitterShareButton } = ShareButtons;
      const FacebookIcon = generateShareIcon('facebook');
      const TwitterIcon = generateShareIcon('twitter');
      const GooglePlusIcon = generateShareIcon('google');
      const shareUrl = !SERVER ? window.location.pathname : null;
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
      const postmeta = (
        <h4>
          {author ? <span><Icon type="user" /> {displayName || userNicename}</span> : null}
          {author && postDate ? <span className="ant-divider" /> : null}
          {postDate ? <span><Icon type="calendar" /> {dateString}</span> : null}
        </h4>
      );

      return (
        <div>
          <Helmet>
            <title>{title}</title>
            <meta property="og:title" content={title} />
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
              title={postmeta}
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
