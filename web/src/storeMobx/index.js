import { observable, computed, action } from 'mobx';
import { message } from 'antd';
import Orderdetai from "./orderdetai";
class AppStort {
    constructor(){
        this.Orderdetai = new Orderdetai(this);
    }
}

export default AppStort