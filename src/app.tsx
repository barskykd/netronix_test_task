import "babel-polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import SensorData from './sensor-data';
import SensorListView from './SensorListView';
import SensorGraphView from './SensorGraphView';
import SensorMapView from './SensorMapView';

let appDiv = document.getElementById('app'); 

if (window.EventSource) {
    let sensorData = new SensorData("https://jsdemo.envdev.io/sse")
    ReactDOM.render(
        <div>
            <SensorListView  sensorData={sensorData}/>
            <SensorGraphView sensorData={sensorData} sensorName='Batt. Voltage'/>
            <SensorGraphView sensorData={sensorData} sensorName='PM1'/>
            <SensorGraphView sensorData={sensorData} sensorName='Pressure'/>
            <SensorGraphView sensorData={sensorData} sensorName='Temperature'/>
            <SensorMapView   sensorData={sensorData} sensorName='Location'/>
        </div>,
        appDiv
    )
} else  {
    ReactDOM.render(
        <div>
            Current browser doesn't support EventSource. Try opening page in Google Chrome.
        </div>,
        appDiv
    )
}