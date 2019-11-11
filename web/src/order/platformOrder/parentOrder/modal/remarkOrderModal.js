import React from 'react';
import { Modal, Input, Form, message } from 'antd';
import api from '../../../../components/api';

const { Item } = Form;

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

class CloseOrderModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parent_id: '',   // 父订单的id
        }
    }
    hideModal = () => {
        this.props.isShowModal('remarkOrderShow', false)
    }
    // 更新数据
    updateData = (data) => {
        // console.log('回填的数据', data);
        this.props.getLowerCompData('remark', '', data)
    }
    // 备注订单保存
    saveEdit = (e) => {
        // 表单取值
        e.preventDefault();
        const { validateFieldsAndScroll, getFieldsValue } = this.props.form;
        // 保存之前验证表单
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                const newData = getFieldsValue();
                const data = {
                    order_id: this.state.parent_id,
                    remark: newData.remark_info
                }
                api.axiosPost('remarkOrder', data).then(res => {
                    if (res.data.code === 1) {
                        message.success(res.data.msg)
                        this.hideModal()
                        this.updateData(newData.remark_info)
                    } else {
                        message.warning(res.data.msg)
                    }
                })
            } else {
                return;
            }
        })
    }
    //  获取父订单id 
    handelRemark = (id) => {
        this.setState({
            parent_id: id
        })
    }
    render() {
        const { display } = this.props;
        const { getFieldDecorator } = this.props.form;
        return (
            <Modal
                title="备注订单"
                visible={display}
                onCancel={this.hideModal}
                onOk={this.saveEdit}
                destroyOnClose
                maskClosable={false}
                centered
                width={600}
            >
                <Form {...formItemLayout}>
                    <Item label='操作备注'>
                        {getFieldDecorator('remark_info', {
                            rules: [
                                { required: true, message: '请填写操作备注', }
                            ]
                        })(
                            <Input.TextArea placeholder='请填写操作备注' rows={4} />
                        )}
                    </Item>
                </Form>
            </Modal>
        )
    }
}
export default Form.create()(CloseOrderModal)