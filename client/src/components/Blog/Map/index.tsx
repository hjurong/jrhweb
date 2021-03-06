import React from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import Supercluster from "supercluster";
import {
	disableBodyScroll,
	enableBodyScroll,
	clearAllBodyScrollLocks
} from "../../../lib/bodyScrollLock.js";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as ReduxTypes from "ReduxTypes";
import {
	mapLoaded,
	mapCenterChanged,
	mapPlacenameChanged,
	mapMarkerClicked,
	mapThumbnailClicked,
	MapLoadedData,
	MapCenterChangedData,
	MapMarkerClickedData,
	MapPlacenameChangedData,
	MapThumbnailClickedData
} from "../../../actions";

const appSettings = require("../../../lib/app-settings");
const utils = require("../../../lib/utils");
var mapLogger = require("debug")("app:blog:map");

mapboxgl.accessToken = appSettings.mapboxToken;

const mapStateToProps = (state: ReduxTypes.ReducerState) => ({
	center: state.posts.center,
	refresh: state.home.refresh,
	filteredPostids: state.home.filteredPostids
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxTypes.RootAction>) => ({
	onLoad: (data: MapLoadedData) => dispatch(mapLoaded(data)),
	mapCenterChanged: (data: MapCenterChangedData) =>
		dispatch(mapCenterChanged(data)),
	mapPlacenameChanged: (data: MapPlacenameChangedData) =>
		dispatch(mapPlacenameChanged(data)),
	mapMarkerClicked: (data: MapMarkerClickedData) =>
		dispatch(mapMarkerClicked(data)),
	mapThumbnailClicked: (data: MapThumbnailClickedData) =>
		dispatch(mapThumbnailClicked(data))
});

type MapProps = ReturnType<typeof mapStateToProps> &
	ReturnType<typeof mapDispatchToProps>;

type MapState = {
	center: { lat: number; lng: number };
	places: GeoJSON.FeatureCollection;
	placename: string;
	zoom: number;
	refresh: number | boolean;
	filteredPostids: number[];
};

class Map extends React.Component<MapProps, MapState> {
	private map: any;
	private trees: any;
	private geocoder: any;
	private _markers = {};
	private MIN_ZOOM = 1;
	private MAX_ZOOM = 19;

	onLoad = this.props.onLoad;
	mapPlacenameChanged = this.props.mapPlacenameChanged;
	mapCenterChanged = this.props.mapCenterChanged;
	mapMarkerClicked = this.props.mapMarkerClicked;
	mapThumbnailClicked = this.props.mapThumbnailClicked;

	mapContainer = React.createRef<HTMLDivElement>();

	constructor(props: MapProps) {
		super(props);

		this.state = {
			center: this.props.center,
			places: { type: "FeatureCollection", features: [] },
			placename: "",
			zoom: 1,
			refresh: 0,
			filteredPostids: []
		};

		this.setMapCenterState = this.setMapCenterState.bind(this);
		this.setMapPlacenameState = this.setMapPlacenameState.bind(this);
		this.fetchPlaces = this.fetchPlaces.bind(this);
		this.loadClusters = this.loadClusters.bind(this);
		this.filterClusters = this.filterClusters.bind(this);
		this.debounce = this.debounce.bind(this);
	}
	setMapPlacesState(value: GeoJSON.FeatureCollection) {
		// value: geojson
		this.setState({ places: value });
		let postids: number[] = [];
		value.features.forEach(feature => {
			postids.push(feature.properties!.postid);
		});
		this.onLoad({ postids: postids });
	}
	setMapCenterState(value) {
		this.setState({ center: value });
		this.mapCenterChanged({ center: value });
	}
	setMapPlacenameState(value) {
		this.setState({ placename: value });
		this.mapPlacenameChanged({ placename: value });
	}
	getObservations() {
		let bbox = this.map.getBounds();
		let bufferRatio = 1.5;
		let sw = bbox._sw,
			ne = bbox._ne,
			hBuff = Math.abs(sw.lat - ne.lat) * bufferRatio,
			wBuff = Math.abs(sw.lng - ne.lng) * bufferRatio;

		let bounds = new mapboxgl.LngLatBounds(
			new mapboxgl.LngLat(
				sw.lng - wBuff < -180 ? -180 : sw.lng - wBuff,
				sw.lat - hBuff < -90 ? -90 : sw.lat - hBuff
			),
			new mapboxgl.LngLat(
				ne.lng + wBuff > 180 ? 180 : ne.lng + wBuff,
				ne.lat + hBuff > 90 ? 90 : ne.lat + hBuff
			)
		);
		let zoom = Math.max(
			this.MIN_ZOOM,
			Math.min(Math.round(this.map.getZoom()), this.MAX_ZOOM)
		);

		bbox = [
			bounds.getWest(),
			bounds.getSouth(),
			bounds.getEast(),
			bounds.getNorth()
		];
		let clusters = this.trees.getClusters(bbox, zoom);

		const _isvisible = elem => {
			return !!(
				elem.offsetWidth ||
				elem.offsetHeight ||
				elem.getClientRects().length
			);
		};

		let prevMarkersIds: number[] = [];
		Object.keys(this._markers).forEach(
			function(id) {
				if (_isvisible(this._markers[id].getElement())) {
					prevMarkersIds.push(parseInt(id));
				}
			}.bind(this)
		);

		let currMarkersIds: number[] = [];
		clusters.forEach(
			function(cluster) {
				let count = cluster.properties!.point_count || 1;
				let coordinates = cluster.geometry.coordinates;
				let fnames = cluster.properties.fnames;
				let postid = cluster.properties.postid;
				currMarkersIds.push(postid);

				if (this._markers.hasOwnProperty(postid)) {
					let marker = this._markers[postid].getElement();
					let badge = marker.querySelector(".marker-badge");

					if (count > 1) {
						badge.innerText = count;
						badge.style.visibility = "visible";
					} else {
						badge.style.visibility = "hidden";
					}

					this._markers[postid].setLngLat(coordinates);
					if (!_isvisible(marker)) {
						this._markers[postid].addTo(this.map);
						marker.style.display = "block";
					}
				} else {
					// doesn't exist yet
					let el = document.createElement("div");
					el.id = "places-marker-wrap_" + postid;
					el.className = "places-marker-wrap";

					let badge = document.createElement("span");
					badge.id = "marker-bdage_" + postid;
					badge.className = "marker-badge";
					badge.innerText = count;
					badge.style.visibility = count > 1 ? "visible" : "hidden";
					el.appendChild(badge);

					let imgurl = `${appSettings.publicDir}/imgs/posts/${postid}/64x64_${fnames}`;
					let thumbnail = document.createElement("img");
					thumbnail.id = "places-marker_" + postid;
					thumbnail.className = "places-marker";
					thumbnail.setAttribute("src", imgurl);
					el.appendChild(thumbnail);

					el.addEventListener(
						"click",
						function() {
							mapLogger("thumbnail-marker clicked");
							this.mapThumbnailClicked({
								postid: postid
							});
						}.bind(this)
					);

					this._markers[postid] = new mapboxgl.Marker(el)
						.setLngLat(coordinates)
						.addTo(this.map);
				}
			}.bind(this)
		);

		let rmvMarkersIds = prevMarkersIds.filter(
			x => !currMarkersIds.includes(x)
		);
		rmvMarkersIds.forEach(
			function(id) {
				if (this._markers.hasOwnProperty(id)) {
					this._markers[id].remove();
				}
			}.bind(this)
		);
	}
	fetchPlaces(params?: {}) {
		params = params || {};
		let url = new URL(`${appSettings.apihost}/api/rest/posts/geo`);
		Object.keys(params).forEach(key =>
			url.searchParams.append(key, params![key])
		);
		return fetch(url.toString()).then(resp => resp.json());
	}
	debounce(func, delay) {
		let debounceT;
		return function() {
			const context = this;
			const args = arguments;
			clearTimeout(debounceT);
			debounceT = setTimeout(() => func.apply(context, args), delay);
		};
	}
	loadClusters() {
		this.fetchPlaces().then(
			function(data) {
				this.setMapPlacesState(data);
				this.trees.load(data.features);
				this.getObservations();
			}.bind(this)
		);
	}
	filterClusters() {
		let postids: number[] = [];
		let filteredPlaces;
		if (this.props.filteredPostids.length == 0) {
			filteredPlaces = this.state.places.features;
		} else {
			filteredPlaces = this.state.places.features.filter(
				function(feature) {
					return this.props.filteredPostids.includes(
						feature.properties.postid
					);
				}.bind(this)
			);
		}

		filteredPlaces.forEach(feature => {
			postids.push(feature.properties.postid);
		});

		let postid = Math.max.apply(null, postids);

		this.trees.load(filteredPlaces);
		this.onLoad({ postids: postids });
		this.getObservations();
		this.mapThumbnailClicked({ postid: postid });
	}
	componentDidMount() {
		this.trees = new Supercluster({
			log: false,
			radius: 81,
			extent: 256,
			map: props => ({
				postid: props.postid,
				fnames: props.fnames
			}),
			reduce: (acc, props) => {
				if (props.postid > acc.postid) {
					acc.postid = props.postid;
					acc.fnames = props.fnames;
				}
			}
		});

		this.map = new mapboxgl.Map({
			container: this.mapContainer.current as HTMLDivElement,
			style: "mapbox://styles/mapbox/streets-v11",
			zoom: this.state.zoom,
			center: this.state.center,
			minZoom: this.MIN_ZOOM,
			maxZoom: this.MAX_ZOOM,
			scrollZoom: true
		});

		this.loadClusters();

		let targetElement = document.querySelector("#map-container");
		var el = document.createElement("div");
		el.className = "geocoder-marker";
		el.addEventListener(
			"click",
			function() {
				mapLogger("geocoder-marker clicked");
				this.mapMarkerClicked({
					showform: true,
					isedit: false
				});
			}.bind(this)
		);

		this.geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			marker: { element: el, draggable: true },
			mapboxgl: mapboxgl
		});
		this.map.addControl(this.geocoder, "top-left");
		this.map.addControl(new mapboxgl.NavigationControl({}), "bottom-right");

		this.geocoder.on(
			"result",
			function(e) {
				mapLogger("geocoder.on result", e.result.center);
				this.setMapPlacenameState(e.result.text);
				this.setMapCenterState({
					lng: e.result.center[0],
					lat: e.result.center[1]
				});

				let popup = document.getElementsByClassName("mapboxgl-popup");
				if (popup instanceof HTMLElement) {
					popup.remove();
				}

				// disable mobile scroll on marker drag
				this.geocoder.mapMarker.on(
					"dragstart",
					function() {
						disableBodyScroll(targetElement);
					}.bind(this)
				);
				this.geocoder.mapMarker.on(
					"dragend",
					function() {
						enableBodyScroll(targetElement);
						this.setMapCenterState(
							this.geocoder.mapMarker.getLngLat()
						);
					}.bind(this)
				);
			}.bind(this)
		);

		this.map.on(
			"moveend",
			this.debounce(
				function(e) {
					/* enforce throttling to avoid excessive ajax calls
					 * and problem with global markers variable */
					mapLogger("moveend");
					this.getObservations();
				}.bind(this),
				200
			)
		);
	}
	componentDidUpdate(prevProps, prevState) {
		if (utils.shallowCompare(prevProps.center, this.props.center)) {
			this.setState({ center: this.props.center });
			this.map.flyTo({ center: this.props.center });
		} else if (prevProps.refresh != this.props.refresh) {
			this.setState({ refresh: this.props.refresh });
			if (this.props.refresh !== -1) {
				this.loadClusters();
			}
		} else if (
			utils.shallowCompare(
				prevProps.filteredPostids,
				this.props.filteredPostids
			)
		) {
			this.setState({ filteredPostids: this.props.filteredPostids });
			this.filterClusters();
		}
	}
	componentWillUnmount() {
		this.map.remove();
		clearAllBodyScrollLocks();
	}
	render() {
		return (
			<div id="map-container">
				<div id="map" className="map" ref={this.mapContainer} />
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);
