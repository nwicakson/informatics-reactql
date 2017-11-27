import React, { Component } from 'react';
import { Form, Icon, Input, Button, Popover } from 'antd';
import { graphql } from 'react-apollo';
import sessionQuery from 'src/graphql/gql/queries/session.gql';
import loginMutation from 'src/graphql/gql/mutations/login.gql';
import css from './login.scss';

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class LoginForm extends Component {
  state = {
    username: '',
    password: '',
    errors: [],
  };

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
  }

  // Set the form state locally. We could use Redux for this (if we care about
  // the values in other parts of our app), but we'll keep this simple by
  // keeping field -> vals locally
  handleChange = e => this.setState({
    [e.target.name]: e.target.value,
  })

  tryLogin = async () => {
    try {
      // Send the login request to the server using our username/password,
      // await the response, and parse the `data.login` entry point
      const { data: { login } } = await this.props.mutate({
        variables: {
          username: this.state.username,
          password: this.state.password,
        },
      });

      // Do we have any errors?  If so, set them on the state so we can
      // re-render the login form with the right message
      if (login.errors) {
        this.setState({ errors: login.errors });
        return;
      }

      // Set the errors to null, in case the user attempted a login previously
      this.setState({ errors: [] });

      // Store the returned JWT token in `localStorage` if we're in the
      // browser, so we can pass that over in subsequent requests
      if (!SERVER) window.localStorage.setItem('reactQLJWT', login.jwt);
    } catch (e) {
      // Some kind of error was returned -- display it in the console
      // eslint-disable-next-line no-console
      console.error('GraphQL error: ', e.message);
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
      }
    });
    this.tryLogin();
  }

  render() {
    const FormItem = Form.Item;
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;

    // Only show error after a field is touched.
    const userNameError = isFieldTouched('userName') && getFieldError('userName');
    const passwordError = isFieldTouched('password') && getFieldError('password');
    return (
      <Form onSubmit={this.handleSubmit} style={{ padding: '5px' }}>
        <FormItem
          validateStatus={userNameError ? 'error' : ''}
          help={userNameError || ''}>
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input
              prefix={<Icon type="user" style={{ fontSize: 13 }} />}
              name="username"
              placeholder="Username"
              onChange={this.handleChange} />,
          )}
        </FormItem>
        <FormItem
          validateStatus={passwordError ? 'error' : ''}
          help={passwordError || ''}>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
              name="password"
              type="password"
              placeholder="Password"
              onChange={this.handleChange} />,
          )}
        </FormItem>
        <Button
          type="primary"
          className={css.formSubmitButton}
          htmlType="submit"
          disabled={hasErrors(getFieldsError())}>
            Log In
        </Button>
      </Form>

    );
  }
}

const LoginFormWithQuery = graphql(loginMutation, {
  options: {
    update(proxy, { data: { login } }) {
      const data = proxy.readQuery({
        query: sessionQuery,
      });
      data.session = login;
      proxy.writeQuery({ query: sessionQuery, data });
    },
  },
})(Form.create()(LoginForm));

export default () => (
  <div>
    <Popover content={<LoginFormWithQuery />} placement="bottomRight" trigger="click">
      <Button type="primary" size="large"><Icon type="login" /> Login</Button>
    </Popover>
  </div>
);
