import React from 'react';
import LogoImage from '../logo.png'
import MuskiLogo from '../muskilogo.png'
import { loadModules, loadCss } from 'esri-loader';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Tabs, Tab } from 'react-bootstrap';

export class Arcgis3D extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {

      map: null,
      view: null,
      yolkatman: null,
      binakatman: null,
      kapikatman: null,
      muskiustuapikatman: null,
      mbbbinakatman: null,
      muskibinakatman: null,
      locatewidget: null,
      katmanlistesi: null,
      katmanlistesiexpand: null,
      katmanlegend: null,
      katmanlegendexpand: null,
      sorguexpand: null,

      yolsecim: null,
      kapisecim: null,

      sorguactiveTabIndex: 0,

      yolsorguilceselect: '',
      yolsorgumahalleselect: '',
      yolsorguyolselect: '',
      yolsorgukapiselect: '',

    }
    this.sorguonTabChange = this.sorguonTabChange.bind(this);
  }

  sorguonTabChange(index) {
    this.setState({ sorguactiveTabIndex: index });
  }

  componentDidMount = () => {

    loadCss('https://js.arcgis.com/4.13/esri/themes/dark-blue/main.css');

    loadModules([
      'esri/Map',
      'esri/views/SceneView',
      'esri/layers/SceneLayer',
      'esri/layers/FeatureLayer',
      'esri/widgets/Legend',
      'esri/widgets/LayerList',
      'esri/widgets/Expand',
      'esri/widgets/Locate',
    ])
      .then(([
        Map,
        SceneView,
        SceneLayer,
        FeatureLayer,
        Legend,
        LayerList,
        Expand,
        Locate,
      ]) => {

        this.setState({

          map: new Map({
            basemap: "satellite",
            ground: "world-elevation"
          }),

          yolkatman: new FeatureLayer({
            title: "Yollar",
            url: "https://muglacbs.mugla.bel.tr/cbs/rest/services/MABS/Mabs_View_Yol/MapServer/0",
            outFields: ["YOLADI", "YOLTIP"],
            popupTemplate: {
              title: "Yol",
              content: "<p>Yol Tipi : {YOLTIP}</p><p>Yol Adı : {YOLADI}</p>"
            }
          }),

          binakatman: new SceneLayer({
            title: "Binalar",
            url: "https://cbs.mugla.bel.tr/cbs/rest/services/Hosted/Yapilar3D_2/SceneServer",
            outFields: ["KATADEDI", "AD", "KIMLIKNO", "TIP", "DURUM"],
            popupTemplate: {
              title: "Bina",
              content: "<p>Tip : {TIP}</p><p>Durum : {DURUM}</p><p>Bina Adı : {AD}</p><p>Kimlik No : {KIMLIKNO}</p><p>Kat Adedi : {KATADEDI}</p>"
            },
            definitionExpression: "KATADEDI > 0",
            renderer: {
              type: "simple",
              symbol: {
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
              }
            }
          }),

          kapikatman: new FeatureLayer({
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
            renderer: {
              symbol: {
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
              },
              type: "simple"
            }

          }),

          mbbbinakatman: new FeatureLayer({
            title: "MBB Hizmet Binaları",
            url: "https://muglacbs.mugla.bel.tr/cbs/rest/services/Hizmet_Binalari/Hizmet_Binalari_Nokta/MapServer/0",
            outFields: ["ilce", "ad", "adres", "yapi_id"],
            popupTemplate: {
              title: "MBB Hizmet Bina Bilgisi",
              content: "<p>İlçe : {ilce}</p><p>Bina Adı : {ad}</p><p>Adres : {adres}</p><p>Yapı ID : {yapi_id}</p>"
            },
            elevationInfo: {
              mode: "relative-to-scene"
            },
            screenSizePerspectiveEnabled: false,
            featureReduction: {
              type: "selection"
            },
            renderer: {
              symbol: {
                type: "point-3d",
                symbolLayers: [
                  {
                    type: "icon",
                    resource: {
                      href: LogoImage
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
                  minWorldLength: 10
                },
                callout: {
                  type: "line",
                  color: "#515D71",
                  size: 2,
                  border: {
                    color: "black"
                  }
                }
              },
              type: "simple"
            }

          }),

          muskibinakatman: new FeatureLayer({
            title: "MUSKİ Hizmet Binaları",
            url: "https://muglacbs.mugla.bel.tr/cbs/rest/services/Hizmet_Binalari/Hizmet_Binalari_Muski_Nokta/MapServer/0",
            outFields: ["ADI"],
            popupTemplate: {
              title: "MUSKİ Hizmet Bina Bilgisi",
              content: "<p>Bina Adı : {ADI}</p>"
            },
            elevationInfo: {
              mode: "relative-to-scene"
            },
            screenSizePerspectiveEnabled: false,
            featureReduction: {
              type: "selection"
            },
            renderer: {
              symbol: {
                type: "point-3d",
                symbolLayers: [
                  {
                    type: "icon",
                    resource: {
                      href: MuskiLogo
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
                  minWorldLength: 10
                },
                callout: {
                  type: "line",
                  color: "#515D71",
                  size: 2,
                  border: {
                    color: "black"
                  }
                }
              },
              type: "simple"
            }

          }),

          muskiustuapikatman: new FeatureLayer({
            title: "MUSKİ Üst Yapı",
            url: "https://cbs.muski.gov.tr/arcgis/rest/services/CANLI/UST_YAPI/MapServer/0",
            outFields: ["ADI", "CINS"],
            popupTemplate: {
              title: "MUSKİ Üst Yapı Bilgileri",
              content: "<p>Yapı Cinsi : {CINS}</p><p>Yapı Adı : {ADI}</p>"
            },
            labelingInfo: false
          })

        })

        this.state.map.add(this.state.muskiustuapikatman);
        this.state.map.add(this.state.muskibinakatman);
        this.state.map.add(this.state.mbbbinakatman);
        this.state.map.add(this.state.kapikatman);
        this.state.map.add(this.state.yolkatman);
        this.state.map.add(this.state.binakatman);

        this.setState({
          view: new SceneView({
            container: this.mapRef.current,
            map: this.state.map,
            camera: {
              position: {
                x: 28.365316,
                y: 37.150000,
                z: 15000
              },
              tilt: 25
            }
          })
        });

        this.setState({
          katmanlistesi: new LayerList({
            view: this.state.view,
          })
        });

        this.setState({
          katmanlistesiexpand: new Expand({
            view: this.state.view,
            content: this.state.katmanlistesi,
            group: "top-right"
          })
        });

        this.setState({
          katmanlegend: new Legend({
            view: this.state.view,
            layerInfos: [{
              layer: this.state.map,
            }]
          })
        })

        this.setState({
          katmanlegendexpand: new Expand({
            view: this.state.view,
            content: this.state.katmanlegend,
            group: "top-right"
          })
        });

        this.setState({
          sorguexpand: new Expand({
            view: this.state.view,
            content: document.getElementById("yolsorgudiv"),
            group: "top-right"
          })
        });

        this.setState({
          locatewidget: new Locate({
            view: this.state.view,
          })
        });

        this.yolSorguInit();

        var logovisible = document.getElementById("logoDiv")
        logovisible.style.display = "block";

        this.state.view.ui.add("logoDiv", "bottom-right");
        this.state.view.ui.add(this.state.locatewidget, "top-left");
        this.state.view.ui.add([this.state.katmanlegendexpand, this.state.katmanlistesiexpand, this.state.sorguexpand], "top-right");
      });
  }

  yolSorguInit = () => {

    this.setState({
      yolsorguilceselect: '',
      yolsorgumahalleselect: '',
      yolsorguyolselect: ''
    })

    if (this.state.yolsecim) {
      this.state.yolsecim.remove();
      this.state.kapisecim.remove();
    }

    document.getElementById("yolsorguilceSelect").innerHTML = '';
    document.getElementById("yolsorgumahalleSelect").innerHTML = '';
    document.getElementById("yolsorgumahalleSelect").disabled = true;
    document.getElementById("yolsorguyolSelect").innerHTML = '';
    document.getElementById("yolsorguyolSelect").disabled = true;
    document.getElementById("yolsorgukapiSelect").innerHTML = '';
    document.getElementById("yolsorgukapiSelect").disabled = true;

    var yolsorguilceadiQuery = this.state.yolkatman.createQuery();
    yolsorguilceadiQuery.outFields = ["ILCEADI"];
    yolsorguilceadiQuery.returnGeometry = false;
    yolsorguilceadiQuery.returnDistinctValues = true;
    yolsorguilceadiQuery.orderByFields = ["ILCEADI ASC"];

    this.state.yolkatman.queryFeatures(yolsorguilceadiQuery)
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

    const yolsorgukapielement = document.createElement('option');
    yolsorgukapielement.value = "";
    yolsorgukapielement.innerText = "Kapı Seçin";
    document.getElementById("yolsorgukapiSelect").appendChild(yolsorgukapielement);

    document.getElementById("yolsorguilceSelect").addEventListener("change", this.yolsorguilceSelectFunction);
    document.getElementById("yolsorgumahalleSelect").addEventListener("change", this.yolsorgumahalleSelectFunction);
    document.getElementById("yolsorguyolSelect").addEventListener("change", this.yolsorguyolSelectFunction);
    document.getElementById("yolsorgukapiSelect").addEventListener("change", this.yolsorgukapiSelectFunction);

  };

  yolsorguilceSelectFunction = () => {
    this.setState({
      yolsorguilceselect: document.getElementById("yolsorguilceSelect").value
    });

    if (document.getElementById("yolsorguilceSelect").value === '') {
      document.getElementById("yolsorgumahalleSelect").disabled = true;
    } else {
      document.getElementById("yolsorgumahalleSelect").disabled = false;
    }

    document.getElementById("yolsorgumahalleSelect").innerHTML = '';
    document.getElementById("yolsorguyolSelect").innerHTML = '';
    document.getElementById("yolsorgukapiSelect").innerHTML = '';
    document.getElementById("yolsorgukapiSelect").disabled = true;
    document.getElementById("yolsorguyolSelect").disabled = true;

    var yolsorgumahalleQuery = this.state.yolkatman.createQuery();
    if (this.state.yolsorguilceselect !== '') {
      yolsorgumahalleQuery.where = "ILCEADI ='" + this.state.yolsorguilceselect + "'";
    }
    yolsorgumahalleQuery.outFields = ["MAHALLEADI"];
    yolsorgumahalleQuery.returnGeometry = false;
    yolsorgumahalleQuery.returnDistinctValues = true;
    yolsorgumahalleQuery.orderByFields = ["MAHALLEADI ASC"];

    this.state.yolkatman.queryFeatures(yolsorgumahalleQuery)
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

    const yolsorgukapielement = document.createElement('option');
    yolsorgukapielement.value = "";
    yolsorgukapielement.innerText = "Kapı Seçin";
    document.getElementById("yolsorgukapiSelect").appendChild(yolsorgukapielement);

  };

  yolsorgumahalleSelectFunction = () => {
    this.setState({
      yolsorgumahalleselect: document.getElementById("yolsorgumahalleSelect").value
    });

    if (document.getElementById("yolsorgumahalleSelect").value === '') {
      document.getElementById("yolsorguyolSelect").disabled = true;
      document.getElementById("yolsorgukapiSelect").disabled = true;
    } else {
      document.getElementById("yolsorguyolSelect").disabled = false;
    }

    document.getElementById("yolsorguyolSelect").innerHTML = '';
    document.getElementById("yolsorgukapiSelect").innerHTML = '';

    var yolsorguyoladiQuery = this.state.yolkatman.createQuery();
    yolsorguyoladiQuery.where = "ILCEADI ='" + this.state.yolsorguilceselect + "' AND MAHALLEADI ='" + this.state.yolsorgumahalleselect + "'";
    yolsorguyoladiQuery.outFields = ["YOLADI"];
    yolsorguyoladiQuery.returnGeometry = false;
    yolsorguyoladiQuery.returnDistinctValues = true;
    yolsorguyoladiQuery.orderByFields = ["YOLADI ASC"];

    this.state.yolkatman.queryFeatures(yolsorguyoladiQuery)
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

    const yolsorgukapielement = document.createElement('option');
    yolsorgukapielement.value = "";
    yolsorgukapielement.innerText = "Kapı Seçin";
    document.getElementById("yolsorgukapiSelect").appendChild(yolsorgukapielement);

  };

  yolsorguyolSelectFunction = () => {
    var self = this;
    this.setState({
      yolsorguyolselect: document.getElementById("yolsorguyolSelect").value
    });

    if (document.getElementById("yolsorguyolSelect").value === '') {
      document.getElementById("yolsorgukapiSelect").disabled = true;
    } else {
      document.getElementById("yolsorgukapiSelect").disabled = false;
    }

    document.getElementById("yolsorgukapiSelect").innerHTML = '';

    var yolsorgukapiadiQuery = this.state.kapikatman.createQuery();
    yolsorgukapiadiQuery.where = "ILCEADI ='" + this.state.yolsorguilceselect + "' AND MAHALLEADI ='" + this.state.yolsorgumahalleselect + "' AND YOLADI ='" + this.state.yolsorguyolselect + "'";
    yolsorgukapiadiQuery.outFields = ["KAPINO"];
    yolsorgukapiadiQuery.returnGeometry = false;
    yolsorgukapiadiQuery.returnDistinctValues = true;
    yolsorgukapiadiQuery.orderByFields = ["KAPINO ASC"];

    this.state.kapikatman.queryFeatures(yolsorgukapiadiQuery)
      .then(function (response) {

        const yolsorgukapielement = document.createElement('option');
        yolsorgukapielement.value = "";
        yolsorgukapielement.innerText = "Kapı Seçin";
        document.getElementById("yolsorgukapiSelect").appendChild(yolsorgukapielement);

        for (let index = 0; index < response.features.length; index++) {
          const element = response.features[index].attributes.KAPINO;
          const s = document.createElement('option');
          s.value = element;
          s.innerText = element;
          document.getElementById("yolsorgukapiSelect").appendChild(s);

        }
      });

    var yolgotoQuery = this.state.yolkatman.createQuery();
    yolgotoQuery.where = "ILCEADI ='" + this.state.yolsorguilceselect + "' AND MAHALLEADI ='" + this.state.yolsorgumahalleselect + "' AND YOLADI = '" + this.state.yolsorguyolselect + "'";

    this.state.yolkatman.queryFeatures(yolgotoQuery)
      .then(function (response) {
        var subself = self;
        self.state.view.goTo(response.features).then(function () {
          subself.yolSecim(response.features)
        });
      });
  };

  yolsorgukapiSelectFunction = () => {

    var self = this;
    this.setState({
      yolsorgukapiselect: document.getElementById("yolsorgukapiSelect").value
    });

    var kapigotoQuery = this.state.kapikatman.createQuery();
    kapigotoQuery.where = "ILCEADI ='" + this.state.yolsorguilceselect + "' AND MAHALLEADI ='" + this.state.yolsorgumahalleselect + "' AND YOLADI = '" + this.state.yolsorguyolselect + "' AND KAPINO = '" + this.state.yolsorgukapiselect + "'";

    this.state.kapikatman.queryFeatures(kapigotoQuery)
      .then(function (response) {
        var subself = self;
        self.state.view.goTo({
          target: response.features,
          zoom: 19
        }).then(function () {
          subself.kapiSecim(response.features)
        });
      });

  };

  yolSecim = (features) => {
    var self = this;
    this.state.view.whenLayerView(this.state.yolkatman).then(function (layerView) {

      if (self.state.yolsecim) {
        self.state.yolsecim.remove();
      }
      if (self.state.kapisecim) {
        self.state.kapisecim.remove();
      }

      self.setState({
        yolsecim: layerView.highlight(
          features
        )
      })
    })
  };

  kapiSecim = (features) => {
    var self = this;
    this.state.view.whenLayerView(this.state.kapikatman).then(function (layerView) {

      self.state.yolsecim.remove();

      if (self.state.kapisecim) {
        self.state.kapisecim.remove();
      }

      self.setState({
        kapisecim: layerView.highlight(
          features
        )
      })
    })
  };

  render() {
    return (
      <div className="webmap" ref={this.mapRef} style={{ width: '100vw', height: '100vh' }}>
        <div id="logoDiv" style={{
          backgroundImage: `url(${LogoImage})`, textAlign: 'center',
          width: '90px', height: '90px', boxShadow: '0 0 0', display: 'none'
        }}>
          <div className="esri-widget" id="yolsorgudiv" style={{ padding: '10px', width: '300px' }}>
            <Tabs defaultActiveKey="yolsorgutab" id="uncontrolled-tab-example">
              <Tab eventKey="yolsorgutab" title="Sorgu">
                <br />
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
                <label>Kapı</label>
                <select className="esri-select" id="yolsorgukapiSelect" defaultValue={''}>
                </select>
                <br />
                <button className="esri-button" id="yolsorguresetButton" onClick={this.yolSorguInit}>Sorguyu Sıfırla</button>
              </Tab>
              <Tab eventKey="kisibilgisi" title="Hane Bilgisi" disabled>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}