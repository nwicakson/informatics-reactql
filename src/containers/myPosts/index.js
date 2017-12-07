import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Table, Popconfirm, Button, Tag, Select, Pagination, notification } from 'antd';
import { Link } from 'react-router-dom';
import { graphql, compose } from 'react-apollo';
import myPostsQuery from 'src/graphql/gql/queries/myPosts.gql';
import categoriesQuery from 'src/graphql/gql/queries/categories.gql';
import deletePostMutation from 'src/graphql/gql/mutations/deletePost.gql';
import { webSettings } from 'src/settings';
import { startCase } from 'lodash';

const { Option } = Select;

class MyPosts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: ['uncategorized'],
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
    const deletePost = await this.props.deletePost({ variables: { id } });
    this.refetch();
    if (deletePost) notification.success({ message: 'Artikel berhasil dihapus' });
    else notification.error({ message: 'Artikel gagal dihapus' });
  }

  render() {
    const { myPosts, categories } = this.props;
    return (
      <div>
        <Helmet>
          <title>Artikel Saya</title>
          <meta property="og:title" content="Artikel Saya" />
          <meta property="og:url" content={`${webSettings.baseUrl}/artikel-saya`} />
          <meta property="og:description" content="Daftar usulan artikel saya" />
        </Helmet>
        <h1 style={{ textAlign: 'center' }}>Artikel Saya</h1>
        <br />
        <h3>Status</h3>
        <Select
          mode="multiple"
          style={{ minWidth: '200px' }}
          value={this.state.statuses}
          onChange={this.handleChangeStatus}>
          <Option value="draft">Draft</Option>
          <Option value="pending">Pending</Option>
          <Option value="publish">Publish</Option>
        </Select>
        <br /><br />
        <h3>Kategori</h3>
        {categories && categories.loading ? <div>Loading ...</div> : (
          <Select
            mode="multiple"
            style={{ minWidth: '200px' }}
            value={this.state.categories}
            onChange={this.handleChangeCategories}>
            {categories && categories.categories.map(category => <Option key={category.slug}>{category.name}</Option>)}
          </Select>
        )}
        <br /><br />
        {(() => {
          if (myPosts && myPosts.loading) return <div>Loading ...</div>;
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
            { title: 'ID', width: 50, key: 'id', render: record => <span>{record.id}</span> },
            { title: 'Judul', width: 400, key: 'title', dataIndex: 'post_title' },
            { title: 'Status', width: 100, key: 'status', render: record => <span>{startCase(record.post_status)}</span> },
            { title: 'Kategori',
              width: 150,
              key: 'categories',
              render: record => (
                <span>{record.categories.map(category => <Tag key={category.name}>{category.name}</Tag>)}</span>
              ) },
            { title: 'Aksi', width: 200, key: 'action', render: record => <Actions {...record} /> },
          ];
          return (
            <div>
              <Table
                rowKey="id"
                scroll={{ x: 850 }}
                dataSource={myPosts.my_posts}
                columns={columns}
                expandedRowRender={record => {
                  const content = { __html: record.post_content };
                  return <div dangerouslySetInnerHTML={content} />;
                }}
                pagination={false} />
              <br />
              <div style={{ textAlign: 'center' }}>
                <Pagination
                  simple
                  current={this.state.currentPage}
                  onChange={this.handleChangeCurrentPage}
                  total={myPosts.my_total_posts} />
              </div>
            </div>
          );
        })()}
      </div>
    );
  }
}

export default compose(
  graphql(categoriesQuery, {
    name: 'categories',
  }),
  graphql(myPostsQuery, {
    name: 'myPosts',
    options: () => ({
      variables: {
        categories: ['uncategorized'],
        statuses: ['publish', 'draft', 'pending'],
        limit: 10,
        skip: 0,
      },
    }),
  }),
  graphql(deletePostMutation, {
    name: 'deletePost',
  }),
)(MyPosts);
