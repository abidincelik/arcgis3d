import React from 'react';
import LogoImage from '../logo.png'
import { loadModules, loadCss } from 'esri-loader';

export class WebMapView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    loadCss('https://js.arcgis.com/4.13/esri/themes/dark-blue/main.css');

    loadModules([
      'esri/Map',
      'esri/WebScene',
      'esri/views/SceneView',
      'esri/layers/SceneLayer',
      'esri/layers/FeatureLayer',
      'esri/widgets/Search',
      'esri/widgets/Legend',
      'esri/layers/Layer',
      'esri/widgets/LayerList',
      'esri/core/Collection',
      'esri/widgets/Expand',
      "esri/PopupTemplate",
      'esri/portal/PortalItem',
      'esri/widgets/Locate',
      'esri/Graphic',
      'esri/tasks/support/Query'
    ])
      .then(([
        Map,
        WebScene,
        SceneView,
        SceneLayer,
        FeatureLayer,
        Search,
        Legend,
        Layer,
        LayerList,
        Collection,
        Expand,
        PopupTemplate,
        PortalItem,
        Locate,
        Graphic,
        Query
      ]) => {
        var map = new Map({
          basemap: "satellite",
          ground: "world-elevation"
        });

        var yollar = new FeatureLayer({
          title: "Yollar",
          url: "https://muglacbs.mugla.bel.tr/cbs/rest/services/MABS/Mabs_View_Yol/MapServer/0",
          outFields: ["YOLADI", "YOLTIP"],
          popupTemplate: {
            title: "Yol",
            content: "<p>Yol Tipi : {YOLTIP}</p><p>Yol Adı : {YOLADI}</p>"
          },

        });

        var binalar = new SceneLayer({
          title: "Binalar",
          url: "https://cbs.mugla.bel.tr/cbs/rest/services/Hosted/Yapilar3D_2/SceneServer",
          outFields: ["KATADEDI", "AD", "KIMLIKNO", "TIP", "DURUM"],
          popupTemplate: {
            title: "Bina",
            content: "<p>Tip : {TIP}</p><p>Durum : {DURUM}</p><p>Bina Adı : {AD}</p><p>Kimlik No : {KIMLIKNO}</p><p>Kat Adedi : {KATADEDI}</p>"
          },
          definitionExpression: "KATADEDI > 0",

        });

        var kapinumaralari = new FeatureLayer({
          title: "Kapı Numaraları",
          url: "https://muglacbs.mugla.bel.tr/cbs/rest/services/MABS/Mabs_View/MapServer/0",
          outFields: ["ILCEADI", "MAHALLEADI", "YOLADI", "YOLTIPI", "KAPINO"],
          popupTemplate: {
            title: "Kapı Bilgileri",
            content: "<p>İlçe : {ILCEADI}</p><p>Mahalle : {MAHALLEADI}</p><p>CSBM : {YOLADI}</p><p>Yol Tipi : {YOLTIPI}</p><p>Kapı No : {KAPINO}</p>"
          },
          elevationInfo: {
            mode: "relative-to-scene"
          },
          screenSizePerspectiveEnabled: false,
          featureReduction: {
            type: "selection"
          },

        });
        map.add(binalar);
        map.add(yollar);
        map.add(kapinumaralari);

        this.view = new SceneView({
          container: this.mapRef.current,
          map: map,
          camera: {
            position: {
              x: 28.365316,
              y: 37.150000,
              z: 15000
            },
            tilt: 25
          }
        });

        var symbolbinalar = {
          type: "mesh-3d",
          symbolLayers: [
            {
              type: "fill",
              material: {
                color: [255, 170, 2]
              },
              edges: {
                type: "solid",
                color: "black"
              }
            },
          ]
        };

        var symbolkapino = {
          type: "point-3d",
          symbolLayers: [
            {
              type: "icon",
              resource: {
                href: "/door.png"
              },
              size: 25,
              outline: {
                color: "black",
                size: 2
              }
            }
          ],
          verticalOffset: {
            screenLength: 10,
            maxWorldLength: 100,
            minWorldLength: 35
          },
          callout: {
            type: "line",
            color: "#515D71",
            size: 2,
            border: {
              color: "black"
            }
          }
        };

        binalar.renderer = {
          type: "simple",
          symbol: symbolbinalar
        };

        kapinumaralari.renderer = {
          symbol: symbolkapino,
          type: "simple"
        };

        var search = new Search({
          view: this.view
        });

        var Katmanlar = new LayerList({
          view: this.view,
        });

        var LayerExpand = new Expand({
          view: this.view,
          content: Katmanlar,
        });

        var legend = new Legend({
          view: this.view,
          layerInfos: [{
            layer: map,
          }]
        });

        var LegendExpand = new Expand({
          view: this.view,
          content: legend,
        });

        var SorguExpand = new Expand({
          view: this.view,
          content: document.getElementById("optionsDiv"),
        });

        var locateWidget = new Locate({
          view: this.view,
          graphic: new Graphic({
            symbol: { type: "simple-marker" }
          })
        });

        var query = yollar.createQuery();
        query.outFields = ["ILCEADI"];
        query.returnGeometry = false;
        query.returnDistinctValues = true;

        yollar.queryFeatures(query)
          .then(function (response) {
            console.log(response.features[0].attributes.ILCEADI)
          });

        var logovisible = document.getElementById("logoDiv")
        logovisible.style.display = "block";

        this.view.ui.add("logoDiv", "bottom-right");
        this.view.ui.add(locateWidget, "top-left");
        this.view.ui.add(search, "top-right");
        this.view.ui.add(LegendExpand, "top-right");
        this.view.ui.add(LayerExpand, "top-right")
        this.view.ui.add(SorguExpand, "top-right");

      });
  }

  render() {
    return (
      <div className="webmap" ref={this.mapRef} style={{ width: '100vw', height: '100vh' }}>
        <div id="logoDiv" style={{
          backgroundImage: `url(${LogoImage})`, textAlign: 'center',
          width: '90px', height: '90px', boxShadow: '0 0 0', display: 'none'
        }}>
          <div class="esri-widget" id="optionsDiv" style={{ padding: '10px', width: '300px' }}>
            <h3>Sorgu</h3>
            <select class="esri-select" id="attSelect">
              <option className="item" value="ELEV_ft"></option>
              <option value="PROMINENCE_ft" selected>İLÇE</option>
            </select>
            <br />
            <select class="esri-select" id="signSelect">
              <option value=">">MAHALLE</option>
              <option value="<">is less than</option>
              <option value="=">is equal to</option>
            </select>
            <br />
            <select class="esri-select" id="valSelect">
              <option value="1000">YOL</option>
              <option value="5000">5,000 ft</option>
              <option value="10000">10,000 ft</option>
              <option value="15000">15,000 ft</option>
              <option value="20000">20,000 ft</option>
            </select>
            <br />
            <button class="esri-button" id="doBtn">Sonuçları Göster</button>
          </div>

        </div>
      </div>
    );
  }
}