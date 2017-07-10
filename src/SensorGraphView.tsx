import * as React from "react";
import * as _ from 'lodash';
import * as d3 from 'd3';
import SensorData from './sensor-data';

type SensorGraphViewProps = {
    sensorData: SensorData;
    sensorName: string
}

/**
 * Component for displaing measurements in line graph form.
 * Displays last 1000 of average values;
 */
export default class SensorGraphView extends React.Component<SensorGraphViewProps> {
    // element of SensorGraphView
    private graphDiv: HTMLDivElement;

    // element for graph
    private svg: SVGSVGElement;    

    // element for displaying measurement units 
    private unitSpan: HTMLSpanElement;

    constructor(props: SensorGraphViewProps) {
        super(props);
        this.onSensorData = _.throttle(this.onSensorData.bind(this), 100);       
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

    updateUnits() {
        var unit = this.props.sensorData.getUnit(this.props.sensorName);        
        this.unitSpan.innerText = unit ? (', ' + unit) : '';
    }

    draw() {
        this.updateUnits();
        var data: {d:Date, v: number}[] = [];
        var sensorData = this.props.sensorData.getLastValues(this.props.sensorName, 1000);
        
        
        for (let d of sensorData) {            
            let date = new Date(d.t);
            if (d.avg !== null && d.avg !== undefined) {
                data.push({d:date, v:d.avg});
            }            
        }

        if (data.length < 2) {
            // not enough data for graph
            return;
        }

        let divWidth = this.graphDiv.offsetWidth;
        let divHeight = this.graphDiv.offsetHeight;
        let svgWidth = divWidth;
        let svgHeight = divHeight - 50;        

        var svg = d3.select(this.svg);
        svg.attr('width', svgWidth)
            .attr('height', svgHeight);

        let margin = {top: 20, right: 20, bottom: 30, left: 50};
        let width = svgWidth - margin.left - margin.right;
        let height = svgHeight - margin.top - margin.bottom; 
        svg.selectAll('g').remove();       
        let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleTime()
                .rangeRound([0, width])
                .domain(d3.extent(data, (d:any) => d.d))
                .nice();
        let y = d3.scaleLinear()
                .rangeRound([height, 0])
                .domain(d3.extent(data, (d:any) => d.v))
                .nice();
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
        return <div className="sensor-graph-view"            
                    ref={d => {
                            if (d) {
                                this.graphDiv = d
                            }
                        }}
                    >
                <p className="sensor-graph-view_header">
                    {this.props.sensorName}
                    <span ref={s => {
                            if (s) {
                                this.unitSpan = s;
                            }
                        }}>
                    </span>
                </p>
                <svg width='100%'
                     height='100%'
                     ref={s => {if (s) {this.svg = s}} }
                />
            </div>;
    }

    componentDidUpdate() {        
        this.draw();
    }
}