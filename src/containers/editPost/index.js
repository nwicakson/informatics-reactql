import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Input, Button, Form, Select, notification, Tooltip, Icon } from 'antd';
import { graphql, compose } from 'react-apollo';
import myPostQuery from 'src/graphql/gql/queries/myPost.gql';
import categoriesQuery from 'src/graphql/gql/queries/categories.gql';
import editPostMutation from 'src/graphql/gql/mutations/editPost.gql';
import { map } from 'lodash';
import { webSettings } from 'src/settings';
import css from './editPost.scss';

const { TextArea } = Input;
const { Item } = Form;
const { Option } = Select;

class EditPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      excerpt: '',
      content: '',
      categories: [],
      submitLoading: false,
    };
    if (document) this.ReactQuill = require('react-quill');
  }

  componentWillReceiveProps(newProps) {
    if (!newProps.myPost.loading) {
      const { post_title: title, post_excerpt: excerpt, post_content: content, categories } = newProps.myPost.my_post && newProps.myPost.my_post;
      this.setState({
        title,
        excerpt,
        content,
        categories: map(categories, 'slug'),
      });
    }
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value })
  handleChangeCategories = value => this.setState({ categories: value })
  handleChangeContent = value => this.setState({ content: value })

  handleNotificationClose = () => this.setState({ submitLoading: false })
  handleSubmit = async status => {
    await this.setState({ submitLoading: true });
    const { data: { edit_post: editPost } } = await this.props.editPost({
      variables: {
        id: this.props.match.params.postId,
        post_title: this.state.title,
        post_excerpt: this.state.excerpt,
        post_content: this.state.content,
        categories: this.state.categories,
        post_status: status,
      },
    });
    if (editPost) {
      notification.success({
        message: 'Artikel berhasil diperbarui',
        onClose: this.handleNotificationClose,
      });
    } else {
      notification.error({
        message: 'Artikel gagal diperbarui',
        onClose: this.handleNotificationClose,
      });
    }
  }

  render() {
    const { ReactQuill } = this;
    return (
      <div>
        <Helmet>
          <title>Ubah Artikel</title>
          <meta property="og:title" content="Ubah Artikel" />
          <meta property="og:description" content="Ubah usulan artikel" />
          <meta property="og:url" content={`${webSettings.baseUrl}/ubah-artikel`} />
        </Helmet>
        <Form layout="vertical">
          <h1 style={{ textAlign: 'center' }}>Ubah Artikel</h1>
          <Item label="Judul">
            <Input
              name="title"
              value={this.state.title}
              onChange={this.handleChange}
              size="large" />
          </Item>
          <Item label="Konten">
            {ReactQuill ? (
              <ReactQuill
                theme="snow"
                value={this.state.content}
                onChange={this.handleChangeContent} />
            ) : (
              <TextArea
                name="content"
                value={this.state.content}
                onChange={this.handleChange} />
            )}
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
            {this.props.categories.loading ? (
              <div>Loading ...</div>
            ) : (
              <Select
                mode="multiple"
                value={this.state.categories}
                onChange={this.handleChangeCategories}>
                {this.props.categories.categories.map(category => <Option key={category.slug}>{category.name}</Option>)}
              </Select>
            )}
          </Item>
          <ul className={css.submit}>
            <li><Button onClick={() => this.handleSubmit('draft')} loading={this.state.submitLoading}>Simpan sebagai Draft</Button></li>
            <li>atau</li>
            <li><Button onClick={() => this.handleSubmit('pending')} loading={this.state.submitLoading} type="primary">Kumpulkan untuk diulas</Button></li>
          </ul>
        </Form>
      </div>
    );
  }
}

export default compose(
  graphql(myPostQuery, {
    name: 'myPost',
    options: ({ match }) => ({
      variables: { id: match.params.postId },
    }),
  }),
  graphql(categoriesQuery, {
    name: 'categories',
  }),
  graphql(editPostMutation, {
    name: 'editPost',
  }),
)(EditPost);
