import React from "react";
import { Input, Button, Select, Row, Col, Icon, Table } from "antd";
import api from './../../../../components/api';

const Option = Select.Option;

export default class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],  //  表格数据
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          align: 'center'
        },
        {
          title: '审批流名称',
          dataIndex: 'content',
          align: 'center'
        },
        {
          title: '所属项目',
          dataIndex: 'project',
          align: 'center'
        },
        {
          title: '是否审批',
          dataIndex: 'without_approval',
          align: 'center',
          render: (text, record) => {
              switch (text) {
                  case 1:
                      return '免审批'
                      break;
                  case 0 :
                      return '需要审批'
                      break;
                  default:
                      return '免审批'
                      break;
              }
          }
        },
        {
          title: '审批流程',
          dataIndex: 'step',
          align: 'center'
        },
        {
          title: '创建时间',
          dataIndex: 'create_time',
          align: 'center'
        },
      ],
      page_number: 1,        //  当前页码
      page_size: 10,         //  每页显示数量
      totalNum: 0,         //  审批流总数
      name: '',              //  审批项目名称
      without_approval: undefined, // 是否免审批
    }
  }
  // input ===> onChange
  handleInputOnchange = (type, val) => {
    this.setState({
      [type]: val
    })
  }
  // 是否免审批改变
  selectChange = (value) => {
    this.setState({
      without_approval: value
    })
  }
  // 子账户列表和搜索子账户列表展示
  getAndSearchApprovalList = (pageN, pageS, isOverall = true, isReset = false) => {
    if (isReset) {
      this.setState({
        name: '',
        without_approval: undefined,
      })
    }
    const { name, without_approval, page_number, page_size } = this.state;
    const data = {
      name: isOverall ? '' : name,
      page_number: pageN ? pageN : page_number,
      page_size: pageS ? pageS : page_size,
      without_approval: isOverall ? 100 : without_approval+1 ? without_approval : 100,
      company_id: this.props.company_id
    }
    // console.log('data', data);
    api.axiosPost('getApprovalList', data).then(res => {
      // console.log(res);
      if (res.data.code === 1) {
        const { page, result } = res.data.data;
        result.map((item, index) => {
          item.key = item.id
          item.index = index+1
        })
        this.setState({
          tableData: result,
          totalNum: page.totalRow,
          page_number: page.pageNumber,
          page_size: page.pageSize,
          isSearch: isOverall ? 0 : 1,
        })
      }
    })
  }
  // 切换分页
  pageOnChange = (page) => {
    const { isSearch } = this.state;
    this.setState({ page_number: page })
    if (isSearch == 0) {
      this.getAndSearchApprovalList(page, '');
    }
    if (isSearch == 1) {
      this.getAndSearchApprovalList(page, '', false);
    }
  }
  // 页码改变
  onShowSizeChange = (current, size) => {
    if (this.state.totalNum < size) return false;
    const { isSearch } = this.state;
    this.setState({ page_size: size })
    if (isSearch == 0) {
      this.getAndSearchApprovalList(current, size);
    }
    if (isSearch == 1) {
      this.getAndSearchApprovalList(current, size, false);
    }
  }
  componentDidMount(){
    this.getAndSearchApprovalList()
  }

  render() {
    const { columns, tableData, totalNum, page_number, page_size, without_approval, name } = this.state;
    // 分页配置
    const pagination = {
      total: totalNum,
      current: page_number,
      pageSize: page_size,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "30", "40"],
      onChange: this.pageOnChange,
      onShowSizeChange: this.onShowSizeChange
    };
    return (
      <div>
        <Row className="line-height-30 margin-bottom-30">
          <Col span={24} className='search-box line-height-30'>
            <div>
              <Input className="width-200 " value={name} placeholder="审批流名称/所属项目" onChange={(e)=>{this.handleInputOnchange('name',e.target.value)}}></Input>
            </div>
            <div>
              <Select className="width-200" placeholder="是否免审批" value={without_approval} onChange={this.selectChange}>
                <Option value={1}>需要审批</Option>
                <Option value={0}>免审批</Option>
              </Select>
            </div>
            <div className="btn-box">
              <Button type="primary" onClick={() => { this.getAndSearchApprovalList('','',false)} }>搜索</Button>
              <Button type="primary" onClick={() => { this.getAndSearchApprovalList('', '', true, true)} }>重置<Icon type="rollback" /></Button>
            </div>
          </Col>
        </Row>
        <div className="merchant-nums margin-bottom-10 clearfix">
          <Icon type="info-circle" className="iconColor" />&nbsp;审批流总数：<em>{totalNum }</em>个
        </div>
        <div className="tab-box">
          <Table
            dataSource={tableData}
            columns={columns}
            bordered
            pagination={pagination}
          />
        </div>
      </div>
    )
  }
}