
import React from "react";
import { Table, Popover } from "antd";
import {Link} from "react-router-dom";
import bind from "react-autobind";
import _ from 'lodash';
import Public from '../../../components/public';
import OrderTrackingModal from './../modal/orderTrackingModal';

class InvoiceTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 增值税专票表头信息
            columns: [
                {
                    title: "商品图片",
                    dataIndex: 'img',
                    align: 'center',
                    render: (text, record) => {
                        const img = record.type  ? record.pic : Public.imgUrl(record.merchant_id, record.product_id)
                        console.log('京东图片', img);
                        return <div className='thumbnail'><img src={img} /></div>
                    },
                    key: 'img'
                },
                {
                    title: "商品名称",
                    dataIndex: 'product_name',
                    align: 'center',
                    key: 'product_name',
                    render: (text, record) => {
                        // console.log('record----', record);
                        const url = record.type ? `/platform/commodityDetails/` : `/platform/ProductDetails/`
                        return <Link to={{ pathname: `${url}${record.product_id}`, search:`?${record.merchant_id}` }} className="link-detail"  target="_blank">{text}</Link>
                    }
                },
                {
                    title: "品牌/货号",
                    dataIndex: 'brand',
                    align: 'center',
                    key: 'brand'
                },
                {
                    title: "属性",
                    dataIndex: 'sku_value',
                    align: 'center',
                    key: 'sku_value'
                },
                {
                    title: "数量",
                    dataIndex: 'count',
                    align: 'center',
                    key: 'count'
                },
                {
                    title: "单价",
                    dataIndex: 'price',
                    align: 'center',
                    key: 'price'
                },
                {
                    title: "小计",
                    dataIndex: 'order_price',
                    align: 'center',
                    key: 'order_price'
                },
                {
                    title: "操作",
                    dataIndex: 'opr',
                    align: 'center',
                    width: 140,
                    render: (text, record) => {
                        return (
                            <div className='goodsInfo-opr'>
                                <p><Link to={{ pathname: `/order/subOrder/`, search:`?${record.son_order_id}` }}>查看详情</Link></p>
                                {
                                    // this.state.state === 0 ? '' : 
                                    this.state.state === 3 || this.state.state === 4 ? 
                                    <p><span className='blue' onClick={()=>{this.isShowModal('trackVisable', true, record)}}>订单跟踪</span></p>  : ''
                                }
                                
                            </div>
                        )
                    },
                    key: 'opr'
                },
            ],
            // 增值税发票表格数据
            data: [],             //   表格数据数组
            trackVisable: false,  //  订单跟踪的显示状态
            state: ''
        }
        bind(this)
    }
    // 订单追踪的内容
    renderContent = record => (
        <div>
            <p>物流单号：{record.courier_id ? record.courier_id : '暂无物流单号...' }</p>
            <p>物流名称：{record.courier_name ? record.courier_name : '暂无物流名称...' }</p>
        </div>
    )
    // 控制弹窗的显示与隐藏
    isShowModal(type, isTrue, record){
        this.setState({
            [type]: isTrue
        },()=>{
            if (isTrue) {
                this.logisticsModal.getIdAndLogiticsDetail(record)
            }
        })
    }
    componentWillReceiveProps(nextProps){
        
        if (_.isEqual(this.props, nextProps)) {
            return
        }else{
             console.log('商品信息',nextProps);
             const { data } = nextProps.order_goods
             let subOrderArr = []
             data && data.length && data.map( (item, index, arr) => {
                subOrderArr.push([item])
             })
             this.setState({
                 data: subOrderArr,
                 state: nextProps.order_state
             })
        }
        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
    }
    render() {
        const { columns, data } = this.state;
        let title = (code, merchant) => {
            return (
                <div className='goodsInfoTable-box'>
                    <span className='tit-code'>订单编号：<i>{code}</i></span>
                    <span className='tit-merchant'>{merchant}</span>
                </div>
            )
        }
        return (
            <div className='tab-box'>
                <div className="merchant-nums">
                    商品信息
                </div>
                {
                    data && data.map((item, index) => {
                        item[0].key = item[0].son_order_id
                        return (
                            <Table
                                dataSource={item}
                                columns={columns}
                                key={index}
                                bordered
                                className='margin-bottom-10 '
                                pagination={false}
                                title={(currentPage) => { return title(item[0].son_order_id, item[0].merchant_name) }}
                            />
                        )
                    })
                }
                
                <OrderTrackingModal display={this.state.trackVisable} isShowModal={this.isShowModal} ref={ref=>{this.logisticsModal = ref}}/>
            </div>
        )
    }
}

export default InvoiceTable;