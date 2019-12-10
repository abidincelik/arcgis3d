import React from 'react';
import LogoImage from '../logo.png'
import { loadModules, loadCss } from 'esri-loader';

export class WebMapView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      yolsorguilceselect: '',
      yolsorgumahalleselect: '',
      yolsorguyolselect: '',
      kapisorguilceselect: '',
      kapisorgumahalleselect: '',
      kapisorgukapiselect: '',
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

        var muskiustuapi = new FeatureLayer({
          title: "MUSKİ Üst Yapı",
          url: "https://cbs.muski.gov.tr/arcgis/rest/services/CANLI/UST_YAPI/MapServer/0",
          outFields: ["ADI", "CINS"],
          popupTemplate: {
            title: "MUSKİ Üst Yapı Bilgileri",
            content: "<p>Yapı Cinsi : {CINS}</p><p>Yapı Adı : {ADI}</p>"
          },
          labelingInfo: false
        });

        map.add(binalar);
        map.add(yollar);
        map.add(kapinumaralari);
        map.add(muskiustuapi);

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
                href: "./door.png"
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
          content: document.getElementById("yolsorgudiv"),
          group: "top-right"
        });

        var locateWidget = new Locate({
          view: this.view,
         
        });

        function yolSorguInit() {

          self.setState({
            yolsorguilceselect: '',
            yolsorgumahalleselect: '',
            yolsorguyolselect: ''
          })

          if (yolsecim) {
            yolsecim.remove();
          }

          document.getElementById("yolsorguilceSelect").innerHTML = '';
          document.getElementById("yolsorgumahalleSelect").innerHTML = '';
          document.getElementById("yolsorgumahalleSelect").disabled = true;
          document.getElementById("yolsorguyolSelect").innerHTML = '';
          document.getElementById("yolsorguyolSelect").disabled = true;

          var yolsorguilceadiQuery = yollar.createQuery();
          yolsorguilceadiQuery.outFields = ["ILCEADI"];
          yolsorguilceadiQuery.returnGeometry = false;
          yolsorguilceadiQuery.returnDistinctValues = true;
          yolsorguilceadiQuery.orderByFields = ["ILCEADI ASC"];

          yollar.queryFeatures(yolsorguilceadiQuery)
            .then(function (response) {

              const yolsorguilceelement = document.createElement('option');
              yolsorguilceelement.value = "";
              yolsorguilceelement.innerText = "İlçe Seçin";
              document.getElementById("yolsorguilceSelect").appendChild(yolsorguilceelement);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.ILCEADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("yolsorguilceSelect").appendChild(s);

              }
            });

          const yolsorgumahalleelement = document.createElement('option');
          yolsorgumahalleelement.value = "";
          yolsorgumahalleelement.innerText = "Mahalle Seçin";
          document.getElementById("yolsorgumahalleSelect").appendChild(yolsorgumahalleelement);

          const yolsorguyolelement = document.createElement('option');
          yolsorguyolelement.value = "";
          yolsorguyolelement.innerText = "Yol Seçin";
          document.getElementById("yolsorguyolSelect").appendChild(yolsorguyolelement);

        };

        yolSorguInit();

        document.getElementById("yolsorguilceSelect").addEventListener("change", yolsorguilceSelectFunction);
        document.getElementById("yolsorgumahalleSelect").addEventListener("change", yolsorgumahalleSelectFunction);
        document.getElementById("yolsorguyolSelect").addEventListener("change", yolsorguyolSelectFunction);
        document.getElementById("yolsorguresetButton").addEventListener("click", yolSorguInit);


        function yolsorguilceSelectFunction() {
          self.setState({
            yolsorguilceselect: document.getElementById("yolsorguilceSelect").value
          })
          document.getElementById("yolsorgumahalleSelect").innerHTML = '';
          if (document.getElementById("yolsorguilceSelect").value === '') {
            document.getElementById("yolsorgumahalleSelect").disabled = true;
          } else {
            document.getElementById("yolsorgumahalleSelect").disabled = false;
          }
          document.getElementById("yolsorguyolSelect").innerHTML = '';
          document.getElementById("yolsorguyolSelect").disabled = true;

          var yolsorgumahalleQuery = yollar.createQuery();
          if (self.state.yolsorguilceselect !== '') {
            yolsorgumahalleQuery.where = "ILCEADI ='" + self.state.yolsorguilceselect + "'";
          }
          yolsorgumahalleQuery.outFields = ["MAHALLEADI"];
          yolsorgumahalleQuery.returnGeometry = false;
          yolsorgumahalleQuery.returnDistinctValues = true;
          yolsorgumahalleQuery.orderByFields = ["MAHALLEADI ASC"];

          yollar.queryFeatures(yolsorgumahalleQuery)
            .then(function (response) {

              const yolsorgumahalleelement = document.createElement('option');
              yolsorgumahalleelement.value = "";
              yolsorgumahalleelement.innerText = "Mahalle Seçin";
              document.getElementById("yolsorgumahalleSelect").appendChild(yolsorgumahalleelement);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.MAHALLEADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("yolsorgumahalleSelect").appendChild(s);

              }
            });

          const yolsorguyolelement = document.createElement('option');
          yolsorguyolelement.value = "";
          yolsorguyolelement.innerText = "Yol Seçin";
          document.getElementById("yolsorguyolSelect").appendChild(yolsorguyolelement);
          
        };

        function yolsorgumahalleSelectFunction() {
          self.setState({
            yolsorgumahalleselect: document.getElementById("yolsorgumahalleSelect").value
          })

          if (document.getElementById("yolsorgumahalleSelect").value === '') {
            document.getElementById("yolsorguyolSelect").disabled = true;
          } else {
            document.getElementById("yolsorguyolSelect").disabled = false;
          }

          document.getElementById("yolsorguyolSelect").innerHTML = '';

          var yolsorguyoladiQuery = yollar.createQuery();
          yolsorguyoladiQuery.where = "ILCEADI ='" + self.state.yolsorguilceselect + "' AND MAHALLEADI ='" + self.state.yolsorgumahalleselect + "'";
          yolsorguyoladiQuery.outFields = ["YOLADI"];
          yolsorguyoladiQuery.returnGeometry = false;
          yolsorguyoladiQuery.returnDistinctValues = true;
          yolsorguyoladiQuery.orderByFields = ["YOLADI ASC"];

          yollar.queryFeatures(yolsorguyoladiQuery)
            .then(function (response) {

              const yolsorguyolelement = document.createElement('option');
              yolsorguyolelement.value = "";
              yolsorguyolelement.innerText = "Yol Seçin";
              document.getElementById("yolsorguyolSelect").appendChild(yolsorguyolelement);

              for (let index = 0; index < response.features.length; index++) {
                const element = response.features[index].attributes.YOLADI;
                const s = document.createElement('option');
                s.value = element;
                s.innerText = element;
                document.getElementById("yolsorguyolSelect").appendChild(s);

              }
            });

        };

        function yolsorguyolSelectFunction() {
          self.setState({
            yolsorguyolselect: document.getElementById("yolsorguyolSelect").value
          })

          var yolgotoQuery = yollar.createQuery();
          yolgotoQuery.where = "ILCEADI ='" + self.state.yolsorguilceselect + "' AND MAHALLEADI ='" + self.state.yolsorgumahalleselect + "' AND YOLADI = '" + self.state.yolsorguyolselect + "'";

          yollar.queryFeatures(yolgotoQuery)
            .then(function (response) {
              self.view.goTo(response.features).then(function () {
                yolSecim(response.features)
              });
            });
        };

        function yolSecim(features) {
          self.view.whenLayerView(yollar).then(function (layerView) {
            if (yolsecim) {
              yolsecim.remove();
            }
            yolsecim = layerView.highlight(
              features
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
          <div className="esri-widget" id="yolsorgudiv" style={{ padding: '10px', width: '300px' }}>
            <h3>Sorgu</h3>
            <label>İlçe</label>
            <select className="esri-select" id="yolsorguilceSelect" defaultValue={''}>
            </select>
            <br />
            <label>Mahalle</label>
            <select className="esri-select" id="yolsorgumahalleSelect" defaultValue={''}>
            </select>
            <br />
            <label>Yol</label>
            <select className="esri-select" id="yolsorguyolSelect" defaultValue={''}>
            </select>
            <br />
            <button className="esri-button" id="yolsorguresetButton">Sorguyu Sıfırla</button>
          </div>

        </div>
      </div>
    );
  }
}