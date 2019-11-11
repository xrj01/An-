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

class templateModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id : '',
      cascaderValue: [],      // 级联选择器的value
      classOption: [],     //   分类数据
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
    api.axiosPost('getCate', cateId).then((res) => {
        // id === 0 请求第一级
        if (id == 0) {
            const { data } = res.data;
            if (res.data.code === 1) {
                this.setState({
                    classOption: data
                })
            }
        } else if (id && id > 0) {    //  id>0  请求子集
            const { data } = res.data;
            if (res.data.code === 1) {
                tar.loading = false;
                tar.children = [];
                data.map((item) => {
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
cataOnChange = (value) => {
    // console.log(value)
    const lastValue = value != '' ? value[value.length - 1].toString() : '';
    this.setState({
        class_id: lastValue,
        cascaderValue: value
    })
}
// 动态加载分类数据
loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const id = targetOption.id;
    targetOption.loading = true;
    this.getCate(id, targetOption)
}
  // 新建、编辑 ---保存按钮
  handleOk = e =>{
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
          if(values.residence.length<3){
            message.error('请选择三级分类！')
          }else{
            const {singleRowData} = this.props
            const date = {
              product_id : singleRowData.product_id,
              type : 1,
              class_id : values.residence[2],
              residence:'',
              content:'',
              article_number:'',
              brand:'',
              sku:'',
              title:''
            }
            api.axiosPost('set_product_template',date).then((res)=>{
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
    this.props.getList('','',true)
  }
  render() {
    const {areaOptions} = this.state
    const { getFieldDecorator } = this.props.form;
    
    const { display,singleRowData } = this.props;
    
    //级联
    const fieldNames = { label: 'name', value: 'id', children: 'children' };
    return (
      <Modal
        title= '设为模板'
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
          <Form.Item label="关联分类">
          {getFieldDecorator('residence', {
            initialValue: areaOptions,
            rules: [
              {
                required: true,
                message: '请选择关联分类!',
              },
            ],
          })(<Cascader 
              value={this.state.cascaderValue}
              options={this.state.classOption}
              fieldNames={fieldNames}
              loadData={this.loadData}
              changeOnSelect
              onChange={this.cataOnChange}
              placeholder='请选择关联分类'
            />)}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(templateModal);