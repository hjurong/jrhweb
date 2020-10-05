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
import React from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import Supercluster from 'supercluster';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from '../../../lib/bodyScrollLock.js';
import { connect } from 'react-redux';
import { mapLoaded, mapCenterChanged, mapPlacenameChanged, mapMarkerClicked, mapThumbnailClicked } from '../../../actions';
var appSettings = require('../../../lib/app-settings');
var utils = require('../../../lib/utils');
var mapLogger = require('debug')("app:blog:map");
mapboxgl.accessToken = appSettings.mapboxToken;
var Map = /** @class */ (function (_super) {
    __extends(Map, _super);
    function Map(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            center: _this.props.center,
            places: [],
            placename: "",
            zoom: 1,
        };
        _this._markers = {};
        _this.MIN_ZOOM = 1;
        _this.MAX_ZOOM = 19;
        _this.setMapCenterState = _this.setMapCenterState.bind(_this);
        _this.setMapPlacenameState = _this.setMapPlacenameState.bind(_this);
        _this.fetchPlaces = _this.fetchPlaces.bind(_this);
        _this.loadClusters = _this.loadClusters.bind(_this);
        _this.filterClusters = _this.filterClusters.bind(_this);
        _this.debounce = _this.debounce.bind(_this);
        return _this;
    }
    Map.prototype.setMapPlacesState = function (value) {
        // value: geojson
        this.setState({ places: value });
        var postids = [];
        value.features.forEach(function (feature) {
            postids.push(feature.properties.postid);
        });
        this.onLoad({ postids: postids });
    };
    Map.prototype.setMapCenterState = function (value) {
        this.setState({ center: value });
        this.mapCenterChanged({ center: value });
    };
    Map.prototype.setMapPlacenameState = function (value) {
        this.setState({ placename: value });
        this.mapPlacenameChanged({ placename: value });
    };
    Map.prototype.getObservations = function () {
        var bbox = this.map.getBounds();
        var bufferRatio = 1.5;
        var sw = bbox._sw, ne = bbox._ne, hBuff = Math.abs(sw.lat - ne.lat) * bufferRatio, wBuff = Math.abs(sw.lng - ne.lng) * bufferRatio;
        var bounds = new mapboxgl.LngLatBounds(new mapboxgl.LngLat(sw.lng - wBuff < -180 ? -180 : sw.lng - wBuff, sw.lat - hBuff < -90 ? -90 : sw.lat - hBuff), new mapboxgl.LngLat(ne.lng + wBuff > 180 ? 180 : ne.lng + wBuff, ne.lat + hBuff > 90 ? 90 : ne.lat + hBuff));
        var zoom = Math.max(this.MIN_ZOOM, Math.min(Math.round(this.map.getZoom()), this.MAX_ZOOM));
        bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
        var clusters = this.trees.getClusters(bbox, zoom);
        var _isvisible = function (elem) {
            return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
        };
        var prevMarkersIds = [];
        Object.keys(this._markers).forEach(function (id) {
            if (_isvisible(this._markers[id].getElement())) {
                prevMarkersIds.push(parseInt(id));
            }
        }.bind(this));
        var currMarkersIds = [];
        clusters.forEach(function (cluster) {
            var count = cluster.properties.point_count || 1;
            var coordinates = cluster.geometry.coordinates;
            var fnames = cluster.properties.fnames;
            var postid = cluster.properties.postid;
            currMarkersIds.push(postid);
            if (this._markers.hasOwnProperty(postid)) {
                var marker = this._markers[postid].getElement();
                var badge = marker.querySelector('.marker-badge');
                if (count > 1) {
                    badge.innerText = count;
                    badge.style.visibility = 'visible';
                }
                else {
                    badge.style.visibility = 'hidden';
                }
                this._markers[postid].setLngLat(coordinates);
                if (!_isvisible(marker)) {
                    this._markers[postid].addTo(this.map);
                    marker.style.display = 'block';
                }
            }
            else {
                // doesn't exist yet
                var el = document.createElement('div');
                el.id = 'places-marker-wrap_' + postid;
                el.className = 'places-marker-wrap';
                var badge = document.createElement('span');
                badge.id = 'marker-bdage_' + postid;
                badge.className = 'marker-badge';
                badge.innerText = count;
                badge.style.visibility = count > 1 ? 'visible' : 'hidden';
                el.appendChild(badge);
                var imgurl = appSettings.publicDir + "/imgs/posts/" + postid + "/64x64_" + fnames;
                var thumbnail = document.createElement('img');
                thumbnail.id = 'places-marker_' + postid;
                thumbnail.className = 'places-marker';
                thumbnail.setAttribute('src', imgurl);
                el.appendChild(thumbnail);
                el.addEventListener("click", function () {
                    mapLogger("thumbnail-marker clicked");
                    this.mapThumbnailClicked({
                        postid: postid,
                    });
                }.bind(this));
                this._markers[postid] = new mapboxgl.Marker(el)
                    .setLngLat(coordinates)
                    .addTo(this.map);
            }
        }.bind(this));
        var rmvMarkersIds = prevMarkersIds.filter(function (x) { return !currMarkersIds.includes(x); });
        rmvMarkersIds.forEach(function (id) {
            if (this._markers.hasOwnProperty(id)) {
                this._markers[id].remove();
            }
        }.bind(this));
    };
    Map.prototype.fetchPlaces = function (params) {
        params = params || {};
        var url = new URL(appSettings.apihost + "/api/rest/posts/geo");
        Object.keys(params).forEach(function (key) { return url.searchParams.append(key, params[key]); });
        return fetch(url).then(function (resp) { return resp.json(); });
    };
    Map.prototype.debounce = function (func, delay) {
        var debounceT;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(debounceT);
            debounceT = setTimeout(function () { return func.apply(context, args); }, delay);
        };
    };
    Map.prototype.loadClusters = function () {
        this.fetchPlaces().then(function (data) {
            this.setMapPlacesState(data);
            this.trees.load(data.features);
            this.getObservations();
        }.bind(this));
    };
    Map.prototype.filterClusters = function () {
        var postids = [];
        var filteredPlaces;
        if (this.props.filteredPostids.length == 0) {
            filteredPlaces = this.state.places.features;
        }
        else {
            filteredPlaces = this.state.places.features.filter(function (feature) {
                return this.props.filteredPostids.includes(feature.properties.postid);
            }.bind(this));
        }
        filteredPlaces.forEach(function (feature) {
            postids.push(feature.properties.postid);
        });
        var postid = Math.max.apply(null, postids);
        this.trees.load(filteredPlaces);
        this.onLoad({ postids: postids });
        this.getObservations();
        this.mapThumbnailClicked({ postid: postid });
    };
    Map.prototype.componentDidMount = function () {
        this.onLoad = this.props.onLoad;
        this.mapPlacenameChanged = this.props.mapPlacenameChanged;
        this.mapCenterChanged = this.props.mapCenterChanged;
        this.mapMarkerClicked = this.props.mapMarkerClicked;
        this.mapThumbnailClicked = this.props.mapThumbnailClicked;
        this.trees = new Supercluster({
            log: false,
            radius: 81,
            extend: 256,
            map: function (props) { return ({
                postid: props.postid,
                fnames: props.fnames,
            }); },
            reduce: function (acc, props) {
                if (props.postid > acc.postid) {
                    acc.postid = props.postid;
                    acc.fnames = props.fnames;
                }
            }
        });
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11',
            zoom: this.state.zoom,
            center: this.state.center,
            minZoom: this.MIN_ZOOM,
            maxZoom: this.MAX_ZOOM,
            scrollZoom: true,
        });
        this.loadClusters();
        this.targetElement = document.querySelector('#map-container');
        var el = document.createElement('div');
        el.className = 'geocoder-marker';
        el.addEventListener("click", function () {
            mapLogger("geocoder-marker clicked");
            this.mapMarkerClicked({
                showform: true,
                isedit: false,
            });
        }.bind(this));
        this.geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            marker: { element: el, draggable: true },
            mapboxgl: mapboxgl,
        });
        this.map.addControl(this.geocoder, 'top-left');
        this.map.addControl(new mapboxgl.NavigationControl({}), 'bottom-right');
        this.geocoder.on('result', function (e) {
            mapLogger("geocoder.on result", e.result.center);
            this.setMapPlacenameState(e.result.text);
            this.setMapCenterState({
                lng: e.result.center[0],
                lat: e.result.center[1]
            });
            $('.mapboxgl-popup') ?
                $('.mapboxgl-popup').remove() : null;
            // disable mobile scroll on marker drag
            this.geocoder.mapMarker.on('dragstart', function () {
                disableBodyScroll(this.targetElement);
            }.bind(this));
            this.geocoder.mapMarker.on('dragend', function () {
                enableBodyScroll(this.targetElement);
                this.setMapCenterState(this.geocoder.mapMarker
                    .getLngLat());
            }.bind(this));
        }.bind(this));
        this.map.on('moveend', this.debounce(function (e) {
            /* enforce throttling to avoid excessive ajax calls
             * and problem with global markers variable */
            mapLogger('moveend');
            this.getObservations();
        }.bind(this), 200));
    };
    Map.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (utils.shallowCompare(prevProps.center, this.props.center)) {
            this.setState({ center: this.props.center });
            this.map.flyTo({ center: this.props.center });
        }
        else if (prevProps.refresh != this.props.refresh) {
            this.setState({ refresh: this.props.refresh });
            if (this.props.refresh !== -1) {
                this.loadClusters();
            }
        }
        else if (utils.shallowCompare(prevProps.filteredPostids, this.props.filteredPostids)) {
            this.setState({ filteredPostids: this.props.filteredPostids });
            this.filterClusters();
        }
    };
    Map.prototype.componentWillUnmount = function () {
        this.map.remove();
        clearAllBodyScrollLocks();
    };
    Map.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { id: "map-container" },
            React.createElement("div", { id: "map", className: "map", ref: function (el) { return _this.mapContainer = el; } })));
    };
    return Map;
}(React.Component));
var mapStateToProps = function (state) { return ({
    center: state.posts.center,
    refresh: state.home.refresh,
    filteredPostids: state.home.filteredPostids,
}); };
var mapDispatchToProps = function (dispatch) { return ({
    onLoad: function (data) { return dispatch(mapLoaded(data)); },
    mapCenterChanged: function (data) { return dispatch(mapCenterChanged(data)); },
    mapPlacenameChanged: function (data) { return dispatch(mapPlacenameChanged(data)); },
    mapMarkerClicked: function (data) { return dispatch(mapMarkerClicked(data)); },
    mapThumbnailClicked: function (data) { return dispatch(mapThumbnailClicked(data)); },
}); };
export default connect(mapStateToProps, mapDispatchToProps)(Map);
//# sourceMappingURL=index.js.map