
type DataBySensorName = {
        [key:string]: {
            [key:string]: any[]
        };
    }

function compareNumbers(as:string, bs:string) {
    let a = parseInt(as, 10);
    let b = parseInt(bs, 10);
    if (a < b) return -1;
    else if (a == b) return 0;
    else return 1;
}    



export default class SensorData {
    eventSource: any;
    private dataBySensor: DataBySensorName = {}
    private sensorNames: string[] = [];
    private listeners: (()=>void)[] = [];

    constructor(private url: string) {
        this.eventSource = new window.EventSource(url);
        this.eventSource.onmessage = this.onevent.bind(this);
    }

    public getSensorNames(): string[] {
        return this.sensorNames;
    }

    public getLastValues(sensorName: string, count: number): {time: string, values:any[]}[] {
        let values = this.dataBySensor[sensorName] || [];
        let times = Object.keys(values).sort(compareNumbers);
        if (times.length > count) {
            times = times.slice(times.length - count);
        }
        return times.map(t => ({time: t, values: values[t]}))
    }

    public addListener(f: ()=>void) {
        this.listeners.push(f);
    }

    public removeListener(f: ()=>void) {
        this.listeners = this.listeners.filter(x => x!==f);
    }

    private onevent(e: any) {
        let data = JSON.parse(e.data);                
        for (let d of data) {
            if (!this.dataBySensor[d.name]) {
                this.dataBySensor[d.name] = {};
            }
            let values = this.dataBySensor[d.name];

            for (let m of d.measurements) {
                let time = ''+m[0]*1000;
                if (!values[time]) {
                    values[time] = [];
                }
                values[time].push(m[1]);                
            }
        }        
        this.sensorNames = Object.keys(this.dataBySensor).sort();
        for (let listener of this.listeners) {
            listener();
        }
    }
}