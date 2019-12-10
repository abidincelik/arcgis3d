import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { WebMapView } from './components/Arcgis3D';
import CalciteThemeProvider from 'calcite-react/CalciteThemeProvider';

ReactDOM.render(
    <CalciteThemeProvider>
        <WebMapView />
    </CalciteThemeProvider>,
    document.getElementById('root'),
);