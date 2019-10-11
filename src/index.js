
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import 'element-theme-default';
import './index.css';
import App from './App';
import {store} from './redux/create';
import { Provider } from 'react-redux';

ReactDOM.render( <Provider store={store}><App /></Provider>, document.getElementById('root'));

/* 热加载 */
if (module.hot) {
  module.hot.accept();
}