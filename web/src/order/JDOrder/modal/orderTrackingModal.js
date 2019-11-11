import React from 'react';
import { Modal, Timeline, Button } from 'antd';
import './tranck.scss';
import api from '../../../components/api';
import Public from '../../../components/public'


class OrderTrackingModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            order_info: '',  // 当前订单信息
            logiticsInfo: '', // 当前物流详情
        }
    }
    hideModal = () => {
        // console.log('1111111')
        // console.log(this.props)
        this.props.isShowModal('trackVisable', false)
    }
    // 获取物流信息以及子订单编号
    getIdAndLogiticsDetail = (record) => {
        console.log('order_id', record);
        this.setState({
            order_info: record
        })
        const param = {
            sub_order_id: record.son_order_id
        }
        api.axiosPost('getLogoticsDetail', param).then(res=>{
            console.log('物流详情', res);
            if(res.data.code === 1) {
                this.setState({
                    logiticsInfo: res.data.data
                })
            }else{
                this.setState({
                    logiticsInfo: []
                })
            }
        })
    }
    render() {
        const { display } = this.props;
        const { order_info,logiticsInfo } = this.state
        return (
            <Modal
                title="订单跟踪"
                visible={display}
                onCancel={this.hideModal}
                destroyOnClose
                maskClosable={false}
                centered
                className='logitics-modal-box'
                // footer={footer}
                bodyStyle={{ height: '550px', overflow: 'hidden' }}
                width={610}
            >
                <div>
                    <div className='order-base-info'>
                        <div className='img'>
                            <img src={order_info.type == '1' ? order_info.pic : Public.imgUrl(order_info.merchant_id, order_info.product_id)} alt="" />
                            <span>{order_info.count}件商品</span>
                        </div>
                        <div className='base-info'>
                            <div>
                                <span className='tit'>配送企业：</span>
                                <span className='text'>{order_info.courier_name}</span>
                            </div>
                            <div>
                                <span className='tit'>快递单号：</span>
                                <span className='text'>{order_info.courier_id}</span>
                            </div>
                        </div>
                    </div>
                    <div className='time-axis'>
                        {
                            logiticsInfo.length ? '' : <div className="log-null">暂无物流信息...</div>
                        }
                        <Timeline>
                            { 
                                logiticsInfo&&logiticsInfo.length&&logiticsInfo.map((item, index) => {
                                    return (
                                        <Timeline.Item  color='green' key={index}>
                                            <p className='dot-process'>
                                                {item.context}
                                            </p>
                                            <p className='dot-time'>
                                                {item.ftime}
                                            </p>
                                        </Timeline.Item>
                                    )
                                })
                            }
                        </Timeline>
                    </div>
                </div>
            </Modal>
        )
    }
}
export default OrderTrackingModal;