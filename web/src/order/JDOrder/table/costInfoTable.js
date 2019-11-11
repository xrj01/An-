import React from "react";
import { Icon, Table } from "antd";
import _ from 'lodash';

class CostInfoTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 费用信息表头信息
            columns: [
                {
                    title: "商品合计",
                    dataIndex: 'goods_total',
                    align: 'center',
                    key: 'goods_total'
                },
                {
                    title: "运费",
                    dataIndex: 'freight_total',
                    align: 'center',
                    key: 'freight_total'
                },
                {
                    title: "订单总金额",
                    dataIndex: 'total',
                    align: 'center',
                    key: 'total'
                },
                {
                    title: "应付款金额",
                    dataIndex: 'totaler',
                    align: 'center',
                    key: 'totaler',
                    render: (text, record) => {
                        return record.total
                    }
                }
            ],
            // 费用信息表格数据
            data: [ ],
            tableLoading: false,  //  表格是否在加载中
        }
    }

    componentWillReceiveProps(nextProps){
        
        if (_.isEqual(this.props, nextProps)) {
            return
        }else{
            //  console.log('费用信息',nextProps);
             
             this.setState({
                 data: nextProps.cost_info
             })
        }
        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
    }

    render() {
        const { data,columns } = this.state;
        return (
            <div className='tab-box'>
                <div className="merchant-nums">
                    费用信息
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

export default CostInfoTable;