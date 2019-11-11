import React from "react";
import { Icon, Table } from "antd";
import _ from 'lodash';

class ConsigneeTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 费用信息表头信息
            columns: [
                {
                    title: "收货人",
                    dataIndex: 'consignee',
                    align: 'center',
                    key: 'consignee'
                },
                {
                    title: "手机号码",
                    dataIndex: 'phone',
                    align: 'center',
                    key: 'phone'
                },
                {
                    title: "邮政编码",
                    dataIndex: 'postal_code',
                    align: 'center',
                    key: 'postal_code'
                },
                {
                    title: "收货地址",
                    dataIndex: 'address',
                    align: 'center',
                    key: 'adress'
                }
            ],
            // 费用信息表格数据
            data: [],
            tableLoading: false,  //  表格是否在加载中
        }
    }

    componentWillReceiveProps(nextProps){
        
        if (_.isEqual(this.props, nextProps)) {
            return
        }else{
            //  console.log('收货人信息',nextProps);
             this.setState({
                 data: nextProps.order_address
             })
        }
        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
    }
    render() {
        const { data,columns } = this.state;
        // 基础信息头部
        return (
            <div className='tab-box'>
                <div className="merchant-nums">
                    收货人信息
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

export default ConsigneeTable;