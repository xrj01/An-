import React from 'react';
import {Table,Icon} from 'antd';
import api from '../../../../components/api';

export default class AddressListModal extends React.Component{
  constructor (props) {
    super(props);
    this.state ={ 
      tableData: [],   //  表格数据
      columns: [
        {
          title: "序号",
          dataIndex: 'index',
          align: 'center',
          width: 100
        },
        {
          title: "项目名称",
          dataIndex: 'project_name',
        },
        {
          title: "项目经理",
          dataIndex: 'project_manager',
          align: 'center',
        },
        {
          title: "创建时间",
          dataIndex: 'create_time',
          align: 'center',
        }
      ],
      page_number: 1,       //  当前页
      page_size: 10,        //  每页显示数量
      totalNum: 0,          //  总数量
      company_id: '',      //  公司ID
    }
  }
  componentDidMount() {
    const {company_id} = this.props;
    // console.log('company_id',company_id);
    this.setState({
      company_id: company_id
    })
    this.getProjectList('',company_id)
  }
  // 获取项目列表
  getProjectList = (pageN, company_id) => {
    const { page_number, page_size } = this.state;
    const data = { 
      page_number: pageN ? pageN : page_number, 
      page_size, company_id }
    api.axiosPost('getProjectList', data).then(res => {
      if (res.data.code === 1) {
        const { page, result } = res.data.data;
        result.map((item,index) => {
          item.key = index
          item.index = index+1
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
    this.getProjectList(page, this.state.company_id)
  }
  render(){
    const { columns,tableData,totalNum,page_number,page_size } = this.state;
    // 分页配置
    const pagination = {
      total: totalNum,
      current: page_number,
      pageSize: page_size,
      onChange: this.pageOnChange
    }
    return(
        <div>
          <div className="merchant-nums margin-bottom-10">
            <Icon type="info-circle" className="iconColor"/>&nbsp;项目总数：<em>{totalNum}</em>个
          </div>
          <Table
            dataSource={tableData}
            columns={columns}
            bordered
            pagination={pagination}
          />
        </div>
    )
  }
}