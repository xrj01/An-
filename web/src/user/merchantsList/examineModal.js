import React from 'react';
import { Input, Row, Col, Icon, Modal, Form, Cascader, Upload, message, Button, Radio } from "antd";
import api from "./../../components/api";

class ExamineModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 1,   //  通过和驳回
      id: '',
      reason: '',
      display: 'none',
      phone: ''
    }
  }

  //  隐藏弹框
  hideModal = () => {
    this.props.hideModal('examineVisable', false);
  }
  // input ===> onChange
  handleInputOnchange = (type, val) => {
    this.setState({
      [type]: val
    })
  }
  // 更新表格
  updateTables = () => {
    if (this.props.isSearch == 1) {
      this.props.handelSearch()
    } else {
      this.props.merchantList()
    }
  }
  // 审核
  GOExamine = () => {
    const { value, reason, id, phone } = this.state;
    const data = {
      id: id,
      state: value,
      phone: phone.toString()
    }
    if (value == -1) {
      if (reason != '') {
        data.reason = reason;
      } else {
        message.error('请输入驳回原因');
        return;
      }
    }
    api.axiosPost("businessExamine", data).then(res => {
      if (res.data.code == 1) {
        message.success(res.data.msg);
        this.updateTables()
        this.hideModal()
      } else {
        message.error(res.data.msg)
      }
    })

  }
  onStatusChange = e => {
    // console.log('radio checked', e.target.value);
    if (e.target.value === -1) {
      this.setState({
        display: 'inline'
      });
    } else {
      this.setState({
        display: 'none'
      });
    }
    this.setState({
      value: e.target.value,
    });
  };

  handelParents = (record) => {
    console.log(record)
    if (record) {
      this.setState({
        id: record.id,
        phone: record.phone
      })
    }
  }
  render() {
    const title = (
      <div style={{ textAlign: "center", fontWeight: 'bold', fontSize: '18px' }}>
        供应商审核
      </div>
    )
    const footer = (
      <div style={{ textAlign: "center" }}>
        <Button onClick={this.hideModal}>取消</Button >
        <Button type="primary" onClick={this.GOExamine}>确定</Button >
      </div>
    )
    return (
      <Modal
        title={title}
        footer={footer}
        visible={this.props.display}
        // onOk={this.saveEdit}
        onCancel={this.hideModal}
        okText="确定"
        cancelText="取消"
        maskClosable={false}
        destroyOnClose
      >
        <Row className="margin-bottom-10">
          <Col span={24}>
            <Radio.Group onChange={this.onStatusChange} value={this.state.value}>
              <Radio value={1}>通过</Radio>
              <Radio value={-1}>驳回</Radio>
            </Radio.Group>
          </Col>
        </Row>
        <Row style={{ display: this.state.display }}>
          <Col span={24}>
            <div><span style={{ color: '#FF0033' }}>*&nbsp;</span>请输入驳回原因<span>（必选）</span></div>
            <Input.TextArea 
              rows={4} 
              style={{zIndex:'100'}}
              onChange={(e) => { this.handleInputOnchange('reason', e.target.value) }} 
              />
          </Col>
        </Row>
      </Modal>
    )
  }
}

export default ExamineModal;