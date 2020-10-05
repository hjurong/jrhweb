import React from "react";

import { Post } from "../Blog";
import { Form } from "../Blog";
import Header from "./header";
import { Sidebar } from "./sidebar";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as ReduxTypes from "ReduxTypes";

const mapStateToProps = (state: ReduxTypes.ReducerState) => ({
	showform: state.home.showform || false,
	isedit: state.home.isedit || false,
	placename: state.map.placename || "",
	location: state.map.center || {}
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxTypes.RootAction>) => ({});

type HomeProps = ReturnType<typeof mapStateToProps> &
	ReturnType<typeof mapDispatchToProps>;

type HomeState = {
	headertext: string;
};

class Home extends React.Component<HomeProps, HomeState> {
	editheader = "Edit Post";
	formheader = "New Post";
	postheader = "Straight from the horse's mouth";

	constructor(props: HomeProps) {
		super(props);
		this.state = {
			headertext: this.postheader
		};
	}
	componentDidMount() {}
	componentDidUpdate(prevProps: HomeProps, prevState: HomeState) {
		if (
			prevProps.showform != this.props.showform ||
			prevProps.isedit != this.props.isedit
		) {
			if (this.props.showform) {
				if (this.props.isedit) {
					this.setState({ headertext: this.editheader });
				} else {
					this.setState({ headertext: this.formheader });
				}
			} else {
				this.setState({ headertext: this.postheader });
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
							{this.props.showform ? (
								<Form
									isedit={this.props.isedit}
									placename={this.props.placename}
									location={this.props.location}
								/>
							) : (
								<Post />
							)}
						</div>
						<Sidebar />
					</div>
				</main>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
