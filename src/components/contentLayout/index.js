import React from 'react';
// Routing via React Router
import { Route, Switch } from 'react-router-dom';
// NotFound 404 handler for unknown routes
import { Redirect } from 'kit/lib/routing';

// Child React components. Note:  We can either export one main React component
// per file, or in the case of <Home>, <Page> and <WhenFound>, we can group
// multiple components per file where it makes sense to do so
import Articles from 'src/components/articles';
import Page from 'src/components/page';
import Post from 'src/components/post';
import { Home } from 'src/components/routes';

export default () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/articles" component={Articles} />
    <Route path="/post/:post" component={Post} />
    <Route path="/:page" component={Page} />
  </Switch>
);
