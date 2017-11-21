import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Table, Popconfirm, Button, Tag, Select, Pagination, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import myPostsQuery from 'src/graphql/gql/queries/myPosts.gql';
import categoriesQuery from 'src/graphql/gql/queries/categories.gql';
import deletePostMutation from 'src/graphql/gql/mutations/deletePost.gql';
import { startCase } from 'lodash';

const { Option } = Select;

class MyPosts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: props.categories || [],
      statuses: ['publish', 'draft', 'pending'],
      currentPage: 1,
    };
  }

  refetch = () => {
    this.props.myPosts.refetch({
      categories: this.state.categories,
      statuses: this.state.statuses,
      limit: 10,
      skip: 10 * (this.state.currentPage - 1),
    });
  }

  handleChangeCategories = async value => {
    await this.setState({ categories: value });
    this.refetch();
  }

  handleChangeStatus = async value => {
    await this.setState({ statuses: value });
    this.refetch();
  };

  handleChangeCurrentPage = async pageNumber => {
    await this.setState({ currentPage: pageNumber });
    this.refetch();
  }

  handleDelete = async id => {
    await this.props.deletePost({ variables: { id } });
    this.refetch();
  }

  render() {
    const { myPosts, categories } = this.props;
    return (
      <div>
        <Helmet>
          <title>My Posts</title>
          <meta property="og:title" content="My Posts" />
          <meta property="og:url" content={window.location.pathname} />
          <meta property="og:description" content="List of post contributed by user" />
        </Helmet>
        <Row>
          <Col align="middle" span={24}><h1>My Posts</h1></Col>
        </Row>
        <br />
        <Row>
          <Col span={4}><h3>Statuses</h3></Col>
          <Col span={20}>
            <Select
              mode="multiple"
              style={{ minWidth: '200px' }}
              value={this.state.statuses}
              onChange={this.handleChangeStatus}>
              <Option value="draft">Draft</Option>
              <Option value="pending">Pending</Option>
              <Option value="publish">Publish</Option>
            </Select>
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={4}><h3>Categories</h3></Col>
          <Col span={20}>
            {categories.loading ? <div>Loading ...</div> : (
              <Select
                mode="multiple"
                style={{ minWidth: '200px' }}
                value={this.state.categories}
                onChange={this.handleChangeCategories}>
                {categories.map(category => <Option key={category}>{category}</Option>)}
              </Select>
            )}
          </Col>
        </Row>
        <br />
        {(() => {
          if (myPosts.loading) return <div>Loading ...</div>;
          const Actions = ({ id }) => (
            <span>
              <Button>
                <Link to={`/edit-post/${id}`}>Edit</Link>
              </Button>
              <span className="ant-divider" />
              <Popconfirm
                onConfirm={() => this.handleDelete(id)}
                placement="bottom"
                title="Are you sure to delete this?"
                okText="Yes"
                cancelText="No">
                <Button>Delete</Button>
              </Popconfirm>
            </span>
          );
          const columns = [
            { title: 'Title', key: 'title', dataIndex: 'post_title' },
            { title: 'Status', key: 'status', render: record => <span>{startCase(record.post_status)}</span> },
            { title: 'Categories', key: 'categories', render: record => <span>{record.categories.map(category => <Tag>{category}</Tag>)}</span> },
            { title: 'Action', key: 'action', render: record => <Actions {...record} /> },
          ];
          return (
            <Row>
              <Table
                rowKey="id"
                dataSource={myPosts.my_posts}
                columns={columns}
                expandedRowRender={record => <span>{record.post_excerpt}</span>}
                pagination={false} />
              <br />
              <Col align="middle" span={24}>
                <Pagination
                  simple
                  current={this.state.currentPage}
                  onChange={this.handleChangeCurrentPage}
                  total={myPosts.my_total_posts} />
              </Col>
            </Row>
          );
        })()}
      </div>
    );
  }
}

const MyPostsWithQuery = compose(
  graphql(myPostsQuery, {
    name: 'myPosts',
    options: ({ categories }) => ({
      variables: {
        categories,
        statuses: ['publish', 'draft', 'pending'],
        limit: 100,
        skip: 0,
      },
    }),
  }),
  graphql(deletePostMutation, {
    name: 'deletePost',
  }),
)(MyPosts);

export default graphql(categoriesQuery, {
  name: 'categories',
})(props => <MyPostsWithQuery {...props.categories} />);
