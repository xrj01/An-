import React from 'react';
import { Modal, Table, Tabs } from 'antd';
import api from '../../../../components/api';
const { TabPane } = Tabs;

export default class AddressListModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      incrementTableData: [],
      incrementColumns: [
        {
          title: "序号",
          dataIndex: 'index',
          align: 'center',
        },
        {
          title: "企业名称",
          dataIndex: 'company',
          align: 'center',
        },
        {
          title: "注册电话",
          dataIndex: 'phone',
          align: 'center',
        },
        {
          title: "纳税人识别号",
          dataIndex: 'taxpayer_identification_code',
          align: 'center',
        },
        {
          title: "开户行",
          dataIndex: 'bank',
          align: 'center',
        },
        {
          title: "收票人",
          dataIndex: 'taker_name',
          align: 'center',
        },
        {
          title: "收票电话",
          dataIndex: 'taker_tel',
          align: 'center',
        },
        {
          title: "收票地址",
          dataIndex: 'taker_address',
          align: 'center',
        },
      ],
      accountID: '',        //   账户ID
      totalNum: 0,          //  总数据
      page_number: 1,       //  当前页
      page_size: 10,        //  当前页显示总数据
    }
  }
  hideModal = () => {
    this.setState({ activeKey: '1' })
    this.props.isShowModal('invoiceModalVisible', false)
  }
  // 获取id
  getId = (id) => {
    this.getInvoiceList(id)
    this.setState({
      accountID: id
    })
  }
  // 请求发票数据
  getInvoiceList = (id) => {
    const { page_number, page_size } = this.state;
    const data = {
      page_number: page_number,
      page_size,
      id
    }
    api.axiosPost('getSubAccountInvoice', data).then(res => {
      if (res.data.code === 1) {
        const { page, result } = res.data.data;
        result.map((item, index) => {
          item.key = index
          item.index = index + 1
        })
        this.setState({
          incrementTableData: result,
          totalNum: page.totalRow,
          page_number: page.pageNumber,
          page_size: page.pageSize,
        })
      }
    })
  }
  // 切换分页的操作
  pageOnChange = (page) => {
    this.setState({
      page_number: page
    }, () => {
      this.getInvoiceList(this.state.accountID)
    })
  }
  render() {
    const { display } = this.props;
    const { incrementTableData, incrementColumns, page_number, page_size, totalNum } = this.state;
    // 分页配置
    const pagination = {
      total: totalNum,
      current: page_number,
      pageSize: page_size,
      onChange: this.pageOnChange
    }
    return (
      <Modal
        title="发票列表"
        visible={display}
        onCancel={this.hideModal}
        footer={null}
        destroyOnClose
        maskClosable={false}
        centered
        width={1200}
      >
        <div>
          <Table
            dataSource={incrementTableData}
            columns={incrementColumns}
            bordered
            hideDefaultSelections={true}
            pagination={pagination}
          />
        </div>
      </Modal>
    )
  }
}