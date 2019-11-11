import React from "react";
import {Link} from "react-router-dom";
import bind from "react-autobind";
import { Table, Form, Row, Col, Input, Button,message,Radio,Pagination, Modal ,Select,DatePicker,Tabs} from "antd";
import OrderList from './orederList';
import './index.scss';

const Option = Select.Option;
const {RangePicker } = DatePicker;

class order extends React.Component {
    constructor(props) {
        super(props)
        
        this.state= {
            orderStatus : [
                {
                    title: '全部订单',
                    num: 0,
                    status: 100,
                    numName: 'all'
                },
                {
                    title: '待提交',
                    num: 0,
                    status: 0,
                    numName: 'submitted'
                },
                {
                    title: '待付款',
                    num: 0,
                    status: 1,
                    numName: 'payment'
                },
                {
                    title: '待发货',
                    num: 0,
                    status: 2,
                    numName: 'shipped_wait'
                },
                {
                    title: '已发货',
                    num: 0,
                    status: 3,
                    numName: 'shipped'
                },
                {
                    title: '已完成',
                    num: 0,
                    status: 4,
                    numName: 'completed'
                },
                {
                    title: '已关闭',
                    num: 0,
                    status: -2,
                    numName: 'closed'
                },
                {
                    title: '已取消',
                    num: 0,
                    status: -1,
                    numName: 'cancelled'
                },
                {
                    title: '已驳回',
                    num: 0,
                    status: -3,
                    numName: 'rejected'
                },
            ],
            activeIndex: 0,        //  当前按钮状态
            state: 100,            //  订单状态	 0待提交 1待付款 2代发货 3已发货 4已完成 -1已取消 -2已关闭 -3已驳回  100全部
        }
        bind(this)
        this.childMathod = ''
    }
    //  切换订单状态
    switchStatus(index, status){
        this.setState({
            activeIndex:index,
            state: status
        },()=>{
            // 调用子组件的方法
            this.childMathod()
        })
    }
    // 订单状态改变更新   订单数量
    updateOrderNum (data) {
        // console.log('data', data);
        const { orderStatus } = this.state;
        orderStatus.map( (item, index) => {
            item.num = data[item.numName]
        })
        this.setState({
            orderStatus: [...orderStatus]
        })
    }
    // 获取子组件的方法
    onRef(ref){
        this.childMathod = ref
    }
    componentDidMount(){
        this.childMathod(this.state.state);
    }
    render() {
        const {orderStatus,activeIndex} = this.state;
        return (
            <div className='platformOrder-box'>
                <h4 className='h4-title'>平台订单列表</h4>
                <Row className='margin-bottom-30'>
                    <Col span={24} className='status-control'>
                        {
                            orderStatus && orderStatus.length && orderStatus.map( (item, index) => {
                                return (
                                    <Button 
                                        key={item.status}
                                        type={activeIndex === index ? 'primary' : 'default'}
                                        onClick={()=>{this.switchStatus(index,item.status)}}
                                    >
                                        {item.title}({item.num})
                                    </Button>
                                )
                            })
                        }
                    </Col>
                </Row>
                <OrderList onRef={this.onRef} {...this.props} state={this.state.state} updateOrderNum={this.updateOrderNum}/>
            </div>
      )
    }

}
export default order;
