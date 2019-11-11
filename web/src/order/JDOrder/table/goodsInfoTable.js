
import React from "react";
import { Table } from "antd";
import {Link} from "react-router-dom";
import bind from "react-autobind";
import _ from 'lodash';
import OrderTrackingModal from './../modal/orderTrackingModal';

class InvoiceTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 商品信息的表头
            columns: [
                {
                    title: "商品图片",
                    dataIndex: 'pic',
                    align: 'center',
                    render: (text) => {
                        return <div className='thumbnail'><img src={text}/></div>
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
                        const url = '/platform/commodityDetails/';
                        return <Link to={{ pathname: `${url}${record.product_id}`, search:`?${record.merchant_id}` }}  className="link-detail"  target="_blank">{text}</Link>
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
            ],
            // 商品信息表格数据
            data: [],
            trackVisable: false,  //  订单跟踪的显示状态
        }
        bind(this)
    }
    // 控制弹窗的显示与隐藏
    isShowModal(type, isTrue){
        this.setState({
            [type]: isTrue
        })
    }
    componentWillReceiveProps(nextProps){
        
        if (_.isEqual(this.props, nextProps)) {
            return
        }else{
            //  console.log('商品信息',nextProps);
             const { data } = nextProps.order_goods;
             
             this.setState({
                 data: [{...data}]
             })
        }
        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
    }
    render() {
        const { columns, data } = this.state;
        return (
            <div className='tab-box'>
                <div className="merchant-nums">
                    商品信息
                    </div>
                <Table
                    dataSource={data}
                    columns={columns}
                    bordered
                    className='margin-bottom-10'
                    pagination={false}
                />
                <OrderTrackingModal display={this.state.trackVisable} isShowModal={this.isShowModal} />
            </div>
        )
    }
}

export default InvoiceTable;