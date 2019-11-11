import React, { Children } from 'react';
import { Table, Icon } from 'antd';
import api from '../../../../components/api';

export default class AddressListModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],   //  表格数据
      columns: [
        {
          title: "部门id",
          dataIndex: 'id',
          align: 'center',
          width: 150
        },
        {
          title: "部门名称",
          dataIndex: 'department',
        },
        {
          title: "部门成员",
          dataIndex: 'member_count',
          align: 'center',
        },
        {
          title: "创建时间",
          dataIndex: 'create_time',
          align: 'center'
        }
      ],
      company_id: '',   // company_id  公司id
      fid: 0,           // 父级id
      count: 0          // 部门总数
    }
  }
  // 获取顶级部门
  getTopLevelDepart = (companyid) => {
    const { company_id, fid } = this.state;
    const data = {
      fid: fid,
      company_id: companyid ? companyid : company_id
    }
    api.axiosPost('departmentList', data).then(res => {
      // console.log(res)
      if (res.data.code === 1) {
        const { count, list } = res.data.data;
        list.map((item, index) => {
          item.key = item.id
          item.index = index + 1
          item.children = []
        })
        this.setState({
          tableData: list,
          count: count
        })
      }
    })
  }
  // 查询子节点
  queryChildren = (expanded, record) => {
    if (expanded) {
      const { tableData, company_id } = this.state;
      const fid = record.id;
      api.axiosPost("departmentList", { fid, company_id }).then((res) => {
        // console.log('res', res);
        if (res.data.code == 1) {
          const childrenData = res.data.data.list;
          childrenData.map((item) => {
            item.key = item.id;
            if (item.level < 5) {
              item.children = []
            }
          });
          record.children = childrenData;
          
          this.setState({
            tableData: tableData
          })
        }
      })
    }
  }
  componentDidMount() {
    // console.log(this.props.company_id)
    const { company_id } = this.props;
    this.setState({ company_id })
    this.getTopLevelDepart(company_id);

  }
  render() {
    const { columns, tableData, count } = this.state;
    return (
      <div>
        <div className="merchant-nums margin-bottom-10">
          <Icon type="info-circle" className="iconColor" />&nbsp;部门总数：<em>{count}</em> 个
          </div>
        <Table
          className='department-table-box'
          dataSource={tableData}
          columns={columns}
          bordered
          // indentSize = {25}
          onExpand={(expanded, record) => { this.queryChildren(expanded, record) }}
        />
      </div>
    )
  }
}