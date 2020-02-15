require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
], (Map, MapView, GraphicsLayer, Graphic) => {
    let graphic = new Graphic({
        geometry: {
            type: 'polyline',
            paths: [
                [-118.7, 34.0],
                [-118.8, 34.0],
                [-118.8, 34.1],
            ]
        },
        symbol: {
            type: 'simple-line',
            color: [255, 0, 255],
            width: 4
        },
        attributes: {
            colorDescription: 'obnoxious',
            polishLevel: 'negative',
        }
    });

    let layer = new GraphicsLayer({
        graphics: [graphic]
    });

    let map = new Map({
        basemap: "satellite"
    });
    map.add(layer);

    let view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-118.80500, 34.02700], // longitude, latitude
        zoom: 13
    });
});