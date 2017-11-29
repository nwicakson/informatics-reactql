import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router';
import { Input, Button, Form, Select, Tooltip, Icon } from 'antd';
import { graphql, compose } from 'react-apollo';
import categoriesQuery from 'src/graphql/gql/queries/categories.gql';
import createPostMutation from 'src/graphql/gql/mutations/createPost.gql';
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
      status: '',
    };
    if (document) {
      this.ReactQuill = require('react-quill');
    }
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value })
  handleChangeCategories = value => this.setState({ categories: value })
  handleChangeContent = value => this.setState({ content: value })

  handleSubmitDraft = async () => {
    await this.setState({ status: 'draft', submitLoading: true });
    this.handleSubmit();
  }
  handleSubmitReview = async () => {
    await this.setState({ status: 'pending', submitLoading: true });
    this.handleSubmit();
  }
  handleSubmit = async () => {
    const { data: { create_post: createPost } } = await this.props.createPost({
      variables: {
        post_title: this.state.title,
        post_excerpt: this.state.excerpt,
        post_content: this.state.content,
        categories: this.state.categories,
        post_status: this.state.status,
      },
    });
    this.props.history.push(`/ubah-artikel/${createPost.id}`);
  }

  render() {
    const { ReactQuill } = this;
    // const { getFieldDecorator, getFieldError, isFieldTouched } = this.props.form;
    const submitDraftDisabled = false;
    const submitReviewDisabled = false;
    // const submitDraftDisabled = !isFieldTouched('title');
    // const submitReviewDisabled = submitDraftDisabled && isFieldTouched('excerpt') && isFieldTouched('categories');
    return (
      <div>
        <Helmet>
          <title>Buat Artikel</title>
          <meta property="og:title" content="Buat Artikel" />
          <meta property="og:description" content="Membuat usulan artikel" />
        </Helmet>
        <Form layout="vertical">
          <h1 style={{ textAlign: 'center' }}>Buat Artikel</h1>
          <Item
            label="Judul"
            validateStatus={submitDraftDisabled ? 'error' : ''}
            help={submitDraftDisabled || ''}>
            {
              // getFieldDecorator('title', {
              //   rules: [{ required: true, message: 'Please fill the title post!' }],
              // })(
              <Input
                name="title"
                value={this.state.title}
                onChange={this.handleChange}
                size="large" />
              // )
            }
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
            {
              // getFieldDecorator('excerpt')(
              <TextArea
                name="excerpt"
                value={this.state.excerpt}
                onChange={this.handleChange}
                autosize={{ minRows: 2, maxRows: 6 }} />
              // )
            }
          </Item>
          <Item label="Kategori">
            {this.props.categories.loading ? (
              <div>Loading ...</div>
            ) : (
              // getFieldDecorator('categories')(
              <Select
                mode="multiple"
                value={this.state.categories}
                onChange={this.handleChangeCategories}>
                {this.props.categories.categories.map(category => (
                  <Option key={category.slug}>{category.name}</Option>
                ))}
              </Select>
              // )
            )}
          </Item>
          <div className={css.submit}>
            <Button
              disabled={submitDraftDisabled}
              onClick={this.handleSubmitDraft}>
              Simpan sebagai Draft
            </Button>
            <Button
              type="primary"
              disabled={submitReviewDisabled}
              onClick={this.handleSubmitReview}>
              Kumpulkan untuk diulas
            </Button>
          </div>
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