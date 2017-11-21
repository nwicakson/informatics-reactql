import React from 'react';
import { Dropdown, Menu, Button, Icon } from 'antd';
import { Link } from 'react-router-dom';

const { Item, Divider } = Menu;

export default ({ user, refetch }) => {
  const { user_nicename: niceName } = user;
  const handleClick = e => {
    if (e.key === 'logout') {
      window.localStorage.removeItem('reactQLJWT');
      refetch();
    }
  };
  const menu = (
    <Menu style={{ lineHeight: '30px' }} onClick={handleClick}>
      <Item key="create-post">
        <Link to="/create-post">Create Post</Link>
      </Item>
      <Item key="my-posts">
        <Link to="/my-posts">My Posts</Link>
      </Item>
      <Divider />
      <Item key="logout"><Icon type="logout" />  Logout</Item>
    </Menu>
  );
  return (
    <div>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        <Button type="primary" size="large"><Icon type="user" /> {niceName} <Icon type="down" /></Button>
      </Dropdown>
    </div>
  );
};
