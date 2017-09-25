import React, { Component } from 'react'
import css from './navigation.css'

import { Layout, Menu, Icon } from 'antd';
const { Header, Sider, Content } = Layout;

import MediaQuery from 'react-responsive'

export default class Navigation extends Component {
  state = {
    collapsed: false,
  };

  toggleSidebar = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    return [
      <Header style={{ background: '#fff', padding: 0 }}>
        <MediaQuery maxWidth={1224}>
          {(matches) => {
            if (matches) {
              return (
                <Icon
                  className={css.trigger}
                  type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                  onClick={this.toggleSidebar}/>
              )
            }
            else {
              return (
                <Menu
                  mode="horizontal"
                  defaultSelectedKeys={['1']}
                  style={{ lineHeight: '64px' }}>
                  <Menu.Item key="1">nav 1</Menu.Item>
                  <Menu.Item key="2">nav 2</Menu.Item>
                  <Menu.Item key="3">nav 3</Menu.Item>
                </Menu>
              )
            }
          }}
        </MediaQuery>
      </Header>
    ]
  }
  
}