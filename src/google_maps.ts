
const API_KEY = 'AIzaSyBUlEYX-ZO1Mndlr5GJ7DCR4Yxo9Hcjloo';


// is google maps loaded
let _isLoaded = false;

// is google maps currently loading
let _isLoading = false;

// callbacks to call on load finish
let callbacks: (()=>void)[] = [];


const GOOGLE_MAPS_SCRIPT_TAG_ID = 'google-MAPS-script-tag-id';
const GOOGLE_MAPS_URL = 'https://maps.googleapis.com/maps/api/js?key=' + API_KEY + '&callback=maps_loaded_callback';

/** Inject script tag for google maps api. Calls callback on finish. 
 * Does nothing if map already fully loaded */
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
    script.src = GOOGLE_MAPS_URL;
    script.id = GOOGLE_MAPS_SCRIPT_TAG_ID;
    document.getElementsByTagName('head')[0].appendChild(script);
}

/**
 * Callback called by google maps. Sess GOOGLE_MAPS_URL above;
 */
window.maps_loaded_callback = function() {    
    _isLoaded = true;
    for (let cb of callbacks) {
        try {
            cb();
        } catch (e) {
            console.error(e.stack);
        }
    }
}

/**
 * returns true if google maps api fully loaded.
 */
export function isLoaded() {
    return _isLoaded;
}