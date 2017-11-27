import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Input, Button, Form, Select, notification, Tooltip, Icon } from 'antd';
import { graphql, compose } from 'react-apollo';
import myPostQuery from 'src/graphql/gql/queries/myPost.gql';
import categoriesQuery from 'src/graphql/gql/queries/categories.gql';
import editPostMutation from 'src/graphql/gql/mutations/editPost.gql';
import { map } from 'lodash';
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
      status: '',
      submitLoading: false,
    };
    if (document) {
      this.ReactQuill = require('react-quill');
    }
  }

  componentWillReceiveProps(newProps) {
    if (!newProps.myPost.loading) {
      const { post_title: title, post_excerpt: excerpt, post_content: content, categories } = newProps.myPost.my_post;
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

  handleSubmitDraft = async () => {
    await this.setState({ status: 'draft', submitLoading: true });
    this.handleSubmit();
  }
  handleSubmitReview = async () => {
    await this.setState({ status: 'pending', submitLoading: true });
    this.handleSubmit();
  }
  handleSubmit = async () => {
    const { data: { edit_post: editPost } } = await this.props.editPost({
      variables: {
        id: this.props.match.params.postId,
        post_title: this.state.title,
        post_excerpt: this.state.excerpt,
        post_content: this.state.content,
        categories: this.state.categories,
        post_status: this.state.status,
      },
    });
    if (editPost) {
      notification.success({
        message: 'Post has been edited successfully',
        onClose: this.handleNotificationClose,
      });
    } else {
      notification.error({
        message: 'Failed to edit post',
        onClose: this.handleNotificationClose,
      });
    }
  }

  render() {
    const { ReactQuill } = this;
    return (
      <div>
        <Helmet>
          <title>Edit Post</title>
          <meta property="og:title" content="Edit Post" />
          <meta property="og:description" content="Edit the suggestion post" />
        </Helmet>
        <Form layout="vertical">
          <h1>Edit Post</h1>
          <Item label="Title">
            <Input
              name="title"
              value={this.state.title}
              onChange={this.handleChange}
              size="large" />
          </Item>
          <Item label="Content">
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
              Excerpt&nbsp;
              <Tooltip title="Passage from the article">
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
          <Item label="Categories">
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
          <div className={css.submit}>
            <Button onClick={this.handleSubmitDraft} loading={this.state.submitLoading}>Save as Draft</Button>
            <Button onClick={this.handleSubmitReview} loading={this.state.submitLoading} type="primary">Submit for Review</Button>
          </div>
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
