import React from 'react';
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import bodyScrollLock from 'body-scroll-lock'

mapboxgl.accessToken = "pk.eyJ1IjoiaGp1cm9uZyIsImEiOiJjanJmYmhkamMxZzNiNDlwZnhiNmNvMWNyIn0.CKGbJVpC1mqbCACK7RtH0w";

class Map extends React.Component {
    componentDidMount() {
        this.map = new mapboxgl.Map({
          container: this.mapContainer,
          style: 'mapbox://styles/mapbox/streets-v11',
          zoom: 1,
          minZoom: 1,
          maxZoom: 16,
          scrollZoom: true,
        });
        
        var el = document.createElement('div');
        el.className = 'geocoder-marker';
        el.addEventListener("click", function(){ 
            console.log("geocoder-marker clicked");
        });
    
        var geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            marker: {element: el, draggable: true},
            mapboxgl: mapboxgl,
        });
        this.map.addControl(geocoder, 'top-left');
        this.map.addControl ( new mapboxgl.NavigationControl({ }) );

        geocoder.on('result', function(e) {
            console.log("geocoder.on result", e.result.center);
            $("#placename").val(e.result.text); // short place name
            $("#location").val(e.result.center.join());
            $('.mapboxgl-popup') ? $('.mapboxgl-popup').remove() : null;

            // disable mobile scroll on marker drag
            geocoder.mapMarker.on('dragstart', function() {
                bodyScrollLock.disableBodyScroll();
            });
            geocoder.mapMarker.on('dragend', function() {
                bodyScrollLock.enableBodyScroll();
                // set new lnglat
                $("#location").val(geocoder.mapMarker.getLngLat().toArray().join());
            });
        });

        this.map.on('moveend', function(e) {
            /* enforce throttling to avoid excessive ajax calls
            * and problem with global markers variable
            */
            console.log('moveend');
        });

    }
    componentWillUnmount() {
        this.map.remove();
    }
    render() { 
        return (
            <div>
                <div id="map" className="map" ref={el => this.mapContainer = el} />
            </div>
        );
    }
}

export default Map;