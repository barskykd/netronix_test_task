import * as React from "react";
import * as _ from 'lodash';
import * as d3 from 'd3';
import SensorData from './sensor-data';

type SensorGraphViewProps = {
    sensorData: SensorData;
    sensorName: string
}

function avg(a: number[]) {
    if (a.length == 0) {
        return 0;
    }
    return a.reduce((pv, cv) => pv + cv, 0) / a.length;
}

function min_and_max(a: number[]) {
    if (a.length == 0) {
        return {min:0, max:0};
    }
    let min = a[0];
    let max = a[0];
    for (let x of a) {
        if (min > x) {
            min = x;
        }
        if (max < x) {
            max = x;
        }
    }
    return {min, max};
}

export default class SensorGraphView extends React.Component<SensorGraphViewProps> {
    private svg: SVGElement | null; 
    private style: any;   

    constructor(props: SensorGraphViewProps) {
        super(props);
        this.onSensorData = _.throttle(this.onSensorData.bind(this), 100);
        this.style = {width: '900px', 
                      height: '500px', 
                      display:'inline-block'
                    }; 
    }    
    
    onSensorData() {
        this.draw();
    }

    componentDidMount() {        
        this.props.sensorData.addListener(this.onSensorData);
    }

    componentWillUnmount() {
        this.props.sensorData.removeListener(this.onSensorData);
    }

    draw() {
        var data: {d:Date, v: number}[] = [];//[['Time', 'Value']]
        for (let d of this.props.sensorData.getLastValues(this.props.sensorName, 1000)) {
            let mm = min_and_max(d.values);
            let avgValue: number = avg(d.values);
            let date = new Date(parseInt(d.time, 10));
            data.push({d:date, v:avgValue});
        }

        if (data.length < 2) {
            return;
        }

        var svg = d3.select(this.svg);
        let margin = {top: 20, right: 20, bottom: 30, left: 50};
        let width = svg.attr("width") - margin.left - margin.right;
        let height = svg.attr("height") - margin.top - margin.bottom; 
        svg.selectAll('g').remove();       
        let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleTime()
                .rangeRound([0, width])
                .domain(d3.extent(data, (d:any) => d.d));
        let y = d3.scaleLinear()
                .rangeRound([height, 0])
                .domain(d3.extent(data, (d:any) => d.v));
        let line = d3.line()
                .x((d:any) => x(d.d))
                .y((d:any) => y(d.v));

        let xAxis = d3.axisBottom(x)
                .tickSizeInner(-height);

        let yAxis = d3.axisLeft(y)
            .tickSizeInner(-width);

        
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)                        

        g.append("g")
            .call(yAxis);

        g.selectAll(".tick line")
            .attr("style", "opacity: 0.2");

        g.append('path')
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr('d', line);
    }

    public render():JSX.Element {
        
        return <div 
            style={this.style}
            >
            <p>{this.props.sensorName}</p>
            <svg width={parseInt(this.style.width, 10)}
                 height={parseInt(this.style.height, 10)}
                 ref={s => this.svg = s}/>
            </div>
    }

    componentDidUpdate() {        
        this.draw();
    }
}