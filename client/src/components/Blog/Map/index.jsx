import React from 'react';
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import Supercluster from 'supercluster'
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from '../../../lib/bodyScrollLock.js';
import { connect } from 'react-redux';
import { mapLoaded, mapCenterChanged, mapPlacenameChanged, mapMarkerClicked, mapThumbnailClicked } from '../../../actions'

mapboxgl.accessToken = "pk.eyJ1IjoiaGp1cm9uZyIsImEiOiJjanJmYmhkamMxZzNiNDlwZnhiNmNvMWNyIn0.CKGbJVpC1mqbCACK7RtH0w";
const appSettings = require('../../../lib/app-settings');
var mapLogger = require('debug')("app:blog:map");

class Map extends React.Component {
    constructor(props) {
        super(props);
    
        this.state = {
          center: { lng: -32.437177, lat: 50.742416 },
          places: [],
          placename: "",
          zoom: 1,
        };
        this._markers = {};
        this.MIN_ZOOM = 1;
        this.MAX_ZOOM = 19;
        this.setMapCenterState = this.setMapCenterState.bind(this);
        this.setMapPlacenameState = this.setMapPlacenameState.bind(this);
        this.fetchPlaces = this.fetchPlaces.bind(this);
        this.debounce = this.debounce.bind(this);
    }
    setMapPlacesState(value) {
        this.setState({places: value});
    }
    setMapCenterState(value) {
        this.setState({center: value});
        this.mapCenterChanged({center: value});
    }
    setMapPlacenameState(value) {
        this.setState({placename: value});
        this.mapPlacenameChanged({placename: value});
    }
    getObservations() {
        let bbox = this.map.getBounds();
        let bufferRatio = 1.5;
        let sw = bbox._sw,
            ne = bbox._ne,
            hBuff = Math.abs(sw.lat - ne.lat) * bufferRatio,
            wBuff = Math.abs(sw.lng - ne.lng) * bufferRatio;
    
        let bounds = new mapboxgl.LngLatBounds(
            new mapboxgl.LngLat(sw.lng-wBuff < -180 ? -180 : sw.lng-wBuff,
                                sw.lat-hBuff < -90  ?  -90 : sw.lat-hBuff),
            new mapboxgl.LngLat(ne.lng+wBuff >  180 ?  180 : ne.lng+wBuff,
                                ne.lat+hBuff >  90  ?   90 : ne.lat+hBuff));
        let zoom = Math.max(
            this.MIN_ZOOM, 
            Math.min(Math.round(this.map.getZoom()), this.MAX_ZOOM));

        bbox = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
        let clusters = this.trees.getClusters(bbox, zoom);
        
        const _cmp = function(c1, c2) {
            if (c1.properties.id < c2.properties.id) {
                return -1;
            }
            if (c1.properties.id > c2.properties.id) {
                return 1;
            }
            return 0;
        }

        const _isvisible = (elem) => {
            return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
        }

        clusters.sort(_cmp);
        
        let prevMarkersIds = [];
        Object.keys(this._markers).forEach(function(id) {
            if (_isvisible(this._markers[id].getElement())) {
                prevMarkersIds.push(parseInt(id));
            }
        }.bind(this));

        let currMarkersIds = [];
        clusters.forEach(function(cluster) {
            let count = cluster.properties.point_count || 1;
            let coordinates = cluster.geometry.coordinates;
            let fnames = cluster.properties.fnames;
            let postid = cluster.properties.postid;
            currMarkersIds.push(postid);

            if (this._markers.hasOwnProperty(postid)) {
                let marker = this._markers[postid].getElement();
                let badge = marker.querySelector('.marker-badge');

                if (count > 1) {
                    badge.innerText = count;
                    badge.style.visibility = 'visible';
                } else {
                    badge.style.visibility = 'hidden';
                }

                this._markers[postid].setLngLat(coordinates);
                if (!_isvisible(marker)) {
                    this._markers[postid].addTo(this.map);
                    marker.style.display = 'block';
                }
            } else {
                // doesn't exist yet
                let el = document.createElement('div');
                el.id = 'places-marker-wrap_' + postid;
                el.className = 'places-marker-wrap';

                let badge = document.createElement('span');
                badge.id = 'marker-bdage_' + postid;
                badge.className = 'marker-badge';
                badge.innerText = count;
                badge.style.visibility = count > 1 ? 'visible' : 'hidden';
                el.appendChild(badge);

                let imgurl = `${appSettings.publicDir}/imgs/posts/${postid}/64x64_${fnames}`
                let thumbnail = document.createElement('img');
                thumbnail.id = 'places-marker_' + postid;
                thumbnail.className = 'places-marker';
                thumbnail.setAttribute('src', imgurl);
                el.appendChild(thumbnail);

                el.addEventListener("click", function(){ 
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

        let rmvMarkersIds = prevMarkersIds.filter(x => !currMarkersIds.includes(x));
        rmvMarkersIds.forEach(function(id) {
            if (this._markers.hasOwnProperty(id)) {
                this._markers[id].remove();
            }
        }.bind(this));
    }
    fetchPlaces(params) {
        params = params || {}
        let url = new URL(`${appSettings.apihost}/api/rest/posts/geo`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return fetch(url).then(resp => resp.json());
    }
    debounce(func, delay) {
        let debounceT;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceT);
            debounceT = setTimeout(() => func.apply(context, args), delay);
        }
    }
    componentDidMount() {
        this.mapPlacenameChanged = this.props.mapPlacenameChanged;
        this.mapCenterChanged = this.props.mapCenterChanged;
        this.mapMarkerClicked = this.props.mapMarkerClicked;
        this.mapThumbnailClicked = this.props.mapThumbnailClicked;

        this.trees = new Supercluster({
            log: false,
            radius: 81,
            extend: 256,
            map: (props) => ({
                postid: props.postid,
                fnames: props.fnames,
            }),
            reduce: (acc, props) => {
                acc.postid = props.postid;
                acc.fnames = props.fnames;
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
        
        this.fetchPlaces().then(function(data) {
            this.setMapPlacesState(data);
            this.trees.load(data.features);
            this.getObservations();
        }.bind(this));

        this.targetElement = document.querySelector('#map-container');
        var el = document.createElement('div');
        el.className = 'geocoder-marker';
        el.addEventListener("click", function(){ 
            mapLogger("geocoder-marker clicked");
            this.mapMarkerClicked({
                showform: true, 
                isedit: false,
            });
        }.bind(this));
    
        this.geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            marker: {element: el, draggable: true},
            mapboxgl: mapboxgl,
        });
        this.map.addControl(this.geocoder, 'top-left');
        this.map.addControl ( 
            new mapboxgl.NavigationControl({ }), 
            'bottom-right' 
        );

        this.geocoder.on('result', function(e) {
            mapLogger("geocoder.on result", e.result.center);
            this.setMapPlacenameState(e.result.text);
            this.setMapCenterState({
                lng:e.result.center[0], 
                lat:e.result.center[1]
            });

            $('.mapboxgl-popup') ? 
                $('.mapboxgl-popup').remove() : null;

            // disable mobile scroll on marker drag
            this.geocoder.mapMarker.on('dragstart', function() {
                disableBodyScroll(this.targetElement);
            }.bind(this));
            this.geocoder.mapMarker.on('dragend', function() {
                enableBodyScroll(this.targetElement);
                this.setMapCenterState(
                    this.geocoder.mapMarker
                        .getLngLat());
            }.bind(this));
        }.bind(this));

        this.map.on('moveend', this.debounce(function(e) {
            /* enforce throttling to avoid excessive ajax calls
             * and problem with global markers variable */
            mapLogger('moveend');
            this.getObservations();
        }.bind(this), 100));
    }
    componentWillUnmount() {
        this.map.remove();
        clearAllBodyScrollLocks();
    }
    render() { 
        return (
            <div id="map-container">
                <div id="map" className="map" 
                    ref={el => this.mapContainer = el} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
  places: state.map.places,
});

const mapDispatchToProps = dispatch => ({
  onLoad: data => dispatch(mapLoaded(data)),
  mapCenterChanged: data => dispatch(mapCenterChanged(data)),
  mapPlacenameChanged: data => dispatch(mapPlacenameChanged(data)),
  mapMarkerClicked: data => dispatch(mapMarkerClicked(data)),
  mapThumbnailClicked: data => dispatch(mapThumbnailClicked(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Map);
