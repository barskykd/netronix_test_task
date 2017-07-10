import * as React from "react";
import * as _ from 'lodash';
import * as google_maps from './google_maps';
import SensorData from './sensor-data';

type SensorMapViewProps = {
    sensorData: SensorData;
    sensorName: string
}

/**
 * Component for displaying location measurements on the map.
 */
export default class SensorMapView extends React.Component<SensorMapViewProps> {
    private mapDiv: HTMLDivElement | null;
    private map: any = null;
    private marker: any = null;
    private polyline: any = null;

    constructor(props: SensorMapViewProps) {
        super(props);
        this.onSensorData = _.throttle(this.onSensorData.bind(this), 300);
    }   

    attachGoogleMaps() {
        if (google_maps.isLoaded()) {
            return;
        }

        google_maps.load(() => this.forceUpdate());
    }

    onSensorData() {
        this.updateMap();
    }

    componentDidMount() {
        this.attachGoogleMaps();
        this.props.sensorData.addListener(this.onSensorData);
    }

    componentWillUnmount() {
        this.props.sensorData.removeListener(this.onSensorData);
    }

    public render():JSX.Element {
        return <div className='sensor-map-view'>
                    <p className='sensor-map-view_header'>{this.props.sensorName}</p>            
                    <div className='sensor-map-view_map' ref={d => this.mapDiv = d}></div>            
            </div>
    }

    updateMap() {
        if (!google_maps.isLoaded()) {
            return;
        }
        let data = this.props.sensorData.getLastValues(this.props.sensorName, 100);
        if (data.length == 0) {
            // nothing to display
            return;
        }
        
        let lastDatum = data[data.length-1];
        let lp = lastDatum.last;

        let center = {lat: lp[0], lng: lp[1]};

        // init map
        if (this.map == null) {
            this.map = new window.google.maps.Map(this.mapDiv, {
                zoom: 7,
                center: center,
                mapTypeId: 'terrain'
            });
        } 

        // move marker
        if (this.marker == null) {
            this.marker = new window.google.maps.Marker({
            position: center,
            map: this.map
            });
        } else {
            this.marker.setPosition(center);
        }

        // draw path through last 100 locations
        var path = []
        for (let lps of data) {
            let lp = lps.last;
            path.push({lat: lp[0], lng: lp[1]});
        }

        if (this.polyline == null) {
            this.polyline = new window.google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });

            this.polyline.setMap(this.map);
        } else {
            this.polyline.setPath(path);
        }
    }

    componentDidUpdate() {
        this.updateMap();
    }
}