import React, { Component } from 'react';
import { Row, Col, Card, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import css from './listCards.scss';

export default class ListCards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
    };
  }

  refetch = () => {
    this.props.refetch({
      limit: 12,
      skip: 12 * (this.state.currentPage - 1),
    });
  }

  handleChangeCurrentPage = async pageNumber => {
    await this.setState({ currentPage: pageNumber });
    this.refetch();
  }

  render() {
    return (
      <div>
        <Row>
          {this.props.posts.map(post => {
            const { post_title: title, post_name: name, thumbnail, post_excerpt: postExcerpt } = post;
            const image = thumbnail || this.props.defaultThumbnail;
            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                <div style={{ padding: '5px' }}>
                  <Card className={css.card} bodyStyle={{ padding: 0 }}>
                    <Link to={`/${encodeURIComponent(name)}`}>
                      <div style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '150px' }} />
                    </Link>
                    <div className={css.cardContent}>
                      <div>
                        <h3>{title}</h3>
                        <div style={{ height: '3.6em' }}>
                          <p>{postExcerpt}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            );
          })}
        </Row>
        <br />
        <div style={{ textAlign: 'center' }}>
          <Pagination
            simple
            pageSize={12}
            current={this.state.currentPage}
            onChange={this.handleChangeCurrentPage}
            total={this.props.totalPosts} />
        </div>
      </div>
    );
  }
}
