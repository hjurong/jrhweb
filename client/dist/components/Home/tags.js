import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { tagLinkClicked } from "../../actions";
var appSettings = require('../../lib/app-settings');
var tagsLogger = require('debug')("app:home:tags");
var Tags = function (_a) {
    var tagLinkClicked = _a.tagLinkClicked;
    var _b = useState([]), tag2IdsArr = _b[0], setTtag2IdsArr = _b[1];
    var handleTagOnClick = function (e) {
        e.preventDefault();
        var target = e.target;
        var tagIdx = target.getAttribute("data-index") || -1;
        var postids = [];
        var tagname = 'All';
        if (tagIdx != -1) {
            postids = tag2IdsArr[tagIdx]['postids'].split(",").map(Number);
            tagname = tag2IdsArr[tagIdx]['tag'];
        }
        tagLinkClicked({
            postids: postids,
            tagname: tagname,
        });
    };
    useEffect(function () {
        var url = new URL(appSettings.apihost + "/api/rest/tags");
        fetch(url.href).then(function (resp) { return resp.json(); }).then(function (data) {
            setTtag2IdsArr(data);
        }).catch(function (err) {
            tagsLogger(err);
        });
    }, []);
    return (React.createElement("div", { className: "nav-scroller py-1 mb-2" },
        React.createElement("nav", { className: "nav d-flex" },
            React.createElement("a", { className: "p-2 text-muted", href: "#", key: -1, "data-index": -1, onClick: handleTagOnClick }, "All"),
            tag2IdsArr.map(function (value, index) {
                return (React.createElement("a", { className: "p-2 text-muted", href: "#", key: index, "data-index": index, onClick: handleTagOnClick }, value.tag));
            }))));
};
var mapStateToProps = function (state) { return ({}); };
var mapDispatchToProps = function (dispatch) { return ({
    tagLinkClicked: function (data) { return dispatch(tagLinkClicked(data)); },
}); };
export default connect(mapStateToProps, mapDispatchToProps)(Tags);
//# sourceMappingURL=tags.js.map