import React from "react";
import { Input, Row, Col, Icon, Modal, Form, Cascader, Select, message, Spin } from "antd";
import api from "../../components/api";

import './index.scss';

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
      id : ''
    }
  }
  componentDidMount(){

  }
  // 新建、编辑 ---保存按钮
  handleOk = e =>{
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log(111,values);
      if (!err) {
        if(this.props.singleRowData){
          // 编辑
          const editDate = {
              name : values.name,
              info : values.info ? values.info : '',
              id : this.state.id,
              type : 1
          }
          api.axiosPost('role_edit',editDate).then((res)=>{
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
              name : values.name,
              info : values.info ? values.info : '',
          }
          api.axiosPost('role_add',addDate).then((res)=>{
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
    this.setState({ fileList: [] })
  }
  //  刷新页面
  getList = () =>{
    this.props.getList()
  }
  // 编辑回填
  editForm = (e) =>{
    
    this.setState({
      id:e.id
    })
    let obj = {
      name : e.name,
      info : e.info,
    }
    
    this.props.form.setFieldsValue(obj)
  }
  
  

  render() {
    const { getFieldDecorator } = this.props.form;
    
    const { display,singleRowData } = this.props;
    // 动态加载下拉数据
    
    return (
      <Modal
        title={singleRowData ?"编辑角色" : "添加角色"}
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
          <Form.Item label="角色名称">
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: '请输入角色名称' },
                  { min:3,max:10,message: '角色名称长度范围3-10字符'}
                ],
              })(
                <Input placeholder="请输入角色名称" />,
              )}
          </Form.Item>
          <Form.Item label="角色描述" wrapperCol={{ span: 18 }}>
            {getFieldDecorator('info', {
              rules: [
                { max:100,message: '角色描述最多可输入100字符'}
              ],
            })(
              <TextArea placeholder="请输入描述，最多100字！" rows={4} />,
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(MerchantsModal);