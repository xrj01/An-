import React from 'react';
import { Button, Steps, Icon, Popover    } from 'antd';
import bind from "react-autobind";
import OverviewInfo from './SUBOverviewInfo';
import OrderTrackingModal from './../modal/orderTrackingModal';
import api from '../../../components/api';
import './index.scss';
const { Step } = Steps;

export default class ParentOrder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            trackVisable: false,  //  跟踪物流弹窗
            subOrder_id: '',      //  子订单ID
            stepStatus: '',       //  步骤图状态
            state: '',            //  当前状态
            current: 0,           //  当前步骤
            
            courier_id: '',       //  物流id
            courier_name: '',     //  物流名称
            order_goods: '',      //  商品信息
        }
        bind(this)
    }

    /* 待提交  ---  提交订单  

        待付款  ---  审批

        待发货  ---  支付订单

        已发货  ---  商家发货

        已完成  --- 确认收货 / 完成

        courier_id: "123456"
        courier_name: "昂牛顺丰"
    */

    // 控制弹窗的显示与隐藏
    isShowModal(type, isTrue, record) {
        this.setState({
            [type]: isTrue
        },()=>{
            if (isTrue) {
                this.logisticsModal.getIdAndLogiticsDetail(record)
            }
        })
    }

    // 获取详情信息
    getDetails = (id) => {
        // console.log('子id', id);
        api.axiosPost('subOrderDetails', { order_id: id }).then(res => {
            console.log('我是子订单详情页的数据', res);
            if (res.data.code === 1) {
                this.setState({
                    stepStatus: res.data.data.base.time_info,
                    state: res.data.data.base.state,
                    courier_id: res.data.data.order_goods.data.courier_id,
                    courier_name: res.data.data.order_goods.data.courier_name,
                    order_goods: res.data.data.order_goods.data
                })
                
                Object.keys(res.data.data.base.time_info).forEach( (item, index) => {
                    
                    if(item == res.data.data.base.state){
                        let current = index
                        if(item == 4){
                            current = index+1
                        }
                        // console.log('当前状态', item, index, current);
                        this.setState({
                            current: current
                        })
                    }
                })
                this.overviewInfo.getRefDetails(res.data.data)
            }
        })
    }
    // 描述信息
    description = function (time) {

        return (
            <div className='description'>{time}</div>
        )
    }
    // 订单追踪的内容
    renderContent = () => (
        <div>
            <p>物流单号：{this.state.courier_id ? this.state.courier_id : '暂无物流单号...' }</p>
            <p>物流名称：{this.state.courier_name ? this.state.courier_name : '暂无物流名称...' }</p>
        </div>
    )
    componentDidMount() {
        const id = this.props.location.search.split('?')[1];
        // console.log('id', id,this.props.location);
        this.setState({
            subOrder_id: id
        })
        this.getDetails(id)
    }

    render() {
        const { stepStatus, state, current, order_goods } = this.state;
        
        const stateText = () => {
            switch (state) {
                case 0:
                    return '待提交'
                    break;
                case 1:
                    return '待付款'
                    break;
                case 2:
                    return '待发货'
                    break;
                case 3:
                    return '已发货'
                    break;
                case 4:
                    return '已完成'
                    break;
                case -1:
                    return '已取消'
                    break;
                case -2:
                    return '已关闭'
                    break;
                case -3:
                    return '已驳回'
                    break;
                case 100:
                    return '全部'
                    break;
            }
        }
        return (
            <div className='parentOrder-main-box'>
                <h4 className='h4-title'>子订单详情</h4>
                {
                    state == -1 || state == -2 || state == -3 ? '' : 
                    <Steps current={current} labelPlacement="vertical" className='steps margin-bottom-10'>
                        <Step title="提交订单" description={this.description(stepStatus[0])} />
                        <Step title="审批" description={this.description(stepStatus[1])} />
                        <Step title="支付订单" description={this.description(stepStatus[2])} />
                        <Step title="商家发货" description={this.description(stepStatus[3])} />
                        <Step title="确认收货" description={this.description(stepStatus[4])} />
                        <Step title="完成" description={this.description(stepStatus[4])} />
                    </Steps>
                }
                
                <div className='control-box'>
                    <div className='current-status'>
                        <Icon type="info-circle" className="iconColor" />&nbsp;
                    当前订单状态：<em>{stateText()}</em>
                    </div>
                    <div className='control-btn-box'>
                        {
                            // state === 0 ? '' : <Button onClick={() => { this.isShowModal('trackVisable', true) }}>追踪订单</Button>
                            state === 3 || state === 4 ? 
                            <Button onClick={() => { this.isShowModal('trackVisable', true, order_goods) }}>追踪订单</Button> : '' 
                        }
                        
                    </div>
                </div>
                <OverviewInfo ref={(ref) => { this.overviewInfo = ref }} />
                <OrderTrackingModal display={this.state.trackVisable} isShowModal={this.isShowModal} ref={ref=>{this.logisticsModal = ref}}/>
            </div>
        )
    }
}