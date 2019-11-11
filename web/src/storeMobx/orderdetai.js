import { observable, computed, action } from 'mobx';
import { message } from 'antd';
class orderdetai {
    @observable detailinfo = {};


    // 获取订单详情的值
    @action setOrderInfo(detail){
        this.detailinfo = detail;
    }
}
export default orderdetai