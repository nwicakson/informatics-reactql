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
      categories: props.categories[0].slug || [],
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
          <title>Artikel Saya</title>
          <meta property="og:title" content="Artikel Saya" />
          <meta property="og:description" content="Daftar usulan artikel saya" />
        </Helmet>
        <h1 style={{ textAlign: 'center' }}>Artikel Saya</h1>
        <br />
        <Row>
          <Col span={4}><h3>Status</h3></Col>
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
          <Col span={4}><h3>Kategori</h3></Col>
          <Col span={20}>
            {categories.loading ? <div>Loading ...</div> : (
              <Select
                mode="multiple"
                style={{ minWidth: '200px' }}
                value={this.state.categories}
                onChange={this.handleChangeCategories}>
                {categories.map(category => <Option key={category.slug}>{category.name}</Option>)}
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
                <Link to={`/ubah-artikel/${id}`}>Ubah</Link>
              </Button>
              <span className="ant-divider" />
              <Popconfirm
                onConfirm={() => this.handleDelete(id)}
                placement="bottomRight"
                title={`Apa anda yakin ingin menghapus data dengan id ${id}?`}
                okText="Iya"
                cancelText="Tidak">
                <Button>Hapus</Button>
              </Popconfirm>
            </span>
          );
          const columns = [
            { title: 'ID', width: 100, key: 'id', render: record => <span>{record.id}</span> },
            { title: 'Judul', width: 400, key: 'title', dataIndex: 'post_title' },
            { title: 'Status', width: 100, key: 'status', render: record => <span>{startCase(record.post_status)}</span> },
            { title: 'Kategori', width: 150, key: 'categories', render: record => <span>{record.categories.map(category => <Tag>{category.name}</Tag>)}</span> },
            { title: 'Aksi', width: 200, key: 'action', render: record => <Actions {...record} /> },
          ];
          return (
            <Row>
              <Table
                rowKey="id"
                dataSource={myPosts.my_posts}
                columns={columns}
                expandedRowRender={record => {
                  const content = { __html: record.post_content };
                  return <div dangerouslySetInnerHTML={content} />;
                }}
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
        categories: categories[0].slug,
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
})(props => <MyPostsWithQuery categories={props.categories.categories} />);