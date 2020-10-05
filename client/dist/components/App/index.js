import React from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import { Home } from '../../components';
var App = function (props) {
    return (React.createElement(Switch, null,
        React.createElement(Route, { exact: true, path: "/", component: Home })));
};
export default withRouter(App);
//# sourceMappingURL=index.js.map