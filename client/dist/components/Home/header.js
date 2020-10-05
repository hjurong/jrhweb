import React from "react";
import { Map } from "../../components/Blog";
import Tags from "./tags";
var Header = function () {
    return (React.createElement("div", { className: "container" },
        React.createElement("header", { className: "blog-header py-3" },
            React.createElement("div", { className: "row flex-nowrap justify-content-between align-items-center" },
                React.createElement("div", { className: "col-12 text-center" },
                    React.createElement("a", { className: "blog-header-logo text-dark", href: "/" }, "The green light")))),
        React.createElement(Tags, null),
        React.createElement(Map, null)));
};
export default Header;
//# sourceMappingURL=header.js.map