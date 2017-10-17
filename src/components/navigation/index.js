import React, { Component } from 'react';
import MediaQuery from 'react-responsive';
import { Popover, Layout, Menu, Icon, LocaleProvider, Radio, Button } from 'antd';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import { sortBy } from 'lodash';
import ContentLayout from 'src/components/contentLayout';
import Login from 'src/components/login';
import enUS from 'antd/lib/locale-provider/en_US';
import moment from 'moment';
import 'moment/locale/id';
import css from './navigation.scss';

moment.locale('id');

const { Header, Sider, Content } = Layout;

const NavigationQuery = gql`
  query getMenu($menu: String){
    menu(name: $menu){
      items {
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
  }
`;

@graphql(NavigationQuery, {
  options: ({ menu }) => ({
    variables: { menu },
  }),
})
export default class Navigation extends Component {
  constructor() {
    super();
    this.state = {
      locale: enUS,
      collapsed: true,
    };
  }
  changeLocale = e => {
    const localeValue = e.target.value;
    this.setState({ locale: localeValue });
    if (!localeValue) {
      moment.locale('id');
    } else {
      moment.locale('en');
    }
  }

  toggleSidebar = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const { data } = this.props;
    const menu = data.menu;
    if (data.loading) { return (<div />); }

    let { items } = menu;
    items = sortBy(items, 'order');
    return (
      <LocaleProvider locale={this.state.locale}>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <MediaQuery maxWidth={1024}>
              {matches => {
                if (matches) {
                  return (
                    <Icon
                      className={css.trigger}
                      type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                      onClick={this.toggleSidebar} />
                  );
                }
                return (
                  <Menu
                    mode="horizontal"
                    style={{ float: 'left', lineHeight: '64px' }} >
                    {items.map(item => {
                      const { object_type: type, post_title: title } = item;
                      const linkText = title.length > 0 ? title : item.navitem.post_title;
                      const pathname = type === 'page' ? `/${item.navitem.post_name}` : `/${type}/${item.navitem.post_name}`;
                      return (
                        <Menu.Item key={item.navitem.post_name}>
                          <Link to={pathname}>{linkText}</Link>
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                );
              }}
            </MediaQuery>
            <div className={css.navRight}>
              <div>
                <Radio.Group defaultValue={enUS} onChange={this.changeLocale}>
                  <Radio.Button key="en" value={enUS}>English</Radio.Button>
                  <Radio.Button key="id">Indonesia</Radio.Button>
                </Radio.Group>
              </div>
              <div>
                <Popover content={<Login />} placement="bottomRight" trigger="click">
                  <Button>Login</Button>
                </Popover>
              </div>
            </div>
          </Header>
          <Layout className={'ant-layout-has-sider'}>
            <MediaQuery maxWidth={1024}>
              <Sider
                collapsed={this.state.collapsed}
                collapsedWidth={0}>
                <Menu
                  className={css.sidebarMenu}
                  mode="inline">
                  {items.map(item => {
                    const { object_type: type, post_title: title } = item;
                    const linkText = title.length > 0 ? title : item.navitem.post_title;
                    const pathname = type === 'page' ? `/${item.navitem.post_name}` : `/${type}/${item.navitem.post_name}`;
                    return (
                      <Menu.Item key={item.navitem.post_name}>
                        <Link to={pathname}>
                          <Icon type="user" />
                          <span>{linkText}</span>
                        </Link>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              </Sider>
            </MediaQuery>
            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
              <ContentLayout />
            </Content>
          </Layout>
        </Layout>
      </LocaleProvider>
    );
  }
}
