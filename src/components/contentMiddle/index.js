import React from 'react';
// Routing via React Router
import { Route, Switch } from 'react-router-dom';
// NotFound 404 handler for unknown routes
import { Redirect } from 'kit/lib/routing';

// Child React components. Note:  We can either export one main React component
// per file, or in the case of <Home>, <Page> and <WhenFound>, we can group
// multiple components per file where it makes sense to do so
import Home from 'src/components/home';
import Articles from 'src/components/articles';
import Page from 'src/components/page';
import Category from 'src/components/category';
import CreatePost from 'src/components/createPost';
import EditPost from 'src/components/editPost';
import MyPosts from 'src/components/myPosts';
import RequireAuth from 'src/components/requireAuth';

export default props => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/articles" component={Articles} />
    <Route path="/category/:category" component={Category} />
    <RequireAuth path="/my-posts" component={MyPosts} {...props} />
    <RequireAuth path="/create-post" component={CreatePost} {...props} />
    <RequireAuth path="/edit-post/:postId" component={EditPost} {...props} />
    <Route path="/:page" component={Page} />
  </Switch>
);
