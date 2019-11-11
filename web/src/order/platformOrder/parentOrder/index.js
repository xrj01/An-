import React from 'react';
import { Button, Steps } from 'antd';
import OrderControl from './orderControl';
import OverviewInfo from './overviewInfo';
import './index.scss';
import api from '../../../components/api';
const { Step } = Steps;

class ParentOrder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parent_id: '',       // 父订单id
            state: 0,            // 订单状态    0待提交 1待付款 2代发货 3已发货 4已完成 -1已取消 -2已关闭 -3已驳回  100全部
        }
    }

    componentDidMount() { 
        const id = this.props.location.search.split('?')[1];
        
        this.setState({
            parent_id: id
        })
        this.overviewInfo.getDetails(id);

    }
    // 向下层组件传入修改表格数据的方法 
    getLowerCompData = (type, data, other) => {
        this.overviewInfo.receiveEditedData(type, [data], other)
    }
    // 从兄弟组件获取状态
    getState = (state) => {
        const {parent_id} = this.state;
        this.orderControl.getStateAndId(parent_id, state)
    }

    render() {
        const {parent_id, state} = this.state;
        
        return (
            <div className='parentOrder-main-box'>
                <h4 className='h4-title'>父订单详情</h4>
                <OrderControl getLowerCompData={this.getLowerCompData} ref={(ref)=>{this.orderControl = ref}}/>
                <OverviewInfo getState={this.getState} ref={(ref)=>{this.overviewInfo = ref}}/>
            </div>
        )
    }
}

export default ParentOrder;