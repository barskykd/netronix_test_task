import SensorData from '../sensor-data';
import { expect } from 'chai';

const TEST_SENSOR1_NAME = 'Sensor1';
const TEST_SENSOR1_UNIT = 'test_unit';
const TEST_SENSOR1_MEASUREMENT_TIME = Math.round(new Date().valueOf() / 1000);
const TEST_MEASUREMENT = [{
            name: TEST_SENSOR1_NAME,
            unit: TEST_SENSOR1_UNIT,
            measurements: [[TEST_SENSOR1_MEASUREMENT_TIME, 100]]
        }]
const TEST_MEASUREMENT2 = [...TEST_MEASUREMENT,
    {
        name: TEST_SENSOR1_NAME,
        unit: TEST_SENSOR1_UNIT,
        measurements: [[TEST_SENSOR1_MEASUREMENT_TIME, 200]]
    }
]        

describe('SensorData', () => {
    it ('should call listeners', () => {
        let sd = new SensorData();
        let timesListenerCalled = 0;
        sd.addListener(() => timesListenerCalled++);
        sd.onevent({
            data: JSON.stringify(TEST_MEASUREMENT)
        })
        expect(timesListenerCalled).to.equal(1);
        sd.onevent({
            data: JSON.stringify(TEST_MEASUREMENT)
        })
        expect(timesListenerCalled).to.equal(2);
    })

    it('shoult return correct sensor names and units', ()=> {
        let sd = new SensorData();        
        sd.onevent({
            data: JSON.stringify(TEST_MEASUREMENT)
        })
        let sensorNames = sd.getSensorNames();
        let unit = sd.getUnit(TEST_SENSOR1_NAME);
        expect(sensorNames).to.be.a('array').that.have.lengthOf(1).and.eqls([TEST_SENSOR1_NAME]);
        expect(unit).to.equal(TEST_SENSOR1_UNIT);
    })

    it('should return correct data for single measurement', () => {
        let sd = new SensorData();        
        sd.onevent({
            data: JSON.stringify(TEST_MEASUREMENT)
        })
        
        let lastValues = sd.getLastValues(TEST_SENSOR1_NAME, 10);
        let datum = lastValues[0];        
        
        expect(lastValues.length).to.equal(1);        
        expect(datum.v).to.be.a('array').that.have.lengthOf(1).and.eqls([100]);        
        expect(datum).to.include({
            t: TEST_SENSOR1_MEASUREMENT_TIME * 1000,
            last: 100,
            max: 100,
            min: 100,
            avg: 100
        });
    });

    it('should return correct data for multiple values in single moment', () => {
        let sd = new SensorData();
        sd.onevent({
            data: JSON.stringify(TEST_MEASUREMENT2)
        })
        
        let lastValues = sd.getLastValues(TEST_SENSOR1_NAME, 10);
        let datum = lastValues[0];                
        expect(lastValues).to.have.lengthOf(1);        
        expect(datum.v).to.be.a('array').that.have.lengthOf(2)
            .and.eqls([100, 200]);        
        expect(datum).to.include({
            t: TEST_SENSOR1_MEASUREMENT_TIME * 1000,
            last: 200,
            max: 200,
            min: 100,
            avg: 150
        });
    });

    it('should return correct data for multiple values', () => {
        let sd = new SensorData();
        sd.onevent({
            data: JSON.stringify([TEST_MEASUREMENT2[0]])
        })        
        sd.onevent({
            data: JSON.stringify([TEST_MEASUREMENT2[1]])
        })
        
        let lastValues = sd.getLastValues(TEST_SENSOR1_NAME, 10);
        let datum = lastValues[0];                
        expect(lastValues).to.have.lengthOf(1);        
        expect(datum.v).to.be.a('array').that.have.lengthOf(2)
            .and.eqls([100, 200]);        
        expect(datum).to.include({
            t: TEST_SENSOR1_MEASUREMENT_TIME * 1000,
            last: 200,
            max: 200,
            min: 100,
            avg: 150
        });
    });
});