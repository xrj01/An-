import React from "react";
import { Input, Row, Col, Icon, Modal, Form, Cascader, Select, message, Spin } from "antd";
import api from "../../components/api";
import publicFn from "../../components/public";
import './index.scss';

const { TextArea } = Input;
const { Option } = Select;
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
      confirmDirty: false,  // 密码确认
      roleSelect:[],
      departmentSelect:[],
      id:''
    }
  }
  
  
  // 第一次密码的验证
  validateToNextPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && this.state.confirmDirty) {
          form.validateFields(['confirmpwd'], { force: true });
      }
      callback();
  };
  // 确认密码的验证
  compareToFirstPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value !== form.getFieldValue('password')) {
          callback('两次密码不一致');
      } else {
          callback();
      }
  };
  // 确认密码失焦 判断两次密码是否一直
  handleConfirmBlur = e => {
      const value = e.target.value;
      this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }; 
  
  // 获取角色下拉数据
  roleSelect = () =>{
    const data = {}
    api.axiosPost('role_select',data).then((res)=>{
      this.setState({
        roleSelect : res.data.data
      })
    })
  }
  // 获取部门下拉数据
  departmentSelect = () =>{
    const data = {}
    api.axiosPost('department_select',data).then((res)=>{
      this.setState({
        departmentSelect : res.data.data
      })
    })
  }
  // 编辑回填
  editForm = (e) =>{
    console.log(222,e);
    this.setState({
      id:e.id
    })
    let obj = {
      userName : e.user_name,
      contactName : e.name,
      password : e.pass_word,
      confirmpwd : e.pass_word,
      contactPhone : e.phone,
      businessProfile : e.msg,
      selectRole : e.role_id,
      selectDepartment : e.department_id
    }
    
    this.props.form.setFieldsValue(obj)
  }
  // 新建、编辑 ---保存按钮
  handleOk = e =>{
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log(111,values);
      //console.log(this.props.singleRowData)
      if (!err) {
        if(this.props.singleRowData){
          // 编辑
          const editDate = {
            user_name : values.userName,
            name : values.contactName,
            pass_word : values.password,
            phone : values.contactPhone,
            role_id : values.selectRole,
            department_id : values.selectDepartment,
            msg : values.businessProfile?values.businessProfile:'',
            type:1,
            id: this.state.id
          }
          api.axiosPost('edit',editDate).then((res)=>{
              if(res.data.code ===1){
                  message.success(res.data.msg)
                  this.hideModal()
                  this.getList()
                  
              }else{
                  message.error(res.data.msg)
              }
          })
      }else{
          // 新建
          const addDate = {
            user_name : values.userName,
            name : values.contactName,
            pass_word : values.password,
            phone : values.contactPhone,
            role_id : values.selectRole,
            department_id : values.selectDepartment,
            msg : values.businessProfile?values.businessProfile:'',
          }
          api.axiosPost('add',addDate).then((res)=>{
              if(res.data.code ===1){
                  message.success(res.data.msg)
                  this.hideModal()
                  this.getList()
                  
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
    this.props.hideModal('visible', false);
  }
  //  刷新页面
  getList = () =>{
    this.props.getList()
  }

  
  componentDidMount() {
    this.roleSelect()
    this.departmentSelect()
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    //console.log(this.props.singleRowData);
    
    const { display,singleRowData } = this.props;
    // 动态加载下拉数据
    const {roleSelect,departmentSelect,} = this.state
   
    const { Option } = Select;
    const roleChildren = [];
    const departmentChildren = [];
    if(roleSelect){
      for (let i = 0; i < roleSelect.length; i++) {
        roleChildren.push(<Option key={i} value={roleSelect[i].id}>{roleSelect[i].name}</Option>);
      }
    }
    if(departmentSelect){
      for (let i = 0; i < departmentSelect.length; i++) {
        departmentChildren.push(<Option key={i} value={departmentSelect[i].id}>{departmentSelect[i].name}</Option>);
      }
    }
    
    return (
      <Modal
        title= {singleRowData ? "编辑用户" : "添加用户"}   
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
        <Form {...formItemLayout}>
          <Form.Item label="用户账户">
              {getFieldDecorator('userName', {
                rules: [
                  { required: true, message: '请输入用户账户' },
                  { pattern: /^[a-zA-Z]{3,20}$/, message: '请输入3-20位英文字符' }
                ],
              })(
                <Input placeholder="请输入用户账户" />,
              )}
          </Form.Item>
          <Form.Item label="手机号码">
            {getFieldDecorator('contactPhone', {
              rules: [
                { required: true, message: '请输入手机号码' },
                { pattern: /^1[345789]\d{9}$/, message: '手机号码格式不正确' }
              ],
            })(
              <Input placeholder="请输入手机号码" />,
            )}
          </Form.Item>
          
          <Form.Item label="所属部门" hasFeedback>
            {getFieldDecorator('selectDepartment', {
              rules: [{ required: true, message: '请选择所属部门!' }],
            })(
              <Select placeholder="请选择所属部门">
                {departmentChildren}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="用户角色" hasFeedback>
            {getFieldDecorator('selectRole', {
              rules: [{ required: true, message: '请选择用户角色!' }],
            })(
              <Select placeholder="请选择用户角色">
                {roleChildren}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="成员姓名">
            {getFieldDecorator('contactName', {
              rules: [
                { required: true, message: '请输入成员姓名' },
                { pattern:  /^[\u4E00-\u9FA5]{2,10}$/, message: '成员姓名仅支持中文，名称长度2-10位' },
              ],
            })(
              <Input placeholder="请输入成员姓名" />,
            )}
          </Form.Item>
          
          
            
          <Form.Item label="登录密码">
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: '请输入登录密码' },
                { message: '请填写6-32位数字和字母组成的密码' , pattern : /^([a-z0-9A-Z)]){6,32}$/i},
                { validator: this.validateToNextPassword },
              ]
            })(
              <Input placeholder="请输入登录密码" type='password' />,
            )}
          </Form.Item>
          <Form.Item label="确认密码">
            {getFieldDecorator('confirmpwd', {
              rules: [
                { required: true, message: '请再次输入登录密码' },
                /* { message: '请再次确认密码' }, */
                { validator: this.compareToFirstPassword },
              ]
            })(
              <Input
                type='password'
                placeholder="请输入确认密码" 
                onBlur={this.handleConfirmBlur}
              />
            )}
          </Form.Item>
          
          <Form.Item label="备注信息" wrapperCol={{ span: 18 }}>
            {getFieldDecorator('businessProfile', {
              rules: [
                { max:100,message: '备注信息最多可输入100字符'}
              ],
            })(
              <TextArea placeholder="请输入内容" rows={4} />,
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(MerchantsModal);