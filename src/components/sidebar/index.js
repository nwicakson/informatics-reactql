import React from 'react'
import css from './sidebar.css'

import { Layout, Menu, Icon } from 'antd';
const { Header, Sider, Content } = Layout;

export default (props) => {
  
  return (
    <Sider
      collapsible
      collapsed={props.collapsed}>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}>
        <Menu.Item key="1">
          <Icon type="user" />
          <span>nav 1</span>
        </Menu.Item>
        <Menu.Item key="2">
          <Icon type="video-camera" />
          <span>nav 2</span>
        </Menu.Item>
        <Menu.Item key="3">
          <Icon type="upload" />
          <span>nav 3</span>
        </Menu.Item>
      </Menu>
    </Sider>
  )
  
}