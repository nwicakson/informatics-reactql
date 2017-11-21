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
import MediaQuery from 'react-responsive';
import Menu from '../menu';
import ContentLeft from '../contentLeft';
import ContentMiddle from '../contentMiddle';
import ContentRight from '../contentRight';
import LanguageSwitcher from '../languangeSwitcher';
import User from '../user';
import Login from '../login';
import css from './main.scss';
import iconHome from './icon-informatika.png';

const { Header, Sider, Content } = Layout;

const CustomizedSider = props => (
  <MediaQuery maxWidth={1024}>
    <Sider
      collapsed={props.collapsed}
      collapsedWidth={0}
      width={160}
      className={css.sider}>
      <Menu mode="inline" name="desktop-menu" theme="dark" className={css.menuSider} />
    </Sider>
  </MediaQuery>
);
CustomizedSider.__ANT_LAYOUT_SIDER = true;

@graphql(sessionQuery)
export default class Main extends Component {
  state = {
    collapsed: true,
  };

  toggleSidebar = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const { data, data: { refetch } } = this.props;
    const { user } = !data.loading && data.session;
    return (
      <div>
        <Helmet>
          <title>Departemen Informatika, FTIK – ITS</title>
          <link rel="icon" href={iconHome} />
          <meta property="og:site_name" content="Departemen Informatika, FTIK – ITS" />
          <meta property="og:title" content="Departemen Informatika, FTIK – ITS" />
          <meta property="og:url" content={window.location.pathname} />
          <meta property="og:description" content="Jurusan Teknik Informatika" />
          <meta property="og:image" content={iconHome} />
        </Helmet>
        <Layout>
          <Affix>
            <Header className={css.header}>
              <MediaQuery maxWidth={1024}>
                <Icon
                  className={css.trigger}
                  type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                  onClick={this.toggleSidebar} />
              </MediaQuery>
              <div className={css.navLeft}>
                <Link to="/">
                  <img alt="icon" src={iconHome} style={{ verticalAlign: 'middle' }} />
                </Link>
                <MediaQuery minWidth={1024}>
                  <Menu mode="horizontal" name="desktop-menu" theme="dark" className={css.menuHeader} />
                </MediaQuery>
              </div>
              <div className={css.navRight}>
                {
                // <MediaQuery minWidth={750}>
                //   <LanguageSwitcher />
                // </MediaQuery>
                }
                {user ? <User user={user} refetch={refetch} /> : <Login />}
              </div>
            </Header>
          </Affix>
          <Layout>
            <CustomizedSider collapsed={this.state.collapsed} />
            {
              <Content className={css.sideContent}>
                <ContentLeft />
              </Content>
            }
            <Content className={css.middleContent}>
              <ContentMiddle data={data} />
            </Content>
            {
              <Content className={css.sideContent}>
                <ContentRight />
              </Content>
            }
          </Layout>
        </Layout>
      </div>
    );
  }
}
