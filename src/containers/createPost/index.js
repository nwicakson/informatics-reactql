import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';
import { Input, Button, Form, Select, Tooltip, Icon, notification } from 'antd';
import { graphql, compose } from 'react-apollo';
import categoriesQuery from 'src/graphql/gql/queries/categories.gql';
import createPostMutation from 'src/graphql/gql/mutations/createPost.gql';
import { webSettings } from 'src/settings';
import css from './createPost.scss';

const { TextArea } = Input;
const { Item } = Form;
const { Option } = Select;

class CreatePost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      excerpt: '',
      content: '',
      categories: [],
    };
    if (document) this.ReactQuill = require('react-quill');
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value })
  handleChangeCategories = value => this.setState({ categories: value })
  handleChangeContent = value => this.setState({ content: value })

  handleNotificationClose = id => this.props.history.push(`/ubah-artikel/${id}`)
  handleSubmit = async status => {
    const { data: { create_post: createPost } } = await this.props.createPost({
      variables: {
        post_title: this.state.title,
        post_excerpt: this.state.excerpt,
        post_content: this.state.content,
        categories: this.state.categories,
        post_status: status,
      },
    });
    if (createPost) {
      notification.success({
        message: 'Artikel berhasil dibuat',
        onClose: this.handleNotificationClose(createPost.id),
      });
    } else {
      notification.error({
        message: 'Artikel gagal dibuat',
        onClose: this.handleNotificationClose(createPost.id),
      });
    }
  }

  render() {
    const { ReactQuill } = this;
    return (
      <div>
        <Helmet>
          <title>Buat Artikel</title>
          <meta property="og:title" content="Buat Artikel" />
          <meta property="og:description" content="Membuat usulan artikel" />
          <meta property="og:url" content={`${webSettings.baseUrl}buat-artikel`} />
        </Helmet>
        <Form layout="vertical">
          <h1 style={{ textAlign: 'center' }}>Buat Artikel</h1>
          <Item
            label="Judul">
            <Input
              name="title"
              value={this.state.title}
              onChange={this.handleChange}
              size="large" />
          </Item>
          <Item label="Konten">
            {
              ReactQuill ? (
                <ReactQuill
                  theme="snow"
                  value={this.state.content}
                  onChange={this.handleChangeContent} />
              ) : (
                <TextArea
                  name="content"
                  value={this.state.content}
                  onChange={this.handleChange} />
              )
            }
          </Item>
          <Item label={(
            <span>
              Kutipan&nbsp;
              <Tooltip title="Bagian pembuka yang menarik dari artikel">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          )}>
            <TextArea
              name="excerpt"
              value={this.state.excerpt}
              onChange={this.handleChange}
              autosize={{ minRows: 2, maxRows: 6 }} />
          </Item>
          <Item label="Kategori">
            {this.props.categories && this.props.categories.loading ? (
              <div>Loading ...</div>
            ) : (
              <Select
                mode="multiple"
                value={this.state.categories}
                onChange={this.handleChangeCategories}>
                {this.props.categories.categories && this.props.categories.categories.map(category => (
                  <Option key={category.slug}>{category.name}</Option>
                ))}
              </Select>
            )}
          </Item>
          <ul className={css.submit}>
            <li><Button onClick={() => this.handleSubmit('draft')}>Simpan sebagai Draft</Button></li>
            <li>atau</li>
            <li><Button type="primary" onClick={() => this.handleSubmit('pending')}>Kumpulkan untuk diulas</Button>
            </li>
          </ul>
        </Form>
      </div>
    );
  }
}

export default withRouter(compose(
  graphql(categoriesQuery, {
    name: 'categories',
  }),
  graphql(createPostMutation, {
    name: 'createPost',
  }),
)(Form.create()(CreatePost)));
