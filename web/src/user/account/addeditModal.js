import React from 'react';
import { Input, Row, Col, Modal, Form, Cascader, message } from "antd";
import { is } from 'immutable';
import api from '../../components/api';
import Public from '../../components/public';
const { TextArea } = Input;


class AddEditModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',  // 账户名
            contact: '',   // 联系人姓名
            phone: '',     // 手机号码
            credit: '',    // 授信额度
            float_scale: '',   // 上浮比例
            jd_float_scale: '', // 京东上浮比例
            email: '',     // 邮箱
            company_name: '',  // 公司名
            company_type: '',  // 公司类型
            scope: '',     // 经营范围
            address: '',  // 公司地址
            address_info: '',   // 详细地址

            areaOptions: [],    // 省市区的数据
            oldAddress: [],     // 旧的省市区的名字
            company_id: '',          // 所编辑公司的ID
            accountID: '',     //  账户ID
        }
    }
    // 隐藏弹窗
    hideModals = () => {
        const { isAddNew } = this.props;
        // this.props.form.resetFields()
        this.props.hideModal('visible', false, '', isAddNew)
    }
    // 更新父组件表格数据
    refreshTable = () => {
        this.props.refresh('', '', true);
    }
    // input ===> onChange
    handleInputOnchange = (type, val) => {
        this.setState({
            [type]: val
        })
    }
    // 验证上浮比例
    validatorFloatingRatio = (rule, value, callback) => {
        const strValue = value && value.toString()
        let neg = strValue && strValue.indexOf('-');
        if (neg === -1 && strValue != '' || neg === 0 && strValue != '') {
            let val = strValue && strValue.substring(neg + 1)
            if (!/^(0|\+?[1-9][0-9]*)$/.test(val)) {
                callback('请输入正确格式。')
            }
        }
        callback();
    }
    // 保存信息
    saveInfo = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            // console.log('values', values, err)
            if (!err) {
                const { isAddNew } = this.props;
                const { username, contact, phone, credit, float_scale, email, company_name, company_type, scope, address, address_info, jd_float_scale } = this.state;
                const data = {
                    username, contact, phone, credit, float_scale, email, company_name, company_type, scope, address: address.toString(), address_info, jd_float_scale
                }
                if (isAddNew) {
                    // console.log('后端数据', data)
                    this.handelAddNewAccount(data).then(res => {
                        if (res.status === 'ok') {
                            this.hideModals()
                        }
                    });
                } else {
                    const { company_id, accountID } = this.state;
                    data.company_id = company_id;
                    this.handelEditParentData(accountID, company_id, 1, data).then(res => {
                        if (res.status === 'ok') {
                            this.hideModals()
                        }
                    })
                }
            } else {
                return;
            }
        });
    }
    // 地址改变的操作
    handleAreaChange = (value, selectedOptions) => {
        let defaultArr = ['000000', '000000', '000000'];
        const Arr = defaultArr.slice(value.length);
        const areaArr = value.concat(Arr).toString();
        this.setState({
            address: areaArr
        })
    }
    // 动态加载市区
    loadData = (selectedOptions) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const id = targetOption.id;
        targetOption.loading = true;
        // 根据当前的id请求下一级地区集合
        const _that = this;
        Public.getAreas(_that, id, 'areaOptions', targetOption)
    }
    // 针对新建账户的操作
    handelAddNewAccount = (data) => {
        const param = data;
        return new Promise(
            (resolve, reject) => {
                api.axiosPost('addMainAccount', param).then(res => {

                    if (res.data.code === 1) {

                        message.success(res.data.msg);
                        resolve({
                            status: 'ok'
                        })
                        this.refreshTable();
                    } else {
                        message.error(res.data.msg)
                    }
                }).catch(err => {
                    reject(err)
                })
            }
        )
    }
    // 获得父组件传入的数据并处理(针对编辑账户的操作)
    handelEditParentData = (id, company_id, submint = 0, data) => {
        // console.log(id)
        this.setState({
            company_id: company_id,
            accountID: id
        })
        // 这是没有合并之前的param 用户获取编辑旧的数据
        const param = {
            id: id,
            submint: submint
        }

        // 合并数据，增加字段，保存修改的数据
        Object.assign(param, data);
        return new Promise(
            (resolve, reject) => {
                api.axiosPost('editMainAccount', param).then(res => {
                    // submint === 0 代表点击编辑时去获取旧的数据回填
                    if (res.data.code === 1 && submint === 0) {
                        const { data } = res.data;
                        const { areaOptions } = this.state;

                        areaOptions.map((area, aIndex) => {
                            if (area.id == data.address_area && data.address_area[0].id) {
                                areaOptions.splice(aIndex, 1, data.address_area[0])
                            }
                        })

                        const allData = {
                            username: data.username,  // 账户名
                            contact: data.contact,   // 联系人姓名
                            phone: data.phone,     // 手机号码
                            credit: data.credit,    // 授信额度
                            float_scale: data.float_scale,   // 上浮比例
                            email: data.email,     // 邮箱
                            company_name: data.company_name,  // 公司名
                            company_type: data.company_type,  // 公司类型
                            scope: data.scope,     // 经营范围
                            address: data.address && data.address.map(Number),
                            address_info: data.address_info,   // 详细地址
                            jd_float_scale: data.jd_float_scale  // 京东上浮比例
                        }
                        this.setState({
                            ...allData,
                            areaOptions
                        })
                        // 设置以前的数据
                        this.props.form.setFieldsValue({
                            ...allData,
                        })
                    } else if (res.data.code === 1 && submint === 1) {     //  submint === 1 代表保存编辑
                        message.success(res.data.msg);
                        resolve({
                            status: 'ok'
                        })
                        this.refreshTable();
                    } else {
                        message.success(res.data.msg);
                    }
                }).catch(err => {
                    reject(err)
                })
            }
        )
    }

    // 将自身传到父组件
    componentDidMount() {
        this.props.onRef(this);
        const _that = this
        Public.getAreas(_that, 0, 'areaOptions')
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const { isAddNew } = this.props;  // 判断是 新增账户 还是 编辑账户
        const { areaOptions } = this.state;
        const fieldNames = { label: 'name', value: 'id', children: 'children' };
        // 表单布局
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        return (
            <Modal
                title={isAddNew ? '新建企业账户' : '编辑账户资料'}
                visible={this.props.display}
                onOk={this.saveInfo}
                onCancel={this.hideModals}
                okText="保存"
                cancelText="取消"
                maskClosable={false}
                destroyOnClose
                centered
                bodyStyle={{ height: '580px', overflowY: 'scroll' }}
                width={700}
                afterClose={() => this.props.form.resetFields()}
            >
                <Form {...formItemLayout}>
                    <Row className="authorization-Management margin-bottom-10">
                        <Col span={24}>用户信息管理</Col>
                    </Row>
                    <Form.Item label="账户名称">
                        {getFieldDecorator('username', {
                            rules: [
                                { required: true, message: '请输入账户名称', }, { pattern: /^[a-zA-Z]{4,20}$/, message: '账户名称格式不正确' }
                            ]
                        })(
                            <Input
                                disabled={!isAddNew}
                                placeholder='请输入账户名称，请输入4-20位英文字符'
                                onChange={(e) => { this.handleInputOnchange('username', e.target.value) }}
                            />,
                        )}
                    </Form.Item>
                    {
                        !isAddNew ? '' :
                            <Row className='login-default'>
                                <Col className="login-pwd" xs={{ span: 24 }} sm={{ span: 6 }}>登录密码：</Col>
                                <Col xs={{ span: 24 }} sm={{ span: 17 }}>默认初始密码123456</Col>
                            </Row>
                    }
                    <Form.Item label="联系人姓名">
                        {getFieldDecorator('contact', {
                            rules: [
                                { required: true, message: '请输入联系人姓名' },
                                { pattern: /^[\u4E00-\u9FA5]{1,20}$/, message: '联系人姓名仅支持中文' },
                                { min: 2, message: '联系人姓名格式不正确,至少2位' },
                                { max: 20, message: '联系人姓名格式不正确，最长20位' }
                            ],
                            validateFirst: true   // 验证第一个不成功之后，停止验证
                        })(
                            <Input
                                placeholder="请输入联系人姓名"
                                onChange={(e) => { this.handleInputOnchange('contact', e.target.value) }}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item label="手机号码">
                        {getFieldDecorator('phone', {
                            rules: [
                                { required: true, message: '请输入手机号码', }, { pattern: /^1[345789]\d{9}$/, message: '手机号不正确，请仔细检查' },
                            ]
                        })(
                            <Input
                                placeholder="请输入联系人电话，可用于登录"
                                onChange={(e) => { this.handleInputOnchange('phone', e.target.value) }}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item label="授信额度" className="position-input">

                        {getFieldDecorator('credit', {
                            rules: [
                                { required: true, message: '请填写授信额度' }, { pattern: /^(0|\+?[1-9][0-9]*)$/, message: '授信额度必须为正整数！' }
                            ]
                        })(
                            <Input
                                placeholder="请输入授信额度，单位默认为元，仅支持输入正整数"
                                onChange={(e) => { this.handleInputOnchange('credit', e.target.value) }}
                            />
                        )}
                        <span className="position-span">元</span>
                    </Form.Item>
                    <Form.Item label="价格上浮比例" className="position-input">

                        {getFieldDecorator('float_scale', {
                            rules: [
                                { required: true, message: '请填写上浮比例' },
                                { validator: this.validatorFloatingRatio }
                            ]
                        })(
                            <Input
                                placeholder="请输入上浮比例"
                                onChange={(e) => { this.handleInputOnchange('float_scale', e.target.value) }}
                            />
                        )}
                        <span className="position-span">%</span>
                    </Form.Item>
                    <Form.Item label="京东商品价格上浮比例" className="position-input">
                        {getFieldDecorator('jd_float_scale', {
                            rules: [
                                { required: true, message: '请填写京东商品价格上浮比例' },
                                { validator: this.validatorFloatingRatio }
                            ]
                        })(
                            <Input
                                placeholder="请输入京东商品价格上浮比例"
                                onChange={(e) => { this.handleInputOnchange('jd_float_scale', e.target.value) }}
                            />
                        )}
                        <span className="position-span">%</span>
                    </Form.Item>
                    <Form.Item label="邮箱账户">
                        {getFieldDecorator('email', {
                            rules: [
                                { required: true, message: '请输入邮箱账户' },
                                { type: 'email', message: '请输入正确的邮箱格式', },
                            ]
                        })(
                            <Input
                                placeholder="请输入邮箱账户"
                                onChange={(e) => { this.handleInputOnchange('email', e.target.value) }}
                            />
                        )}
                    </Form.Item>

                    <Row className="authorization-Management margin-bottom-10">
                        <Col span={24}>公司信息</Col>
                    </Row>

                    <Form.Item label="公司名称">
                        {getFieldDecorator('company_name', {
                            rules: [
                                { required: true, message: '请输入公司名称' },
                                { min: 4, message: '公司名称至少4个字' },
                                { max: 20, message: '公司名称最长不得超过20个字' },
                            ]
                        })(
                            <Input
                                placeholder="请输入公司名称"
                                onChange={(e) => { this.handleInputOnchange('company_name', e.target.value) }}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item label="公司类型">
                        {getFieldDecorator('company_type', {
                            rules: [
                                { required: false, message: '请输入公司类型' },
                                { max: 20, message: '公司类型最长20位字符' }
                            ]
                        })(
                            <Input
                                placeholder="请输入公司类型"
                                onChange={(e) => { this.handleInputOnchange('company_type', e.target.value) }}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item label="经营范围">
                        {getFieldDecorator('scope', {
                            rules: [
                                { required: false, message: '请输入经营范围' },
                                { max: 50, message: '经营范围最长50位字符' }
                            ]
                        })(
                            <TextArea
                                rows={3}
                                onChange={(e) => { this.handleInputOnchange('scope', e.target.value) }}
                            />
                        )}
                    </Form.Item>
                    <Form.Item label="公司地区">
                        {getFieldDecorator('address', {
                            rules: [
                                { required: false, message: '请输入公司地区' }
                            ],
                        })(
                            <Cascader
                                placeholder="请选择省市"
                                options={areaOptions}
                                fieldNames={fieldNames}
                                loadData={this.loadData}
                                changeOnSelect
                                onChange={this.handleAreaChange}
                                getPopupContainer = {(triggerNode)=>{ return triggerNode}}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item label="联系地址">
                        {getFieldDecorator('address_info', {
                            rules: [
                                { required: false, message: '请输入准确的联系地址' },
                                { max: 20, message: '联系地址最长20位字符' }
                            ]
                        })(
                            <Input
                                placeholder="请输入公司联系地址"
                                onChange={(e) => { this.handleInputOnchange('address_info', e.target.value) }}

                            />,
                        )}
                    </Form.Item>
                </Form>
            </Modal>
        )
    }
}

export default Form.create()(AddEditModal)