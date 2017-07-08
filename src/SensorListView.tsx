import * as React from "react";
import * as Moment from 'moment';
import SensorData from './sensor-data';

type SensorListViewProps = {
    sensorData: SensorData;
}

export default class SensorListView extends React.Component<SensorListViewProps> {
    constructor (props: SensorListViewProps) {
        super(props);        
        this.onSensorData = this.onSensorData.bind(this);
    }

    onSensorData() {
        this.forceUpdate();
    }

    componentDidMount() {
        this.props.sensorData.addListener(this.onSensorData);
    }

    componentWillUnmount() {
        this.props.sensorData.removeListener(this.onSensorData);
    }
    
    render(): JSX.Element {
        return <table>
            <tbody>
                {this.props.sensorData.getSensorNames().map(sensorName => {
                        let lastValues = this.props.sensorData.getLastValues(sensorName, 1)[0] || {time: null, values:[0]};

                        return <tr key={sensorName}>
                            <td>{sensorName}</td>
                            <td>{Moment(new Date(parseInt(lastValues.time, 10))).fromNow()}</td>
                            <td>{"" + lastValues.values[lastValues.values.length-1]}</td>
                        </tr>
                    }
                )}
            </tbody>
        </table>
    }
}