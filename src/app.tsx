
var eventSource = new window.EventSource("https://jsdemo.envdev.io/sse");

eventSource.onmessage = function(e: any) {
   let data = JSON.parse(e.data);
   for (let d of data) {        
        for (let m of d.measurements) {
            console.log(new Date(m[0]), d.name, m[1]);
        }
   }
}