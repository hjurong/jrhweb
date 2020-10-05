var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React from "react";
var Sidebar = /** @class */ (function (_super) {
    __extends(Sidebar, _super);
    function Sidebar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Sidebar.prototype.render = function () {
        return (React.createElement("aside", { className: "col-md-4 blog-sidebar" },
            React.createElement("div", { className: "p-4 mb-3 bg-light rounded" },
                React.createElement("h4", { className: "font-italic" }, "About"),
                React.createElement("p", { className: "mb-0" }, "A simple personal blog.")),
            React.createElement("div", { className: "p-4" },
                React.createElement("h4", { className: "font-italic" }, "Archives"),
                React.createElement("ol", { className: "list-unstyled mb-0" },
                    React.createElement("li", null,
                        React.createElement("a", { href: "#" }, "March 2014")),
                    React.createElement("li", null,
                        React.createElement("a", { href: "#" }, "February 2014")),
                    React.createElement("li", null,
                        React.createElement("a", { href: "#" }, "January 2014")))),
            React.createElement("div", { className: "p-4" },
                React.createElement("h4", { className: "font-italic" }, "Elsewhere"),
                React.createElement("ol", { className: "list-unstyled" },
                    React.createElement("li", null,
                        React.createElement("a", { href: "https://github.com/hjurong" }, "GitHub"))))));
    };
    return Sidebar;
}(React.Component));
export { Sidebar };
//# sourceMappingURL=sidebar.js.map