import React from 'react';
import LogoImage from '../logo.png'
import { loadModules, loadCss } from 'esri-loader';

export class WebMapView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      ilceselect: '',
      mahalleselect: '',
      yolselect: '',
    }
  }

  componentDidMount = () => {

    var self = this;

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
          },
        });

        var yolsecim;

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

        var Katmanlar = new LayerList({
          view: this.view,
        });

        var LayerExpand = new Expand({
          view: this.view,
          content: Katmanlar,
          group: "top-right"
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
          group: "top-right"
        });

        var SorguExpand = new Expand({
          view: this.view,
          content: document.getElementById("optionsDiv"),
          group: "top-right"
        });

        var locateWidget = new Locate({
          view: this.view,
          graphic: new Graphic({
            symbol: { type: "simple-marker" }
          })
        });

        function yolSorguInit() {

          self.setState({
            ilceselect: '',
            mahalleselect: '',
            yolselect: ''
          })

          if (yolsecim) {
            yolsecim.remove();
          }

          document.getElementById("ilceSelect").innerHTML = '';
          document.getElementById("mahalleSelect").innerHTML = '';
          document.getElementById("yolSelect").innerHTML = '';

          var ilceadiQuery = yollar.createQuery();
          ilceadiQuery.outFields = ["ILCEADI"];
          ilceadiQuery.returnGeometry = false;
          ilceadiQuery.returnDistinctValues = true;
          ilceadiQuery.orderByFields = ["ILCEADI ASC"];

          yollar.queryFeatures(ilceadiQuery)
            .then(function (response) {

              const s = document.createElement('option');
              s.value = "";
              s.innerText = "TÜMÜ";
              document.getElementById("ilceSelect").appendChild(s);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.ILCEADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("ilceSelect").appendChild(s);

              }
            });

          var mahalleQuery = yollar.createQuery();
          mahalleQuery.outFields = ["MAHALLEADI"];
          mahalleQuery.returnGeometry = false;
          mahalleQuery.returnDistinctValues = true;
          mahalleQuery.orderByFields = ["MAHALLEADI ASC"];

          yollar.queryFeatures(mahalleQuery)
            .then(function (response) {

              const s = document.createElement('option');
              s.value = "";
              s.innerText = "TÜMÜ";
              document.getElementById("mahalleSelect").appendChild(s);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.MAHALLEADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("mahalleSelect").appendChild(s);

              }
            });

          var yoladiQuery = yollar.createQuery();
          yoladiQuery.outFields = ["YOLADI"];
          yoladiQuery.returnGeometry = false;
          yoladiQuery.returnDistinctValues = true;
          yoladiQuery.orderByFields = ["YOLADI ASC"];

          yollar.queryFeatures(yoladiQuery)
            .then(function (response) {

              const s = document.createElement('option');
              s.value = "";
              s.innerText = "TÜMÜ";
              document.getElementById("yolSelect").appendChild(s);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.YOLADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("yolSelect").appendChild(s);

              }
            });
        };

        yolSorguInit();

        document.getElementById("ilceSelect").addEventListener("change", ilceSelectFunction);
        document.getElementById("mahalleSelect").addEventListener("change", mahalleSelectFunction);
        document.getElementById("yolSelect").addEventListener("change", yolSelectFunction);
        document.getElementById("yolSorguResetButton").addEventListener("click", yolSorguInit);


        function ilceSelectFunction() {
          self.setState({
            ilceselect: document.getElementById("ilceSelect").value
          })
          document.getElementById("mahalleSelect").innerHTML = '';
          document.getElementById("yolSelect").innerHTML = '';

          var mahalleQuery = yollar.createQuery();
          if (self.state.ilceselect !== '') {
            mahalleQuery.where = "ILCEADI ='" + self.state.ilceselect + "'";
          }
          mahalleQuery.outFields = ["MAHALLEADI"];
          mahalleQuery.returnGeometry = false;
          mahalleQuery.returnDistinctValues = true;
          mahalleQuery.orderByFields = ["MAHALLEADI ASC"];

          yollar.queryFeatures(mahalleQuery)
            .then(function (response) {

              const s = document.createElement('option');
              s.value = "";
              s.innerText = "TÜMÜ";
              document.getElementById("mahalleSelect").appendChild(s);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.MAHALLEADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("mahalleSelect").appendChild(s);

              }
            });

          var yoladiQuery = yollar.createQuery();
          if (self.state.ilceselect !== '') {
            yoladiQuery.where = "ILCEADI ='" + self.state.ilceselect + "'";
          }
          if (self.state.mahalleselect !== '') {
            yoladiQuery.where = "MAHALLEADI ='" + self.state.mahalleselect + "'";
          }
          yoladiQuery.outFields = ["YOLADI"];
          yoladiQuery.returnGeometry = false;
          yoladiQuery.returnDistinctValues = true;
          yoladiQuery.orderByFields = ["YOLADI ASC"];

          yollar.queryFeatures(yoladiQuery)
            .then(function (response) {

              const s = document.createElement('option');
              s.value = "";
              s.innerText = "TÜMÜ";
              document.getElementById("yolSelect").appendChild(s);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.YOLADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("yolSelect").appendChild(s);

              }
            });
        };

        function mahalleSelectFunction() {
          self.setState({
            mahalleselect: document.getElementById("mahalleSelect").value
          })

          document.getElementById("yolSelect").innerHTML = '';

          var yoladiQuery = yollar.createQuery();
          if (self.state.ilceselect !== '') {
            yoladiQuery.where = "ILCEADI ='" + self.state.ilceselect + "'";
          }
          if (self.state.mahalleselect !== '') {
            yoladiQuery.where = "MAHALLEADI ='" + self.state.mahalleselect + "'";
          }
          yoladiQuery.outFields = ["YOLADI"];
          yoladiQuery.returnGeometry = false;
          yoladiQuery.returnDistinctValues = true;
          yoladiQuery.orderByFields = ["YOLADI ASC"];

          yollar.queryFeatures(yoladiQuery)
            .then(function (response) {

              const s = document.createElement('option');
              s.value = "";
              s.innerText = "TÜMÜ";
              document.getElementById("yolSelect").appendChild(s);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.YOLADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("yolSelect").appendChild(s);

              }
            });

        };

        function yolSelectFunction() {
          self.setState({
            yolselect: document.getElementById("yolSelect").value
          })

          var gotoQuery = yollar.createQuery();
          gotoQuery.where = "YOLADI = '" + self.state.yolselect + "'"

          yollar.queryFeatures(gotoQuery)
            .then(function (response) {
              self.view.goTo(response.features).then(function () {

                yolSecim(response.features[0].attributes.OBJECTID)

              });

            });
        };

        function yolSecim(objectid) {

          self.view.whenLayerView(yollar).then(function (layerView) {
            if (yolsecim) {
              yolsecim.remove();
            }
            yolsecim = layerView.highlight(
              objectid
            );
          });
        };

        var logovisible = document.getElementById("logoDiv")
        logovisible.style.display = "block";

        this.view.ui.add("logoDiv", "bottom-right");
        this.view.ui.add(locateWidget, "top-left");
        this.view.ui.add([LegendExpand, LayerExpand, SorguExpand], "top-right");
      });
  }

  render() {
    return (
      <div className="webmap" ref={this.mapRef} style={{ width: '100vw', height: '100vh' }}>
        <div id="logoDiv" style={{
          backgroundImage: `url(${LogoImage})`, textAlign: 'center',
          width: '90px', height: '90px', boxShadow: '0 0 0', display: 'none'
        }}>
          <div className="esri-widget" id="optionsDiv" style={{ padding: '10px', width: '300px' }}>
            <h3>Sorgu</h3>
            <label>İlçe</label>
            <select className="esri-select" id="ilceSelect" defaultValue={''}>
            </select>
            <br />
            <label>Mahalle</label>
            <select className="esri-select" id="mahalleSelect" defaultValue={''}>
            </select>
            <br />
            <label>Yol</label>
            <select className="esri-select" id="yolSelect" defaultValue={''}>
            </select>
            <br />
            <button className="esri-button" id="yolSorguResetButton">Sorguyu Sıfırla</button>
          </div>

        </div>
      </div>
    );
  }
}