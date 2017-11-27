import React from 'react';
import { Collapse } from 'antd';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import categoriesQuery from 'src/graphql/gql/queries/categories.gql';
import linksQuery from 'src/graphql/gql/queries/links.gql';
import hotNewsQuery from 'src/graphql/gql/queries/hotNews.gql';
import css from './side.scss';

const { Panel } = Collapse;

export const Categories = graphql(categoriesQuery)(props => {
  const { data } = props;
  if (data.loading) return <div />;
  return (
    <div className={css.list}>
      <ul>
        {data.categories.map(category => <li><Link to={`/category/${category.slug}`}>{category.name}</Link></li>)}
      </ul>
    </div>
  );
});

export const Links = graphql(linksQuery)(props => {
  const { data } = props;
  if (data.loading) return <div />;
  return (
    <div className={css.list}>
      <ul>
        {data.links.map(link => {
          const { link_name: name, link_url: url } = link;
          return <li><Link to={url}>{name}</Link></li>;
        })}
      </ul>
    </div>

  );
});

export const HotNews = graphql(hotNewsQuery, {
  options: () => ({
    variables: { limit: 5 },
  }),
})(props => {
  const { data } = props;
  if (data.loading) return <div />;
  return (
    <div className={css.list}>
      <ul>
        {data.posts.map(post => {
          const { post_name: postName, post_title: postTitle } = post;
          return <li><Link to={`/${encodeURIComponent(postName)}`}>{postTitle}</Link></li>;
        })}
      </ul>
    </div>

  );
});

export const LeftContent = props => {
  const activeKey = props.active ? ['1', '2'] : [];
  return (
    <Collapse defaultActiveKey={activeKey} className={css.collapse}>
      <Panel header="Categories" key="1">
        <Categories />
      </Panel>
      <Panel header="Links" key="2">
        <Links />
      </Panel>
    </Collapse>
  );
};

export const RightContent = props => {
  const activeKey = props.active ? ['1', '2'] : [];
  return (
    <Collapse defaultActiveKey={activeKey} className={css.collapse}>
      <Panel header="Hot News" key="1">
        <HotNews />
      </Panel>
      <Panel header="Links" key="2">
        <Links />
      </Panel>
    </Collapse>
  );
};
