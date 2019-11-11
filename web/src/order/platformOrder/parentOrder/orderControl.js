import React from 'react';
import { Button, Icon } from 'antd';
import bind from "react-autobind";
import { createHashHistory } from 'history'
import ReviseOrderModal from './modal/reviseOrderModal';
import ReviseConsigneeModal from './modal/reviseConsigneeModal';
import ReviseCostModal from './modal/reviseCostModal';
import CloseOrderModal from './modal/closeOrderModal';
import RemarkOrderModal from './modal/remarkOrderModal';
const history = createHashHistory();

export default class OrderControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reviseOrderShow: false, // 修改发票信息弹窗的显示与隐藏
            reviseConsigneeShow: false, // 修改收货人信息弹窗的显示与隐藏
            reviseCostShow: false, //  修改费用信息弹窗的显示与隐藏
            closeOrderShow: false, //  关闭订单弹窗的显示与隐藏
            remarkOrderShow: false, //  备注订单弹窗的显示与隐藏

            state: '',    //  当前状态
            id: '',       //  id
        }
        bind(this)
    }
    // 控制弹窗的显示与隐藏
    isShowModal(type, isTrue) {
        this.setState({
            [type]: isTrue
        }, () => {
            if (isTrue && type === 'reviseOrderShow') {
                this.reviseOrderModal.handelInvoice(this.state.id)
            } else if (isTrue && type === 'reviseConsigneeShow') {
                this.reviseConsigneeModal.handelConsignee(this.state.id)
            } else if (isTrue && type === 'closeOrderShow') {
                this.closeOrderModal.handelClose(this.state.id)
            } else if (isTrue && type === 'remarkOrderShow') {
                this.remarkOrderModal.handelRemark(this.state.id)
            }
        })
    }
    reviseGoods() {
        history.push({ pathname: '/order/reviseGoodInfo', search:`?${this.state.id}` })
    }
    // 获取状态和ID
    getStateAndId(id, state) {
        // console.log('id', id, 'state', state);
        this.setState({
            state,
            id
        })
    }
    render() {
        const { state, id } = this.state;
        const commonObj = {
            isShowModal: this.isShowModal,
            getLowerCompData: this.props.getLowerCompData,
            parent_id: id
        }
        const currentState = () => {
            switch (this.state.state) {
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
            <div className='control-box'>
                <div className='current-status'>
                    <Icon type="info-circle" className="iconColor" />&nbsp;
                    当前订单状态：<em>{currentState()}</em>
                </div>
                {
                    state === -3 || state === -2 || state === -1 || state === 4 ?
                        '' :
                        <div className='control-btn-box'>
                            {
                                state === 0 || state === 1 || state === 2 ?
                                    <div className="outbox">
                                        <Button onClick={() => { this.isShowModal('reviseOrderShow', true) }}>修改发票信息</Button>
                                        {
                                            state === 3 ? '' : 
                                            <div className="outbox">
                                                <Button onClick={() => { this.isShowModal('reviseConsigneeShow', true) }}>修改收货人信息</Button>
                                                {
                                                    state !== 0 ? '' : <Button onClick={this.reviseGoods}>修改商品信息</Button>
                                                }

                                                {/* <Button onClick={()=>{this.isShowModal('reviseCostShow',true)}}>修改费用信息</Button> */}
                                                <Button onClick={() => { this.isShowModal('closeOrderShow', true) }}>关闭订单</Button>
                                                <Button onClick={() => { this.isShowModal('remarkOrderShow', true) }}>备注订单</Button>
                                            </div>
                                        }

                                    </div> : ''
                            }


                        </div>

                }

                <ReviseOrderModal {...commonObj} display={this.state.reviseOrderShow} wrappedComponentRef={(ref) => { this.reviseOrderModal = ref }} />
                <ReviseConsigneeModal {...commonObj} display={this.state.reviseConsigneeShow} wrappedComponentRef={(ref) => { this.reviseConsigneeModal = ref }} />
                {/* <ReviseCostModal {...commonObj} display={this.state.reviseCostShow} /> */}
                <CloseOrderModal {...commonObj} display={this.state.closeOrderShow} wrappedComponentRef={(ref) => { this.closeOrderModal = ref }} />
                <RemarkOrderModal {...commonObj} display={this.state.remarkOrderShow} wrappedComponentRef={(ref) => { this.remarkOrderModal = ref }} />
            </div>
        )
    }
}