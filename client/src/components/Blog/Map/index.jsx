import React from 'react';
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from '../../../lib/bodyScrollLock.js';
import { connect } from 'react-redux';
import { mapLoaded, mapCenterChanged, mapPlacenameChanged, mapMarkerClicked } from '../../../actions'

mapboxgl.accessToken = "pk.eyJ1IjoiaGp1cm9uZyIsImEiOiJjanJmYmhkamMxZzNiNDlwZnhiNmNvMWNyIn0.CKGbJVpC1mqbCACK7RtH0w";
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
        this.setMapCenterState = this.setMapCenterState.bind(this);
        this.setMapPlacenameState = this.setMapPlacenameState.bind(this);
        this.props.onLoad({articles:[1,2,3], places:[1,3,2]});

    }
    setMapCenterState(value) {
        this.setState({center: value});
        this.mapCenterChanged({center: value});
    }
    setMapPlacenameState(value) {
        this.setState({placename: value});
        this.mapPlacenameChanged({placename: value});
    }
    componentDidMount() {
        this.state.places = this.props.places;
        this.mapPlacenameChanged = this.props.mapPlacenameChanged;
        this.mapCenterChanged = this.props.mapCenterChanged;
        this.mapMarkerClicked = this.props.mapMarkerClicked;

        this.map = new mapboxgl.Map({
          container: this.mapContainer,
          style: 'mapbox://styles/mapbox/streets-v11',
          zoom: this.state.zoom,
          center: this.state.center,
          minZoom: 1,
          maxZoom: 19,
          scrollZoom: true,
        });
        
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
            this.setMapCenterState(e.result.center);

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
                        .getLngLat().toArray());
            }.bind(this));
        }.bind(this));

        this.map.on('moveend', function(e) {
            /* enforce throttling to avoid excessive ajax calls
             * and problem with global markers variable
            */
            mapLogger('moveend');
            this.state.zoom = this.map.getZoom();
        }.bind(this));
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Map);