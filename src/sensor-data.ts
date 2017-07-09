type Datum<T> = {
    t: number,
    v: T[],
    sum?: number | null    
    avg?: number | null,    
    last?: T,
    min?: T,
    max?: T,
}

function findOrCreateDatum<T>(data: Datum<T>[], t: number) {
    for (let idx = data.length-1; idx >= 0; --idx) {
        if (data[idx].t == t) {
            return {
                idx,
                datum: data[idx],
                data
            };
        }
        if (data[idx].t < t) {
            let newDatum: Datum<T> = {t, v: []};
            let newData = [...data.slice(0, idx+1), newDatum, ...data.slice(idx+1)];
            return {
                idx, 
                datum: newDatum,
                data: newData
            }
        }
    }
    let newDatum: Datum<T> = {t, v: []};
    let newData = [newDatum, ...data];
    return {
        idx:newData.length - 1, 
        datum: newDatum,
        data: newData
    }
}


type DataBySensorName = {
    [key:string]: Datum<any>[];
}


export default class SensorData {
    eventSource?: any;
    private unitsBySensor: {[key:string]:string} = {};
    private dataBySensor: DataBySensorName = {}
    private sensorNames: string[] = [];
    private listeners: ((sensorNames: string[])=>void)[] = [];

    constructor(private url?: string) {
        if (url) {
            this.eventSource = new window.EventSource(url);
            this.eventSource.onmessage = this.onevent.bind(this);
        }
    }

    public getSensorNames(): string[] {
        return this.sensorNames;
    }

    public getUnit(sensorName: string): string {
        return this.unitsBySensor[sensorName] || "";
    }

    public getLastValues(sensorName: string, count: number): Datum<any>[] {
        let values = this.dataBySensor[sensorName] || [];
        if (values.length > count) {
            return values.slice(values.length - count);
        }
        return [...values];        
    }

    public addListener(f: ()=>void) {
        this.listeners.push(f);
    }

    public removeListener(f: ()=>void) {
        this.listeners = this.listeners.filter(x => x!==f);
    }

    public onevent(e: any) {
        let data = JSON.parse(e.data);       
        let updatedSensors: string[] = [];         
        for (let d of data) {
            if (!this.dataBySensor[d.name]) {
                this.dataBySensor[d.name] = [];
            }            
            this.unitsBySensor[d.name] = d.unit || "";
            updatedSensors.push(d.name);            

            for (let m of d.measurements) {
                let time = m[0]*1000;
                let v = m[1];
                let values = this.dataBySensor[d.name];   
                let {idx, datum, data:newData} = findOrCreateDatum(values, time);
                this.dataBySensor[d.name] = newData;
                datum.v.push(v);
                datum.last = v;
                if (typeof(v) == 'number') {
                    datum.sum = (datum.sum || 0) + v;
                    datum.avg = datum.sum / datum.v.length;
                    if (datum.max === null || datum.max === undefined || datum.max < v) {
                        datum.max = v;
                    }
                    if (datum.min === null || datum.min === undefined || datum.min > v) {
                        datum.min = v;
                    }
                }                           
            }            
        }        
        this.sensorNames = Object.keys(this.dataBySensor).sort();
        for (let listener of this.listeners) {
            listener(updatedSensors);
        }
    }
}