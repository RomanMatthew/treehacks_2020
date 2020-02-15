require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/Graphic",
], (Map, MapView, FeatureLayer, Graphic) => {
    let graphic = new Graphic({
        geometry: {
            type: 'polyline',
            paths: [
                [-118.7, 34.0],
                [-118.8, 34.0],
                [-118.8, 34.1],
            ]
        },
        attributes: {
            _objectId: 0,
        }
    });

    let layer = new FeatureLayer({
        source: [graphic],
        objectIdField: '_objectId',
        fields: [
            { name: '_objectId', type: 'oid' },
        ],
        renderer: {
            type: 'simple',
            symbol: {
                type: 'simple-line',
                color: [255, 0, 255],
                width: 4,
            }
        }
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