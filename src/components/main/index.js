// Main React component, that we'll import in `src/app.js`
//
// Note a few points from this file:
//
// 1.  We're using the format `main/index.js` for this file, which means we
// can simply import 'src/components/main', which will auto-default to index.js.
// This is a useful pattern when you have styles/images to pull from, and you
// want to keep the component tree organised.
//
// 2.  We import SASS and a logo SVG file directly.  Classnames will be hashed
// automatically, and images will be compressed/optimised in production.  File
// names that are made available in the import variable will be identical on
// both the server and browser.
//
// 3.  We're introducing React Router in this component.  In RR v4, routes are
// not defined globally-- they're defined declaratively on components, so we
// can respond to route changes anywhere.
//
// 4.  We're using `react-helmet`, which allows us to set <head> data like
// a <title> or <meta> tags, which are filtered up to the main <Html> component
// before HTML rendering.

// ----------------------
// IMPORTS

/* NPM */

// React
import React, { Component, PropTypes } from 'react';

// Routing via React Router
import {
  Link,
  Route,
  Switch,
} from 'react-router-dom';

// <Helmet> component for setting the page title/meta tags
import Helmet from 'react-helmet';

/* ReactQL */

// NotFound 404 handler for unknown routes
import { Redirect } from 'kit/lib/routing';

/* App */

// Child React components. Note:  We can either export one main React component
// per file, or in the case of <Home>, <Page> and <WhenFound>, we can group
// multiple components per file where it makes sense to do so
import GraphQLMessage from 'src/components/graphql';
import { Home, Page, WhenNotFound } from 'src/components/routes';
import ReduxCounter from 'src/components/redux';
import Stats from 'src/components/stats';
import Styles from 'src/components/styles';
import Sidebar from 'src/components/sidebar';
import Navigation from 'src/components/navigation';

// Styles
import css from './main.scss';

// Get the ReactQL logo.  This is a local .svg file, which will be made
// available as a string relative to [root]/dist/assets/img/
import logo from './reactql-logo.svg';
import { Layout, Menu, Icon, Button } from 'antd';
const { Header, Sider, Content } = Layout;

import MediaQuery from 'react-responsive'
import { gql, graphql } from 'react-apollo'


// ----------------------

class MainLayout extends Component {
  state = {
    collapsed: true,
  };

  toggleSidebar = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const {data} = this.props
    const { loading, menu } = data
    let { items } = menu

    return (
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          <MediaQuery maxWidth={1224}>
            {matches => matches ? (
              <Icon
                className={css.trigger}
                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toggleSidebar}/>
            ) : (
              <Menu
                mode="horizontal"
                style={{ lineHeight: '64px' }}>
                {items.map( item => {
                  const {children, object_type: type, post_title: title} = item
                  const linkText = title.length > 0 ? title : item.navitem.post_title
                  const pathname = type === 'page' ? `/${item.navitem.post_name}` : `/${type}/${item.navitem.post_name}`
                  return (
                    <Menu.Item key="{child.navitem.post_title}">
                      <a href="{child.navitem.post_name}">{child.navitem.post_title}</a>
                    </Menu.Item>
                  )
                })}
              </Menu>
            )}
          </MediaQuery>
        </Header>
        <Layout>
          <Sider
            collapsed={this.state.collapsed}
            collapsedWidth={0}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['1']}
              style={{ height: '100%', borderRight: 0 }}>
              <Menu.Item key="1">
                <Icon type="user" />
                <span>nav 1</span>
              </Menu.Item >
            </Menu>
          </Sider>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            <div className={css.hello}/>
            <img src={logo} alt="ReactQL" className={css.logo} />
            <hr />
            <GraphQLMessage />
            <hr />
            <ul>
              <li><Link to="/">Homes</Link></li>
              <li><Link to="/page/about">About</Link></li>
              <li><Link to="/page/contact">Contact</Link></li>
              <li><Link to="/old/path">Redirect from /old/path &#8594; /new/path</Link></li>
            </ul>
            <Button type="primary">Button</Button>
            <hr />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/page/:name" component={Page} />
              <Redirect from="/old/path" to="/new/path" />
              <Route component={WhenNotFound} />
            </Switch>
            <hr />
            <ReduxCounter />
            <hr />
            <p>Runtime info:</p>
            <Stats />
            <hr />
            <p>Stylesheet examples:</p>
            <Styles />
          </Content>
        </Layout>
      </Layout>
    )
  }
}

MainLayout.propTypes = {
  data: PropTypes.object,
  children: PropTypes.node
}

const MenuQuery = gql`
  query getMenu($menu: String){
    menu(name: $menu){
      items {
        id,
        order,
        post_title,
        object_type,
        navitem {
          id,
          post_title,
          post_name
        },
        children {
          id,
          linkedId,
          navitem {
            post_title,
            post_name
          }
        }
      }
    }
  }`

const MainLayoutWithData = graphql(MenuQuery, {
  options: ({menu}) => {
    return {
      variables: {
        menu
      }
    }
  }
})(Menu)

export default MainLayoutWithData