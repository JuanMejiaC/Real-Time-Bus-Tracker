mapboxgl.accessToken = "pk.eyJ1IjoianVhbi0xNDQiLCJhIjoiY2tsdjFoMnNjMDN6ZTJ3cDk5Nm45bWh6bSJ9.pHOjLqPiV4WxXFUekhEY5g";
let buses = [];

//map variable initialization
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-71.104081, 42.365554],
    zoom: 14
});

//Create the stop markers
async function getStops() {
    const urlS = 'https://api-v3.mbta.com/stops?filter[route]=1&include=route';
    const response = await fetch(urlS);   
    const jsonS = await response.json();


    
    console.log(jsonS);
    jsonS.data.forEach(element => {
        let el = document.createElement('div');
        el.className = 'marker-stop';
        let wheelChairBoarding = "";
        switch(element.attributes.wheelchair_boarding){
            case 0:
                wheelChairBoarding = "no data";
                break;
            case 1:
                wheelChairBoarding = "yes";
                break;
            case 2:
                wheelChairBoarding = "no"
                break
        }
        let marker = new mapboxgl.Marker(el)
            .setLngLat([element.attributes.longitude, element.attributes.latitude])
            .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML('<h3>' + `Stop Id: ${element.id}` + '<br>' +`Street: ${element.attributes.on_street}` + '</h3><p>' + `Wheelchair Boarding: ${wheelChairBoarding}` + '</p>'))
            .addTo(map);
        buses.push(marker);
    });
}

//create the bus markers
function makeMarkers(locations){
    locations.forEach(element => {
        let oStatus =  "";
        element.attributes.occupancy_status != null ? oStatus = element.attributes.occupancy_status.replace(/_/g,' ') : oStatus = " ";
        let el = document.createElement('div');

        el.className = 'marker';
        let marker = new mapboxgl.Marker(el)
            .setLngLat([element.attributes.longitude, element.attributes.latitude])
            .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML('<h3>' + `Route: ${element.relationships.route.data.id}` + '<br>' + element.attributes.current_status.replace(/_/g,' ') + " stop# " + element.relationships.stop.data.id + '</h3><p>' + oStatus + '</p>'))
            .addTo(map);
        buses.push(marker);
    });
}

async function getPredictions(){
    const url = 'https://api-v3.mbta.com/predictions?filter[stop]=101&page[limit]=1';
    const response = await fetch(url);
    const json = await response.json();
    console.log(json);

}

async function run() {   
    const locations = await getBusLocations();

    //if number of buses is different than current one update the array
    if(buses.length != locations.length) {
        buses = [];
        makeMarkers(locations);
    }
    console.log(new Date());
    console.log(locations);
    for(let i=0; i<buses.length; i++){
        buses[i].setLngLat([locations[i].attributes.longitude, locations[i].attributes.latitude])
    }
    setTimeout(run, 15000);
}

async function getBusLocations() {
    const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
    const response = await fetch(url);   
    const json = await response.json();
    return json.data;
}
getPredictions();
getStops();
run();