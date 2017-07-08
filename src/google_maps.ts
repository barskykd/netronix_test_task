
const API_KEY = 'AIzaSyBUlEYX-ZO1Mndlr5GJ7DCR4Yxo9Hcjloo';



let _isLoaded = false;
let _isLoading = false;
let callbacks: (()=>void)[] = [];
const GOOGLE_MAPS_SCRIPT_TAG_ID = 'google-MAPS-script-tag-id';
const GOOGLE_MAPS_URL = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY + '&callback=maps_loaded_callback';

export function load(callback: ()=>void) {
    if (_isLoaded) {
        return;
    }
    if (_isLoading) {
        callbacks.push(callback);
        return;
    }
    _isLoading = true;
    callbacks.push(callback);   

    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
        
    };
    script.src = GOOGLE_MAPS_URL;
    script.id = GOOGLE_MAPS_SCRIPT_TAG_ID;
    document.getElementsByTagName('head')[0].appendChild(script);
}

window.maps_loaded_callback = function() {
    console.log('maps loaded');
        _isLoaded = true;
        for (let cb of callbacks) {
            cb();
        }
}

export function isLoaded() {
    return _isLoaded;
}