import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';
import { graphql } from 'react-apollo';
import menuQuery from 'src/graphql/gql/queries/menu.gql';
import { sortBy } from 'lodash';

const { SubMenu, Item } = Menu;

const Menus = props => {
  const { mode, className, theme } = props;
  const { menu, loading } = props.data;
  if (loading) return <div>Loading</div>;
  const items = sortBy(menu.items, 'order');
  return (
    <Menu
      mode={mode}
      theme="dark"
      className={className}>
      {items.map(item => {
        const { object_type: type, order, children } = item;
        let linkText;
        let pathName;
        if (type === 'category') {
          linkText = item.navitemcategory.name;
          pathName = `/${type}/${item.navitemcategory.slug}`;
        } else {
          linkText = item.navitem.post_title;
          if (type === 'custom') pathName = `${item.url}`;
          else if (type === 'page') pathName = `/${item.navitem.post_name}`;
          else pathName = `/${type}/${item.navitem.post_name}`;
        }
        if (children.length > 0) {
          const submenuTitle = mode === 'inline' ? linkText : <span>{linkText} <Icon type="down" /></span>;
          return (
            <SubMenu
              key={order}
              title={submenuTitle}
              onTitleClick={() => mode !== 'inline' && props.history.push(pathName)}>
              {children.map(child => {
                const { object_type: typeChild, orderChild } = child;
                let linkTextChild;
                let pathNameChild;
                if (typeChild === 'category') {
                  linkTextChild = child.navitemcategory.name;
                  pathNameChild = `/${typeChild}/${child.navitemcategory.slug}`;
                } else {
                  linkTextChild = child.navitem.post_title;
                  if (typeChild === 'custom') pathNameChild = `${child.url}`;
                  else if (typeChild === 'page') pathNameChild = `/${child.navitem.post_name}`;
                  else pathNameChild = `/${typeChild}/${child.navitem.post_name}`;
                }
                return (
                  <Item key={orderChild}>
                    {type === 'custom' ? <a href={pathNameChild}>{linkTextChild}</a> : <Link to={pathNameChild}>{linkTextChild}</Link> }
                  </Item>
                );
              })}
            </SubMenu>
          );
        }
        return (
          <Item key={order}>
            {type === 'custom' ? <a href={pathName}>{linkText}</a> : <Link to={pathName}>{linkText}</Link> }
          </Item>
        );
      })}
    </Menu>
  );
};


export default withRouter(graphql(menuQuery, {
  options: ({ name }) => ({
    variables: { menu: name },
  }),
})(Menus));
