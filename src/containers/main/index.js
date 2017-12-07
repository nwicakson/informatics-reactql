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
import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import sessionQuery from 'src/graphql/gql/queries/session.gql';
import { Layout, Icon, Affix } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { LeftContent, RightContent } from 'src/containers/content/side';
import MiddleContent from 'src/containers//content/middle';
import Menu from 'src/components/menu';
import LanguageSwitcher from 'src/components/languangeSwitcher';
import User from 'src/components/user';
import Login from 'src/components/login';
import { webSettings } from 'src/settings';
import css from './main.scss';
import iconHome from './icon-informatika.png';

const { Header, Sider, Content } = Layout;

@graphql(sessionQuery)
export default class Main extends Component {
  state = {
    collapsed: true,
  };

  toggleSidebar = () => {
    this.setState({ collapsed: !this.state.collapsed });
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  render() {
    const { data } = this.props;
    const user = data && !data.loading && data.session && data.session.user;
    return (
      <div>
        <Helmet>
          <title>Departemen Informatika, FTIK – ITS</title>
          <link rel="icon" href={iconHome} />
          <meta property="og:site_name" content="Departemen Informatika, FTIK – ITS" />
          <meta property="og:url" content={webSettings.baseUrl} />
          <meta property="og:title" content="Departemen Informatika, FTIK – ITS" />
          <meta property="og:description" content="Jurusan Teknik Informatika" />
          <meta property="og:image" content={iconHome} />
        </Helmet>
        <Layout>
          <Affix>
            <Header className={css.header}>
              <Icon
                className={css.trigger}
                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toggleSidebar} />
              <div className={css.navLeft}>
                <Link to="/">
                  <img alt="icon" src={iconHome} style={{ verticalAlign: 'middle' }} />
                </Link>
                <Menu mode="horizontal" name="header-menu" theme="dark" className={css.menuHeader} />
              </div>
              <div className={css.navRight}>
                {
                // <MediaQuery minWidth={750}>
                //   <LanguageSwitcher />
                // </MediaQuery>
                }
                {user ? <User {...data} /> : <Login />}
              </div>
            </Header>
          </Affix>
          <Layout>
            <Sider
              collapsed={this.state.collapsed}
              collapsedWidth={0}
              width={150}
              className={css.sider}>
              <Menu mode="inline" name="header-menu" theme="dark" inlineIndent={14} className={css.menuSider} />
            </Sider>
            {
              <Content className={css.sideContent}>
                <LeftContent active />
              </Content>
            }
            <Content>
              <div className={css.middleTopContent}>
                <LeftContent />
                <RightContent />
              </div>
              <div className={css.middleContent}>
                <MiddleContent {...this.props} />
              </div>
            </Content>
            {
              <Content className={css.sideContent}>
                <RightContent active />
              </Content>
            }
          </Layout>
        </Layout>
      </div>
    );
  }
}
