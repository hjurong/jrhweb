import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { tagLinkClicked } from '../../actions'


const appSettings = require('../../lib/app-settings');
const tagsLogger = require('debug')("app:home:tags");
 
const Tags = ({tagLinkClicked}) => {
    const [tag2IdsArr, setTtag2IdsArr] = useState([]);
 
    const handleTagOnClick = (e) => {
        e.preventDefault();

        let tagIdx = e.target.getAttribute("data-index");
        let postids = [];
        let tagname = 'All'
        if (tagIdx != -1) {
            postids = tag2IdsArr[tagIdx]['postids'].split(",").map(Number);
            tagname = tag2IdsArr[tagIdx]['tag'];
        }
        tagLinkClicked({
            postids: postids, 
            tagname: tagname,
        });
    };
 
    useEffect(() => {      
        let url = `${appSettings.apihost}/api/rest/tags`;
        url = new URL(url);
        fetch(url).then(resp => resp.json()).then(data => {
            setTtag2IdsArr(data);
        }).catch(err => {
            tagsLogger(err);
        });
    }, []);
 
    return (
    <div className="nav-scroller py-1 mb-2">
        <nav className="nav d-flex">
            <a className="p-2 text-muted" href="#" key={-1} data-index={-1} onClick={handleTagOnClick}>
                All
            </a>
            {tag2IdsArr.map((value, index) => {
                return (
                    <a className="p-2 text-muted" href="#" key={index} data-index={index} onClick={handleTagOnClick}>
                        {value.tag}
                    </a>
                )
            })}
        </nav>
    </div>
    );
};
 

const mapStateToProps = state => ({

});
  
const mapDispatchToProps = dispatch => ({
    tagLinkClicked: data => dispatch(tagLinkClicked(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Tags);