import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { type } from 'os';
import api from '../../../../components/api';
import { get } from 'https';

const { Item } = Form;
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

class ReviseInvoiceModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parent_id: '', // 父订单ID
            oldInvoice: {}, // 旧的发票信息
            isChange: false,  //  是否有输入操作
        }
    }
    // 隐藏弹窗
    hideModal = () => {
        this.props.isShowModal('reviseOrderShow', false)
    }
    // 更新数据
    updateData = (data) => {
        // console.log('data', data);
        data.phone = data.register_tel
        this.props.getLowerCompData('order_invoice', data)
    }
    // 获取与保存数据
    getOldInvoice = (id, data, type = 0) => {
        const param = {
            order_id: id,
            type: type
        }
        // console.log('-------------------', Object.assign({}, param, data));

        api.axiosPost('editInvoice', Object.assign({}, param, data)).then(res => {
            // console.log('res', res);
            if (res.data.code === 1 && type === 0) {
                const { data } = res.data;
                delete data.phone;    //  删除对象不必要的值  以免antd报错 ---->  Warning: You cannot set a form field before rendering a field associated with the value;
                this.props.form.setFieldsValue({
                    ...data
                })
                this.setState({
                    oldInvoice: data
                })
            } else if (res.data.code === 1 && type === 1) {
                message.success(res.data.msg);
                this.updateData(data);
                this.hideModal()
            } else {
                message.error(res.data.msg);
            }
        })
    }
    // 保存发票信息
    saveEdit = (e) => {
        // 表单取值
        e.preventDefault();
        const { validateFieldsAndScroll, getFieldsValue, validateFields, getFieldValue } = this.props.form;
        // 保存之前验证表单
        validateFields((err, values) => {
            if (!err) {
                let newData
               
                if(getFieldValue('invoice_type') == -1){
                    newData = {
                        invoice_type: '-1',
                        company: '', 
                        taxpayer_identification_code: '',
                        register_tel: '',
                        bank: '',
                        bank_account: '',
                        register_address: '',
                        taker_name: '',
                        taker_tel: '',
                        taker_address: ''
                    }
                } else {
                    newData = getFieldsValue();
                    newData.taker_tel = +newData.taker_tel
                }
                this.getOldInvoice(this.state.parent_id, newData, 1)
            } else {
                return;
            }
        });
    }
    // 获取父组件传过来的id 以及 根据id 获取数据
    handelInvoice = (id) => {
        // console.log('id', id);
        this.setState({
            parent_id: id
        }, () => {
            this.getOldInvoice(id)
        })
    }
    // selectOnChange  切换发票类型   切换时  切换到不一样的发票类型 设置输入框为空   否则回填
    selectOnChange = (value) => {
        const { oldInvoice } = this.state;
        // console.log('oldInvoice', oldInvoice);
        let setValue = Object.assign({}, oldInvoice);
        delete setValue.invoice_type;
        // console.log('value', value);
        if (value == oldInvoice.invoice_type) {
            // setTimeout的原因是因为在切换到集中发票时，发票类型以外的formitem是不渲染的，当再次切换到其他发票类型上时，就会造成html还未渲染完毕就去设置值  从而导致设置不成功
            //  并且报错  Warning: You cannot set a form field before rendering a field associated with the value;
            setTimeout(() => {
                this.props.form.setFieldsValue({ ...setValue });
            }, 0);
        } else if (value != -1) {
            for (const item in setValue) {
                setValue[item] = '';
            }
            this.props.form.setFieldsValue({ ...setValue });
        }
    }


    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const { display } = this.props;
        return (
            <Modal
                title='修改发票信息'
                visible={display}
                onCancel={this.hideModal}
                onOk={this.saveEdit}
                destroyOnClose
                maskClosable={false}
                width={600}
            >
                <Form {...formItemLayout}>
                    <Item label='发票类型'>
                        {getFieldDecorator('invoice_type', {
                            initialValue: '1',
                            rules: [
                                { required: true, message: '请选择发票类型' }
                            ],
                        })(
                            <Select placeholder='请选择发票类型' onChange={this.selectOnChange}>
                                <Option value={0}>普通发票</Option>
                                <Option value={1}>增值税发票</Option>
                                <Option value={-1}>集中发票</Option>
                            </Select>
                        )}
                    </Item>
                    {
                        getFieldValue('invoice_type') == -1 ? '' :
                            <div>
                                <Item label='企业名称'>
                                    {getFieldDecorator('company', {
                                        rules: [
                                            { required: true, message: '请输入企业名称', }
                                        ]
                                    })(
                                        <Input placeholder='请输入企业名称' />
                                    )}
                                </Item>
                                <Item label='纳税人识别号'>
                                    {getFieldDecorator('taxpayer_identification_code', {
                                        rules: [
                                            { required: true, message: '请输入纳税人识别号', }
                                        ]
                                    })(
                                        <Input placeholder='纳税人识别号' />
                                    )}
                                </Item>
                                <Item label='注册电话'>
                                    {getFieldDecorator('register_tel', {
                                        rules: [
                                            { required: true, message: '请输入注册电话', },
                                            {pattern:/^((0\d{2,3}-\d{7,8})|(1[345789]\d{9}))$/,message:'手机号不正确，请仔细检查' }
                                        ]
                                    })(
                                        <Input placeholder='请输入注册电话' />
                                    )}
                                </Item>
                                <Item label='开户银行'>
                                    {getFieldDecorator('bank', {
                                        rules: [
                                            { required: true, message: '请输入开户银行', }
                                        ]
                                    })(
                                        <Input placeholder='请输入开户银行' />
                                    )}
                                </Item>
                                <Item label='银行账户'>
                                    {getFieldDecorator('bank_account', {
                                        rules: [
                                            { required: true, message: '请输入银行账户', }
                                        ]
                                    })(
                                        <Input placeholder='请输入银行账户' />
                                    )}
                                </Item>
                                <Item label='注册地址'>
                                    {getFieldDecorator('register_address', {
                                        rules: [
                                            { required: true, message: '请输入注册地址', }
                                        ]
                                    })(
                                        <Input placeholder='请输入注册地址' />
                                    )}
                                </Item>
                                <Item label='收票人名称'>
                                    {getFieldDecorator('taker_name', {
                                        rules: [
                                            { required: true, message: '请输入收票人名称', }
                                        ]
                                    })(
                                        <Input placeholder='请输入收票人名称' />
                                    )}
                                </Item>
                                <Item label='收票手机'>
                                    {getFieldDecorator('taker_tel', {
                                        rules: [
                                            { required: true, message: '请输入收票手机', },
                                            { pattern: /^1[345789]\d{9}$/, message: '手机号不正确，请仔细检查' },
                                        ]
                                    })(
                                        <Input placeholder='请输入收票手机' />
                                    )}
                                </Item>
                                <Item label='收票地址'>
                                    {getFieldDecorator('taker_address', {
                                        rules: [
                                            { required: true, message: '请输入收票地址', }
                                        ]
                                    })(
                                        <Input placeholder='请输入收票地址' />
                                    )}
                                </Item>
                            </div>
                    }
                </Form>
            </Modal>
        )
    }
}

export default Form.create({
    onValuesChange: (props, changedValues, allValues) => {

    }
})(ReviseInvoiceModal)