import React from 'react';
// Routing via React Router
import { Route, Switch } from 'react-router-dom';
// NotFound 404 handler for unknown routes
import { Redirect } from 'kit/lib/routing';

// Child React components. Note:  We can either export one main React component
// per file, or in the case of <Home>, <Page> and <WhenFound>, we can group
// multiple components per file where it makes sense to do so
import Home from 'src/containers/home';
import Articles from 'src/containers/articles';
import Page from 'src/containers/page';
import Category from 'src/containers/category';
import CreatePost from 'src/containers/createPost';
import EditPost from 'src/containers/editPost';
import MyPosts from 'src/containers/myPosts';
import RequireAuth from 'src/components/requireAuth';

export default props => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/daftar-artikel" component={Articles} />
    <Route path="/kategori/:category" component={Category} />
    <RequireAuth path="/artikel-saya" component={MyPosts} {...props} />
    <RequireAuth path="/buat-artikel" component={CreatePost} {...props} />
    <RequireAuth path="/ubah-artikel/:postId" component={EditPost} {...props} />
    <Route path="/:page" component={Page} />
  </Switch>
);
