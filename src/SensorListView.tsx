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
        return <div className="sensor-list-view"><table className="sensor-list-view_table">
            <thead><tr>
                <td>Sensor</td>
                <td>Last Changed</td>
                <td>Last Value</td>
                </tr></thead>
            <tbody>
                {this.props.sensorData.getSensorNames().map(sensorName => {
                        let lastValue = this.props.sensorData.getLastValues(sensorName, 1)[0];
                        let time = '';
                        let value = '';
                        if (lastValue !== undefined) {
                            time = Moment(new Date(lastValue.t)).format('lll');
                            value = '' + lastValue.last;
                            let unit = this.props.sensorData.getUnit(sensorName);
                            if (unit) {
                                value += ', ' + unit;
                            }
                        }

                        return <tr key={sensorName}>
                            <td>{sensorName}</td>
                            <td>{time}</td>
                            <td>{value}</td>
                        </tr>
                    }
                )}
            </tbody>
        </table>
        </div>
    }
}