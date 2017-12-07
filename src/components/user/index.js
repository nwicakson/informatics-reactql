import React from 'react';
import { Dropdown, Menu, Button, Icon } from 'antd';
import { Link } from 'react-router-dom';

const { Item, Divider } = Menu;

export default ({ session: { user }, refetch }) => {
  const { display_name: displayName } = user;
  const handleClick = e => {
    if (e.key === 'logout') {
      if (!SERVER) window.localStorage.removeItem('reactQLJWT');
      refetch();
    }
  };
  const menu = (
    <Menu style={{ lineHeight: '30px' }} onClick={handleClick}>
      <Item key="buat-artikel">
        <Link to="/buat-artikel">Buat Artikel</Link>
      </Item>
      <Item key="artikel-saya">
        <Link to="/artikel-saya">Artikel Saya</Link>
      </Item>
      <Divider />
      <Item key="logout"><Icon type="logout" />  Keluar</Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <Button type="primary" size="large"><Icon type="user" /> {displayName} <Icon type="down" /></Button>
    </Dropdown>
  );
};
