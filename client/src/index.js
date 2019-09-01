import React from 'react';
import { createBrowserHistory } from "history";
import ReactDOM from 'react-dom';
import { Route, Switch, Router } from 'react-router-dom';

import { App } from './components';

import '../resources/scss/style.scss';
import '../resources/scss/blog.scss';

document.title = "Jurong's blog";

ReactDOM.render(
  <Router history={createBrowserHistory()}>
    <Switch>
      <Route path="/" component={App} />
    </Switch>
  </Router>,
  document.getElementById('root'),
);
