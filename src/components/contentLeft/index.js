import React from 'react';
import { Collapse } from 'antd';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import categoriesQuery from 'src/graphql/gql/queries/categories.gql';
import linksQuery from 'src/graphql/gql/queries/links.gql';
import { lowerCase } from 'lodash';
import css from './contentLeft.scss';

const { Panel } = Collapse;

export const Categories = graphql(categoriesQuery)(props => {
  const { data } = props;
  if (data.loading) return <div />;
  return (
    <div className={css.list}>
      <ul>
        {data.categories.map(category => <li><Link to={`/category/${lowerCase(category)}`}>{category}</Link></li>)}
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

export default () => (
  <Collapse defaultActiveKey={['1', '2']}>
    <Panel header="Categories" key="1">
      <Categories />
    </Panel>
    <Panel header="Links" key="2">
      <Links />
    </Panel>
  </Collapse>
);
