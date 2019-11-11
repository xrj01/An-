import React, { Children } from 'react';
import { Button ,Pagination,Icon,Table,Divider,message,Modal,Input } from 'antd';
import MerchantModal from './MerchantModal';
import api from '../../../../components/api';

export default class CategoryManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],   //  表格数据
      columns: [
        {
          title: "编号",
          dataIndex: '',
          align: 'center',
          width: 150
        },
        {
          title: "分类名称",
          dataIndex: 'name',
        },
        {
          title: "分类显示",
          dataIndex: 'display',
          align: 'center',
          render:(text)=>{
            return(
              <div>
                {text?'显示':'隐藏'}
              </div>
            )
          }
        },
        {
          title: "商品数量",
          dataIndex: 'count',
          align: 'center',
          render:(text)=>{
            return(
              <span>
                {
                  text || text === 0 ? text :'-'
                }
              </span>
            )
          }
        },
        {
          title: "导航栏显示",
          dataIndex: 'is_index_menu',
          align: 'center',
          render:(text)=>{
            return(
              <div>
                {text?'显示':'隐藏'}
              </div>
            )
          }
        },
        {
          title: '排序',
          dataIndex: 'sort',
          align: 'center',
          render:(text,record,$index)=>{
              return(
                  <Input onBlur={(e)=>{this.classSort(record,e.target,$index)}} className='width-50' defaultValue={text}/>
                  // <div>{text}</div>
              )
          }
        },
        {
          title: "关联分类",
          dataIndex: 'className',
          align: 'center',
          render:(text)=>{
            
            return(
              <span>
                {
                  text ? text : '-'
                }
              </span>
            )
          }
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          render:(text,record,index)=>{
              return(
                  <div className='table-btn'>
                      {
                        record.id > 9999 ? '' : <span onClick={()=>{this.isShowModal('visible',true,'add',record)}}>新增下级</span> 
                      }
                      {
                        record.id > 9999 ? '' : <Divider type="vertical" />
                      }
                      <span onClick={()=>{this.isShowModal('visible',true,'edit',record,index)}}>编辑</span>
                      {/* <span onClick={()=>{this.deleteModal(record)}}>删除</span> */}
                  </div>
              )
          }
        }
      ],
      company_id: '',   // company_id  公司id
      fid: 1,           // 父级id
      visible: false,  // 控制弹出层的显示与隐藏
      status:'',
      singleRowData: {}, //  编辑弹窗单条数据
      one:0,
      two:0,
      three:0
    }
  }
  componentDidMount() {
    const { company_id } = this.props;
    
    
    this.setState({ company_id },()=>{
      
      this.getCategoryList();
      this.getCount()
    })

  }
  // 控制编辑弹窗显示与隐藏
  isShowModal = (type,isTrue,status,record,index) =>{
    console.log(record,111);
    
    this.setState({
        [type]:isTrue,
        status,
        singleRowData: record,
    },()=>{
        if(status === 'edit'){
            this.merchantModal.editForm(record)
            this.merchantModal.getParentName(record.id,this.state.company_id)
        }
    });
  }
  // 获取分类数量统计
  getCount = () =>{
    const { company_id } = this.state;
    const data = {
      company_id : company_id
    }
    api.axiosPost('get_buyer_class_product_count',data).then(res =>{
      if(res.data.code === 1){
        this.setState({
          one : res.data.data[0],
          two : res.data.data[1],
          three : res.data.data[2]
        })
      }
    })
  }
  // 获取采购企业类目列表
  getCategoryList  = () => {
    const { company_id, fid } = this.state;
    
    const data = {
      parent: fid,
      company_id: `${company_id}`
    }
    api.axiosPost('get_company_class_list', data).then(res => {
      // console.log(res)
      if (res.data.code === 1) {
        let data = res.data.data;
        data.map((item, index) => {
          item.key = item.id
          item.index = index + 1
          item.children = []
        })
        this.setState({
          tableData: data,
          
        })
      }
    })
  }
  // 查询子节点
  queryChildren = (expanded, record) => {
    
    if (expanded) {
      const { tableData, company_id } = this.state;
      const parent = record.id;
      api.axiosPost("get_company_class_list", { parent, company_id:`${company_id}` }).then((res) => {
        // console.log('res', res);
        if (res.data.code == 1) {
          const childrenData = res.data.data;
          
          childrenData.map((item,index) => {
            
            item.key = item.id
            if (item.id < 9999) {
              item.children = []

              this.setState({
                twoData:childrenData,
              })
            } else if(item.id > 9999){
              this.setState({
                threeData:childrenData,
              })
            }

            if (item.id > 9999 && childrenData[index].class_name_1){
              item.className = childrenData[index].class_name_1 +'/'+ childrenData[index].class_name_2 +'/'+ childrenData[index].class_name_3
            }else{
              item.className = ''
            }
          });
          record.children = childrenData;
        }
        this.setState({
          tableData: tableData,
        })
      })
    }
  }
  
  //分类排序
  classSort=(record,target,$index)=>{
    const reg = /^[+]{0,1}(\d+)$/;
    if(!reg.test(target.value)){
        target.focus()
        target.select()
        message.error('请输入正整数进行排序！')
        return
    }
    const ajaxData={
        id : record.id,
        sort : parseInt(target.value),
        company_id : this.state.company_id
    };
    if(target.value != record.sort){
        const { tableData } = this.state;
        api.axiosPost("set_company_class_sort",ajaxData).then((res)=>{
            if(res.data.code == 1){
                message.success(res.data.msg);
                /* this.getCategoryList(); */
                record.sort = target.value
                if(record.id<10000 && record.id>99){
                  this.bubbleSort(this.state.twoData)
                }else if(record.id>9999){
                  this.bubbleSort(this.state.threeData)
                }else{
                  this.bubbleSort(this.state.tableData)
                }
                
            }
            this.setState({
              tableData
            })
        })
    }
  }
  // 前端排序
  /* var exampleArr = [4,3,8,6]; */
  bubbleSort = (arr) =>{
      for(var i=0;i<arr.length-1;i++){//循环的趟数
          for(var j=0;j<arr.length-i-1;j++){//循环的次数arr.length-i将已经排好的数去掉
              if(arr[j].sort>arr[j+1].sort){
                  var temp = arr[j];//设置一个临时变量
                  arr[j]=arr[j+1];
                  arr[j+1]=temp;
              }
          }
      }
      return arr;
  }

  render() {
    const { columns, tableData, one,two,three } = this.state;
    // 编辑弹框的props
    const modalObj = {
      display: this.state.visible,
      company_id : this.state.company_id,
      hideModal: this.isShowModal,
      status: this.state.status,
      getList : this.getCategoryList,
      getCount : this.getCount,
      singleRowData : this.state.singleRowData
  }
    return (
      <div>
        <div className="merchant-nums margin-bottom-10 categoryManage">
          <div>
            <Icon type="info-circle" className="iconColor" />&emsp;一级分类：<em>{one}</em> 个，二级分类：<em>{two}</em> 个，三级分类：<em>{three}</em> 个
          </div>
          <div>
            <Button type="primary" onClick={()=>{this.isShowModal('visible',true,'addBtn')}}>新增一级类目</Button>
          </div>
        </div>
        <Table
          className='department-table-box'
          dataSource={tableData}
          columns={columns}
          bordered
          pagination={false}
          // indentSize = {25}
          onExpand={(expanded, record) => { this.queryChildren(expanded, record) }}
        />
        <MerchantModal {...modalObj} wrappedComponentRef={(e)=>{this.merchantModal = e}}/>
      </div>
    )
  }
}