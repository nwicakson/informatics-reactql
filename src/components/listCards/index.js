import React, { Component } from 'react';
import { Row, Col, Card, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import css from './listCards.scss';

export default class ListCards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: (
        props.variables && props.variables.skip && parseInt(props.variables.skip / 12, 10) + 1
      ) || 1,
    };
  }

  componentWillReceiveProps = nextProps => {
    if (nextProps.variables && nextProps.variables.skip) {
      this.setState({ currentPage: parseInt(nextProps.variables.skip / 12, 10) + 1 });
    }
  }

  handleChangeCurrentPage = async pageNumber => this.props.refetch({ skip: 12 * (pageNumber - 1) })

  render() {
    return (
      <div>
        <Row>
          {this.props.posts && this.props.posts.map(post => {
            const { id, post_title: title, post_name: name, thumbnail, post_excerpt: postExcerpt } = post;
            const image = thumbnail || this.props.defaultThumbnail;
            return (
              <Col key={id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <div style={{ padding: '5px' }}>
                  <Card bodyStyle={{ padding: 0 }}>
                    <Link to={`/${encodeURIComponent(name)}`}>
                      <div style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '150px' }} />
                    </Link>
                    <div className={css.cardDescription}>
                      <div className={css.cardTitle}>
                        <h3>{title}</h3>
                      </div>
                      <div className={css.cardContent}>
                        <p>{postExcerpt} </p>
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
