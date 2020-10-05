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
import { connect } from 'react-redux';
import { Post } from "../../components/Blog";
import { Form } from "../../components/Blog";
import Header from "./header";
import { Sidebar } from "./sidebar";
var Home = /** @class */ (function (_super) {
    __extends(Home, _super);
    function Home(props) {
        var _this = _super.call(this, props) || this;
        _this.editheader = "Edit Post";
        _this.formheader = "New Post";
        _this.postheader = "Straight from the horse's mouth";
        _this.state = {
            headertext: _this.postheader,
        };
        return _this;
    }
    Home.prototype.componentDidMount = function () {
    };
    Home.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (prevProps.showform != this.props.showform ||
            prevProps.isedit != this.props.isedit) {
            if (this.props.showform) {
                if (this.props.isedit) {
                    this.setState({ headertext: this.editheader });
                }
                else {
                    this.setState({ headertext: this.formheader });
                }
            }
            else {
                this.setState({ headertext: this.postheader });
            }
        }
    };
    Home.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement(Header, null),
            React.createElement("main", { role: "main", className: "container" },
                React.createElement("div", { className: "row" },
                    React.createElement("div", { className: "col-md-8 blog-main" },
                        React.createElement("h3", { className: "pb-4 mb-4 font-italic border-bottom" }, this.state.headertext),
                        this.props.showform ?
                            React.createElement(Form, { isedit: this.props.isedit, placename: this.props.placename, location: this.props.location }) :
                            React.createElement(Post, null)),
                    React.createElement(Sidebar, null)))));
    };
    return Home;
}(React.Component));
var mapStateToProps = function (state) { return ({
    showform: state.home.showform || false,
    isedit: state.home.isedit || false,
    placename: state.map.placename || "",
    location: state.map.center || [],
}); };
var mapDispatchToProps = function (dispatch) { return ({}); };
export default connect(mapStateToProps, mapDispatchToProps)(Home);
//# sourceMappingURL=index.js.map