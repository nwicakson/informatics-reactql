import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export default ({ component, data, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (data.loading) return <div>Loading</div>;
      else if (!data.session.user) return <Redirect push to={'/'} />;
      const Component = component;
      return <Component {...props} />;
    }} />
);
