import React from "react";
import { Input, Row, Col, Icon, Modal, Form, Cascader, Select, message, Radio } from "antd";
import api from '../../../../components/api';



const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

class MerchantsModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cascaderValue: [],      // 级联选择器的value
      classOption: [],     //   分类数据
      level:1,
      id : ''
    }
  }
  componentDidMount(){
    this.getCate(0)
  }
  // 分类下拉
  getCate = (id, tar) => {
    const cateId = {
        id: id
    }
    // 获取分类下拉
    api.axiosPost('get_product_class_for_dict', cateId).then((res) => {
        // id === 0 请求第一级
        if (id == 0 && res.data.code === 1) {
            const { data } = res.data;
            data.map((item)=>{
              item.isLeaf = false
            })
            if (res.data.code === 1) {
                this.setState({
                    classOption: data
                })
            }
        } else if (id && id > 0) {    //  id>0  请求子集
            const { data } = res.data;
            
            if (res.data.code === 1) {
                tar.loading = false;
                if(id<10000){
                  tar.children = [];
                }
                
                data.map((item) => {
                  if(id<100){
                    item.isLeaf = false
                  }else{
                    item.isLeaf = true
                  }
                  
                  tar.children.push(item)
                })
                this.setState({
                    classOption: [...this.state.classOption]
                })
            }
        }
    })
  }
  // 分类三级联动的onchange事件
  cataOnChange = (value,option) => {
      
      var optionArr = []
      option && option.map((item,index)=>{
        optionArr.push(item.name)
      })
      
      let optionName = optionArr.join('/')
      console.log(1111,optionName);
       
      const lastValue = value != '' ? value[value.length - 1].toString() : '';
      this.setState({
          class_id: lastValue,
          cascaderValue: value,
          optionName,
          class_name_1 : optionArr.length>0 ? optionArr[0] :'',
          class_name_2 : optionArr.length>0 ? optionArr[1] :'',
          class_name_3 : optionArr.length>0 ? optionArr[2] :'',

          arr:[]
      })
  }
  // 动态加载分类数据
  loadData = (selectedOptions) => {
      //console.log(55555,selectedOptions);
    
      const targetOption = selectedOptions[selectedOptions.length - 1];
      const id = targetOption.id;
      targetOption.loading = true;
      this.getCate(id, targetOption)
  }
  // 新建、编辑 ---保存按钮
  handleOk = e =>{
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      /* console.log(111,values);
      console.log(this.props.singleRowData); */
            
      if (!err) {
        if(this.props.singleRowData){
          if(values.residence && values.residence.length<3 && values.residence.length !=0){
            message.error('请选择三级分类')
            return
          }
          
          if(this.props.status === 'add'){
            // 新增下级请求
            
            const addDate = {
              level : this.props.singleRowData.id < 100 ? 2 : 3,
              class_id : values.residence && values.residence.length > 0 ? values.residence[2] : 0,
              company_id : this.props.company_id,
              parent : this.props.singleRowData.id,
              type : 0,
              is_index_menu : values.group,
              display : values.radio,
              name : values.name
            }
            api.axiosPost('_class_save',addDate).then((res)=>{
                if(res.data.code ===1){
                    message.success(res.data.msg)

                    this.addSubFn(res.data.data)
                    this.getCount()
                    this.hideModal()
                }else{
                    message.error(res.data.msg)
                }
                
            })
          }else if(this.props.status === 'edit'){
            // 编辑请求
            const {singleRowData} = this.props
            const {optionName} = this.state
            
            const editDate = {
              level : singleRowData.id < 100 ? 1 : (singleRowData.id < 10000 && singleRowData.id > 99) ? 2 : 3,
              class_id : values.residence && values.residence.length !=0 ? +values.residence[2] : optionName == singleRowData.className ? +singleRowData.id : 0,
              company_id : this.props.company_id,
              id : singleRowData.id,
              parent : 0,
              type : 1,
              is_index_menu : values.group,
              display : values.radio,
              name : values.name
            }
            
            api.axiosPost('_class_save',editDate).then((res)=>{
              if(res.data.code ===1){
                  message.success(res.data.msg)

                  if(editDate.level ===1){
                    this.getList()
                  }else{
                    this.editList(values,res.data.data)
                    
                  }
                  this.hideModal()
              }else{
                  message.error(res.data.msg)
              }
              
            })
          }

      }else{
          // 新建一级请求
          const addDate = {
              level : this.state.level,
              class_id : 0,
              company_id : this.props.company_id,
              parent : 1,
              type : 0,
              is_index_menu : values.group,
              display : values.radio,
              name : values.name
          }
          api.axiosPost('_class_save',addDate).then((res)=>{
              if(res.data.code ===1){
                  message.success(res.data.msg)
                  this.hideModal()
                  this.getList()
                  this.getCount()
              }else{
                  message.error(res.data.msg)
              }
              
          })
        }
          
      }
    })
}
  //  隐藏弹框
  hideModal = () => {
    if(this.state.cascaderValue){
      this.setState({
        arr:undefined
      },()=>{
        this.props.hideModal('visible', false);
      })
    }
    
  }
  //  刷新页面
  getList = () =>{
    this.props.getList()
  }
  // 刷新统计数量
  getCount = () =>{
    this.props.getCount()
  }

  // 编辑回填
  editForm = (record) =>{
    //console.log(999,record);
    
    this.setState({
      id:record.id
    })
    let obj = {
      name : record.name,
      radio : record.display ? '1' : '0',
      group : record.is_index_menu ? '1' : '0',
      residence : record.class_id_1 && record.class_name_1 ? [`${record.class_id_1}`,`${record.class_id_2}`,`${record.class_id_3}`] : ''
    }
    this.props.form.setFieldsValue(obj)
  }

  // 获取上级分类
  getParentName = (id,company_id) =>{
    const data = {
      id : id,
      company_id : company_id
    }
    api.axiosPost('get_buyer_class_parent_name',data).then((res)=>{
      if(res.data.code === 1){
        this.setState({
          parent_name : res.data.data.parent_name
        })
      }
    })
  }
  // 新增下级 -- 前端更新
  addSubFn(list){
    const {singleRowData} = this.props;
    
    if(list.id < 9999){
        list.children = []
        list.key = list.id
        list.sort = 0
    }else{
        list.key = list.id
        list.sort = 0
        list.className = list.class_name_1 ? list.class_name_1 +'/'+ list.class_name_2 +'/'+ list.class_name_3 : ''
    }
    this.setState({
      optionName:undefined,
      
    }) 
    singleRowData.children.unshift(list)
    
  }

  // 编辑 -- 前端更新
  editList(list,data){
    const {singleRowData} = this.props;
    //console.log(222,data);
    let {optionName,class_name_1,class_name_2,class_name_3} = this.state
    //console.log(3333,optionName);
    singleRowData.name = list.name
    singleRowData.display = list.radio == '1' ? true : false
    singleRowData.is_index_menu = list.group == '1' ? true : false
    singleRowData.className = optionName || optionName ==='' ? optionName : singleRowData.className 
    singleRowData.class_name_1  = class_name_1 || class_name_1 === '' ? class_name_1 : singleRowData.class_name_1
    singleRowData.class_name_2  = class_name_2 || class_name_2 === '' ? class_name_2 : singleRowData.class_name_2
    singleRowData.class_name_3  = class_name_3 || class_name_3 === '' ? class_name_3 : singleRowData.class_name_3
    singleRowData.class_id_1 = list.residence && list.residence[0]
    singleRowData.class_id_2 = list.residence && list.residence[1]
    singleRowData.class_id_3 = list.residence && list.residence[2]
    singleRowData.count = data
    /* if(!optionName){
      singleRowData.count = ''
    } */
    this.setState({
      optionName:undefined,
      
    }) 
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    
    const { display,singleRowData,status } = this.props;
    
    const { arr,parent_name } = this.state
    //级联
    const fieldNames = { label: 'name', value: 'id', children: 'children' };
    // cascader回填旧的省市区
    if(singleRowData && singleRowData.class_id_3){
      console.log('singleRowData',singleRowData);
      
      var addressName = [singleRowData.class_name_1,singleRowData.class_name_2,singleRowData.class_name_3]
    }else{
      addressName = []
    }
    
    let displayRender = (labels, selectedOptions) => {
      if(status === 'edit'){
           
        if (labels.length == 0 && addressName.length && !arr  && singleRowData.class_name_1) {
          
          let defaults = addressName && addressName.length && addressName.map((item, index) => {
              
              if (index === addressName.length - 1) {
                  return <span key={index} style={{ background: '#fff' }}>{item}</span>;
              }
              return <span key={index} style={{ background: '#fff' }}>{item} / </span>;
          })
          return defaults;
        }
        let news = labels.map((label, i) => {
            
            const option = selectedOptions[i];
            if (i === labels.length - 1) {
                return <span key={option.id} style={{ background: '#fff' }}>{label}</span>;
            }
            return <span key={option.id}>{label} / </span>;
        });
        return news
      }else{
        
        let news = labels.map((label, i) => {
            
          const option = selectedOptions[i];
          if (i === labels.length - 1) {
              return <span key={option.id} style={{ background: '#fff' }}>{label}</span>;
          }
          return <span key={option.id}>{label} / </span>;
          });
        return news
      }
      
    }
    
    return (
      <Modal
        title={status == 'addBtn' ? '新增一级分类' : status == 'add' ? '新增下级' : status == 'edit' ? '编辑分类' : ''}
        visible={display}
        onOk={this.handleOk}
        onCancel={this.hideModal}
        okText="保存"
        cancelText="取消"
        maskClosable={false}
        destroyOnClose
        centered
        className='department-addform'
        width={560}
        afterClose={() => this.props.form.resetFields()}
      >
        <Form {...formItemLayout} className='category-form'>
          <Form.Item label="分类名称">
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: '请输入分类名称' },
                  { max:10,message: '分类名称最长10个字符'}
                ],
              })(
                <Input placeholder="请输入分类名称" />,
              )}
          </Form.Item>
          {
            status == 'addBtn' || (status == 'edit' && singleRowData.id<100) ? '' :
            <Form.Item label="上级分类" className='Radio categoryParent'>
              {getFieldDecorator('superior')(
                <span>
                  {
                    status === 'edit' ? parent_name : singleRowData && singleRowData.name
                  }
                </span>
              )}
            </Form.Item>
          }
          
           
          <Form.Item label="分类显示" className='Radio'>
            {getFieldDecorator('radio',{
              initialValue:'1'
            })(
              <Radio.Group>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
            )}
          </Form.Item>
          <Form.Item label="导航栏显示" className='Radio'>
            {getFieldDecorator('group',{
              initialValue:'1'
            })(
              <Radio.Group>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
            )}
          </Form.Item>
          {
            (status == 'add' && singleRowData.id>99) || (singleRowData && singleRowData.id>9999) ?
            <Form.Item label="关联分类">
            {getFieldDecorator('residence', {
              /* rules: [
                { type: 'array', required: true, message: '请选择所在区域' }
              ], */
            })(<Cascader 
                // value={this.state.cascaderValue}
                options={this.state.classOption}
                fieldNames={fieldNames}
                loadData={this.loadData}
                changeOnSelect

                onChange={this.cataOnChange}
                displayRender={(labels, selectedOptions) => { return displayRender(labels, selectedOptions) }}
                placeholder='请选择关联分类'
              />)}
            </Form.Item>
            :''
          }
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(MerchantsModal);