import React from "react";
import { Table, Empty } from "antd";
import _ from 'lodash';

class OperationalInfoTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 费用信息表头信息
            columns: [
                {
                    title: "操作者",
                    dataIndex: 'actor',
                    align: 'center',
                    key: 'actor'
                },
                {
                    title: "操作时间",
                    dataIndex: 'create_time',
                    align: 'center',
                    key: 'create_time'
                },
                {
                    title: "订单状态",
                    dataIndex: 'xdr',
                    align: 'center',
                    key: 'xdr'
                },
                {
                    title: "付款状态",
                    dataIndex: 'zffs',
                    align: 'center',
                    key: 'zffs'
                },
                {
                    title: "发货状态",
                    dataIndex: 'ddly',
                    align: 'center',
                    key: 'ddly'
                },
                {
                    title: "备注",
                    dataIndex: 'remark',
                    align: 'center',
                    key: 'remark'
                }
            ],
            // 费用信息表格数据
            data: [],
        }
    }

    componentWillReceiveProps(nextProps){
        
        if (_.isEqual(this.props, nextProps)) {
            return
        }else{
            //  console.log('操作信息',nextProps);
             
             this.setState({
                 data: nextProps.log
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
                    操作信息
                </div>
                <Table
                    dataSource={data}
                    columns={columns}
                    bordered
                    pagination={false}
                    locale= {{emptyText:<Empty description='当前无操作信息' image={Empty.PRESENTED_IMAGE_SIMPLE} />}}
                />
            </div>
        )
    }
}

export default OperationalInfoTable;