import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as ReduxTypes from "ReduxTypes";
import { tagLinkClicked, TagLinkClickedData } from "../../actions";
import appSettings from "../../lib/app-settings";

const tagsLogger = require("debug")("app:home:tags");

type Tag2IdsData = {
	postids: string;
	tag: string;
	cnt: number;
};

const Tags = ({ tagLinkClicked }) => {
	const [tag2IdsArr, setTtag2IdsArr] = useState<Tag2IdsData[]>([]);

	const handleTagOnClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		const target = e.target as HTMLAnchorElement;
		let tagIdx = target.getAttribute("data-index") || -1;
		let postids = [];
		let tagname = "All";
		if (tagIdx != -1) {
			postids = tag2IdsArr[tagIdx]["postids"].split(",").map(Number);
			tagname = tag2IdsArr[tagIdx]["tag"];
		}
		tagLinkClicked({
			postids: postids,
			tagname: tagname
		});
	};

	useEffect(() => {
		let url = new URL(`${appSettings.apihost}/api/rest/tags`);
		fetch(url.href)
			.then(resp => resp.json())
			.then((data: Tag2IdsData[]) => {
				setTtag2IdsArr(data);
			})
			.catch((err: Error) => {
				tagsLogger(err);
			});
	}, []);

	return (
		<div className="nav-scroller py-1 mb-2">
			<nav className="nav d-flex">
				<a
					className="p-2 text-muted"
					href="#"
					key={-1}
					data-index={-1}
					onClick={handleTagOnClick}
				>
					All
				</a>
				{tag2IdsArr.map((value, index) => {
					return (
						<a
							className="p-2 text-muted"
							href="#"
							key={index}
							data-index={index}
							onClick={handleTagOnClick}
						>
							{value.tag}
						</a>
					);
				})}
			</nav>
		</div>
	);
};

const mapStateToProps = (state: ReduxTypes.ReducerState) => ({});

const mapDispatchToProps = (dispatch: Dispatch<ReduxTypes.RootAction>) => ({
	tagLinkClicked: (data: TagLinkClickedData) => dispatch(tagLinkClicked(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Tags);
