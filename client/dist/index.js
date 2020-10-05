import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBrowserHistory } from "history";
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
var debug = require('debug');
debug.enable('app:*');
document.title = "Jurong's blog";
ReactDOM.render(React.createElement(Router, { history: createBrowserHistory() },
    React.createElement(Provider, { store: store },
        React.createElement(Switch, null,
            React.createElement(Route, { path: "/", component: App })))), document.getElementById('root'));
//# sourceMappingURL=index.js.map