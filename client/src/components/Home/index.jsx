import React from "react";

import { connect } from 'react-redux';
import { Post } from "../../components/Blog";
import { Form } from "../../components/Blog";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.editheader = "Edit Post";
        this.formheader = "New Post";
        this.postheader = "Straight from the horse's mouth";
        this.state = {
            headertext: this.postheader,
        };
    }
    componentDidMount() {
        
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.showform != this.props.showform ||
            prevProps.isedit != this.props.isedit) {
            if (this.props.showform) {
                if (this.props.isedit) {
                    this.setState({ headertext: this.editheader});
                } else {
                    this.setState({ headertext: this.formheader});
                }
            } else {
                this.setState({ headertext: this.postheader});
            }
        }
    }
    render() {
        return (
        <div>
            <Header />
            <main role="main" className="container">
            <div className="row">
                <div className="col-md-8 blog-main">
                <h3 className="pb-4 mb-4 font-italic border-bottom">
                    {this.state.headertext}
                </h3>
                {this.props.showform ? 
                    <Form isedit={this.props.isedit}
                        placename={this.props.placename}
                        center={this.props.center} /> : 
                    <Post />
                }
                </div>
                <Sidebar />
            </div>
            </main>
        </div>
        );
    }
}

const mapStateToProps = state => ({
    showform: state.home.showform || false,
    isedit: state.home.isedit || false,
    placename: state.map.placename || "",
    center: state.map.center || [],
});

const mapDispatchToProps = dispatch => ({
    
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);

