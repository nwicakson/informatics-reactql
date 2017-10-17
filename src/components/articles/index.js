import React, { Component } from 'react';
import { gql, graphql } from 'react-apollo';
import { Row, Col, AutoComplete, Card } from 'antd';
import { Link } from 'react-router-dom';
import css from './articles.scss';

const ArticlesQuery = gql`
  query getPosts($postType: String, $limit: Int, $skip: Int){
    posts(post_type: $postType, limit: $limit, skip: $skip ){
      id
      post_title
      post_name
      post_excerpt
      thumbnail
    }
    settings{
      defaultThumbnail
    }
  }
`;

@graphql(ArticlesQuery, {
  options: () => ({
    variables: {
      postType: 'post',
      limit: 10,
      skip: 0,
    },
  }),
})
export default class Articles extends Component {
  render() {
    const { data } = this.props;
    if (data.loading) { return (<div />); }
    const dataSources = data.posts.post_title;
    return (
      <div>
        <Row type="flex" justify="center">
          <AutoComplete
            style={{ width: 200 }}
            dataSource={dataSources}
            placeholder="search articles"
            filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1} />
        </Row>

        <Row gutter={8}>
          {data.posts.map(post => {
            const { post_title: title, post_name: name, thumbnail, post_excerpt: postExcerpt } = post;
            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card style={{ margin: 10 }} bodyStyle={{ padding: 0 }}>
                  <Link to={`post/${encodeURIComponent(name)}`}>
                    <div className={css.customImage}>
                      <img alt="example" width="100%" src={thumbnail || data.settings.defaultThumbnail} />
                    </div>
                    <div className={css.customCard}>
                      <h3>{title}</h3>
                      <p>{postExcerpt}</p>
                    </div>
                  </Link>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }
}
