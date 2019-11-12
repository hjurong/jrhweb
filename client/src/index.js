import React from 'react';
import { createBrowserHistory } from "history";
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch, Router } from 'react-router-dom';

import store from './store';
import { App } from './components';

import '../resources/scss/style.scss';
import '../resources/scss/blog.scss';
import '../resources/scss/form.scss';
import '../resources/scss/post.scss';
import '../resources/scss/map.scss';
import '../resources/scss/react-tagsinput.scss';

// control global debug
let debug = require('debug');
debug.enable('app:*');

document.title = "Jurong's blog";
ReactDOM.render(
  <Router history={createBrowserHistory()}>
    <Provider store={store}>
      <Switch>
        <Route path="/" component={App} />
      </Switch>
    </Provider>
  </Router>,
  document.getElementById('root'),
);
