import React from 'react';
import { Modal, Table, Input } from 'antd';
import './modal.scss';

export default class ReviseCostModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [{ id: 1,ddzje: '￥200' }],   //  表格数据
            columns: [
                {
                    title: "商品合计",
                    dataIndex: 'sphj',
                    align: 'center',
                },
                {
                    title: "运费",
                    dataIndex: 'yf',
                    align: 'center',
                    width: 150,
                    render: (text, record) => {
                        return (
                            <div>
                                <Input addonBefore={'￥'} defaultValue="1.25" />
                            </div>
                        )
                    }
                },
                {
                    title: "订单总金额",
                    dataIndex: 'ddzje',
                    align: 'center',
                    className: 'red'
                },
                {
                    title: "应付款金额",
                    dataIndex: 'yfkje',
                    align: 'center',
                    className: 'red'
                }
            ],
            tableLoading: false,  //  表格加载状态
        }
    }
    hideModal = () => {
        this.props.isShowModal('reviseCostShow', false)
    }
    render() {
        const { display } = this.props;
        return (
            <Modal
                title="修改费用信息"
                visible={display}
                onCancel={this.hideModal}
                footer={null}
                destroyOnClose
                maskClosable={false}
                centered
                width={900}
            >
                <div>
                    <Table
                        dataSource={this.state.tableData}
                        columns={this.state.columns}
                        bordered
                    />
                </div>
            </Modal>
        )
    }
}