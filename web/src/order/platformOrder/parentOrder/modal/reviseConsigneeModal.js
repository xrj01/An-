import React from 'react';
import api from '../../../../components/api';
import Public from '../../../../components/public';
import { Modal, Form, Input, Cascader, message } from 'antd';

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

class ReviseConsigneeModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            areaOption: [],       // 省市区的数据
            parent_id: '',        // 父订单id
            address: '',          // 新的省市区字符串  --->  用于发送后台
            addressName: [],       // 旧得省市区数据   --->  用于回填省市区
        }
    }
    // 隐藏弹窗
    hideModal = () => {
        this.props.isShowModal('reviseConsigneeShow', false)
    }
    // 更新数据
    updateData = (data) => {
        
        data.address = `${this.state.addressName.join('')}${data.address_info}`
        // console.log('回填的数据', data);
        this.props.getLowerCompData('order_address', data)
    }
    // 获取与保存数据
    getOldInvoice = (id, data, type = 0) => {
        const param = {
            order_id: id,
            type: type,
        }
        // console.log('合并的数据', Object.assign({}, param, data));

        api.axiosPost('editConsigneeAddr', Object.assign({}, param, data)).then(res => {
            // console.log('res', res);
            if (res.data.code === 1 && type === 0) {
                const { data } = res.data;
                const setValue = Object.assign({}, data);   // 将对象重新赋值给一个新对象， 以免造成未知错误    
                //  删除对象不必要的值  以免antd报错 ---->  Warning: You cannot set a form field before rendering a field associated with the value;
                delete setValue.address_id;
                delete setValue.address_name;

                this.props.form.setFieldsValue({
                    ...setValue,
                    address: data.address_id
                })
                this.setState({
                    addressName: data.address_name,
                    address: data.address_id
                })
            } else if (res.data.code === 1 && type === 1) {
                message.success(res.data.msg);
                this.updateData(data);
                this.hideModal();
            }
        })
    }
    // 保存收货人信息
    saveEdit = (e) => {
        // 表单取值
        e.preventDefault();
        const { validateFieldsAndScroll, getFieldsValue } = this.props.form;
        // 保存之前验证表单
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                const newData = getFieldsValue();
                let defaultArr = ['000000', '000000', '000000'];
                const Arr = defaultArr.slice(this.state.address.length);
                const areaArr = this.state.address.concat(Arr).toString();
                newData.address = areaArr
                // console.log('newData', newData);
                this.getOldInvoice(this.state.parent_id,newData,1)
            } else {
                return;
            }
        });
    }
    // 获取父组件传过来的id 以及 根据id 获取数据
    handelConsignee = (id) => {
        // console.log('id', id);
        this.setState({
            parent_id: id
        }, () => {
            this.getOldInvoice(id)
        })
    }
    // 动态加载市区
    loadData = (selectedOptions) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const id = targetOption.id;
        targetOption.loading = true;
        // 根据当前的id请求下一级地区集合
        const _that = this;
        Public.getAreas(_that, id, 'areaOption', targetOption)
    }
    // 地址改变的操作
    handleAreaChange = (value, option) => {
        // 得到地址名字数组  用户更新表格数据
        console.log(123456);
        
        let addressName = [];
        option.map(item=>{
            addressName.push(item.name)
        })
        this.setState({
            address: value,
            addressName : addressName
        })
    }
    componentDidMount() {
        // 获取省的数据
        const _that = this
        Public.getAreas(_that, 0, 'areaOption')
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { display } = this.props;
        const { addressName, areaOption } = this.state;
        const fieldNames = { label: 'name', value: 'id', children: 'children' };
        // cascader回填旧的省市区
        let displayRender = (labels, selectedOptions) => {
            console.log(labels);
            console.log(selectedOptions);
            console.log(addressName.length);
            if (labels.length == 0 && addressName.length ) {
                console.log(22222);
                
                let defaults = addressName && addressName.length && addressName.map((item, index) => {
                    
                    if (index === addressName.length - 1) {
                        return <span key={index} style={{ background: '#fff' }}>{item}</span>;
                    }
                    return <span key={index} style={{ background: '#fff' }}>{item} / </span>;
                })
                return defaults;
            }
            let news = labels.map((label, i) => {
                console.log(label);
                const option = selectedOptions[i];
                if (i === labels.length - 1) {
                    return <span key={option.id} style={{ background: '#fff' }}>{label}</span>;
                }
                return <span key={option.id}>{label} / </span>;
            });
            return news
        }

        return (
            <Modal
                title='修改收货人信息'
                visible={display}
                onCancel={this.hideModal}
                onOk={this.saveEdit}
                destroyOnClose
                maskClosable={false}
                width={600}
            >
                <Form {...formItemLayout}>
                    <Item label='收货人姓名'>
                        {getFieldDecorator('consignee', {
                            // initialValue: '1',
                            rules: [
                                { required: true, message: '请输入收货人姓名' },
                                { max: 20, message: '收货人姓名最长为20个字符' }
                            ],
                        })(
                            <Input placeholder='请输入收货人姓名' />
                        )}
                    </Item>

                    <Item label='手机号码'>
                        {getFieldDecorator('phone', {
                            rules: [
                                { required: true, message: '请输入手机号码', }
                            ]
                        })(
                            <Input placeholder='请输入手机号码' />
                        )}
                    </Item>

                    <Item label='邮政编码'>
                        {getFieldDecorator('postal_code', {
                            rules: [
                                { required: false, message: '请输入邮政编码', }
                            ]
                        })(
                            <Input placeholder='请输入邮政编码' />
                        )}
                    </Item>
                    <Item label="所在区域">
                        {getFieldDecorator('address', {
                            rules: [
                                { type: 'array', required: true, message: '请选择所在区域' }
                            ],
                        })(
                            <Cascader
                                placeholder="请选择所在区域"
                                options={areaOption}
                                fieldNames={fieldNames}
                                loadData={this.loadData}
                                changeOnSelect
                                onChange={this.handleAreaChange}
                                notFoundContent="暂时没有数据"
                                displayRender={(labels, selectedOptions) => { return displayRender(labels, selectedOptions) }}
                            />
                        )}
                    </Item>
                    <Item label='详细地址'>
                        {getFieldDecorator('address_info', {
                            rules: [
                                { required: true, message: '请填写详细地址', }
                            ]
                        })(
                            <Input.TextArea placeholder='请填写详细地址' rows={4} />
                        )}
                    </Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create()(ReviseConsigneeModal)