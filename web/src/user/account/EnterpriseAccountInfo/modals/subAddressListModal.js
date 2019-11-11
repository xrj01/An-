import React from 'react';
import { Modal, Table } from 'antd';
import api from '../../../../components/api';

export default class AddressListModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],   //  表格数据
      columns: [
        {
          title: "序号",
          dataIndex: 'index',
          align: 'center',
        },
        {
          title: "收货人",
          dataIndex: 'consignee',
          align: 'center',
        },
        {
          title: "联系方式",
          dataIndex: 'phone',
          align: 'center',
        },
        {
          title: "邮政编码",
          dataIndex: 'postal_code',
          align: 'center',
        },
        {
          title: "收货地址",
          dataIndex: 'address',
          align: 'center',
        },
        {
          title: "是否默认地址",
          dataIndex: 'state',
          align: 'center',
          render: (text) => {
            switch (text) {
              case 101:
                return '删除';
                break;
              case 0:
                return '默认';
                break;
              case 1:
                return '非默认';
                break;
            }
          }
        },
      ],
      tableLoading: false,  //  表格加载状态
      page_number: 1,       //  当前页
      page_size: 10,        //  每页显示数量
      totalNum: 0,          //  总数量
      accountID: '',        //  账户ID
    }
  }
  // 隐藏弹窗
  hideModal = () => {
    this.props.isShowModal('addressModalVisible', false)
  }
  // 获取父级ID
  getId = (id) => {
    this.getAddressList('', id)
    this.setState({
      accountID: id
    })
  }
  getAddressList = (pageN, id) => {
    const { page_number, page_size } = this.state;
    const data = { 
      page_number: pageN ? pageN : page_number, 
      page_size, id }
    api.axiosPost('getSubAccountAddrList', data).then(res => {
      // console.log(res)
      if (res.data.code === 1) {
        const { page, result } = res.data.data;
        result.map((item,index) => {
          item.key = index
          item.index = index + 1
        })
        this.setState({
          tableData: result,
          totalNum: page.totalRow,
          page_number: page.pageNumber,
          page_size: page.pageSize,
        })
      }
    })
  }
  // 切换分页的操作
  pageOnChange = (page) => {
    this.setState({ page_number: page })
    this.getAddressList(page, this.state.accountID)
  }
  render() {
    const { display } = this.props;
    const { page_number, page_size, totalNum } = this.state;
    const pagination = {
      total: totalNum,
      current: page_number,
      pageSize: page_size,
      onChange: this.pageOnChange
    }
    return (
      <Modal
        title="地址列表"
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
            hideDefaultSelections={true}
            pagination={pagination}
            // loading={this.state.tableLoading}
          />
        </div>
      </Modal>
    )
  }
}