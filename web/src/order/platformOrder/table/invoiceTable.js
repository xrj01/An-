
import React from "react";
import { Table } from "antd";
import _ from 'lodash';

class InvoiceTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 增值税专票表头信息
            columns: [
                {
                    title: "发票类型",
                    dataIndex: 'invoice_type',
                    align: 'center',
                    render: (text ,record) => {
                        /* if(!text && text !=0) {
                            // console.log('text', text);
                            return '集中开票'
                        } else {

                        } */
                        switch (text) {
                            case 0:
                                return '普通发票'
                                break;
                            case 1:
                                return '增值税发票'
                                break;
                            case -1:
                                return '集中开票'
                                break;
                            default:
                                return '集中开票'
                        }
                        
                        
                    },
                    key: 'invoice_type'
                },
                {
                    title: "企业名称",
                    dataIndex: 'company',
                    align: 'center',
                    key: 'company'
                },
                {
                    title: "注册电话",
                    dataIndex: 'phone',
                    align: 'center',
                    key: 'phone'
                },
                {
                    title: "纳税人识别号",
                    dataIndex: 'taxpayer_identification_code',
                    align: 'center',
                    key: 'taxpayer_identification_code'
                },
                {
                    title: "开户银行",
                    dataIndex: 'bank',
                    align: 'center',
                    key: 'bank'
                },
                {
                    title: "收票人信息",
                    dataIndex: 'taker_name',
                    align: 'center',
                    key: 'taker_name'
                },
            ],
            // 增值税发票表格数据
            data: [],
            tableLoading: false,  //  表格是否在加载中
        }
    }

    componentWillReceiveProps(nextProps){
        
        if (_.isEqual(this.props, nextProps)) {
            return
        }else{
            //  console.log('发票信息',nextProps);
             this.setState({
                 data: nextProps.order_invoice
             })
        }
        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
    }


    render() {
        const { columns, data } = this.state;
        // 基础信息头部
        return (
            <div className='tab-box'>
                <div className="merchant-nums">
                    发票信息
                    </div>
                <Table
                    dataSource={data}
                    columns={columns}
                    bordered
                    pagination={false}
                />
            </div>
        )
    }
}

export default InvoiceTable;