import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RouterDom from './router';
import * as serviceWorker from './serviceWorker';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'antd/dist/antd.css';


ReactDOM.render(
    <LocaleProvider locale={zh_CN}>
        <RouterDom />
    </LocaleProvider>, document.getElementById('root'));

serviceWorker.unregister();
