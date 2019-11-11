import React from "react";
import { Icon, Table, Divider, Row, Col, DatePicker, Button, Input, Select, Modal, message } from "antd"
import { Link } from "react-router-dom";
import moment from 'moment';
import './subaccountList.scss';
import 'moment/locale/zh-cn';
import SubAddressListModal from './../modals/subAddressListModal';
import SubInvoiceListModal from './../modals/subInvoiceListModal';
import DetailsModalVisible from './../modals/detailsModalVisible';
import api from './../../../../components/api';
moment.locale('zh-cn');
const Option = Select.Option;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD'; // 规定日期选择器的格式
const { confirm } = Modal;


export default class SubAccountList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',       //  账户名称、真实姓名
            roleType: '',  //  角色类型
            start_time: '', //  创建时间
            end_time: '',   //  结束时间
            tableData: [], //  表格数据
            // tableLoading: false,   //  表格加载状态
            page_number: 1,        //  当前页码
            page_size: 10,         //  每页显示数量
            subAccountTotalNum: 0,    //  总数据量
            dateRange: [null, null],         //  时间范围
            isSearch: 0,           //  当前是 全局展示 还是 搜索展示
            type: undefined,     //  账号类型
            columns: [
                {
                    title: '序号',
                    dataIndex: 'id',
                    align: 'center'
                },
                {
                    title: '账户名称',
                    dataIndex: 'username',
                    align: 'center'
                },
                {
                    title: '手机号码',
                    dataIndex: 'phone',
                    align: 'center'
                },
                {
                    title: '真实姓名',
                    dataIndex: 'real_name',
                    align: 'center'
                },
                {
                    title: '角色类型',
                    dataIndex: 'type',
                    align: 'center',
                    render: (text) => {
                        switch (text) {
                            case 1:
                                return '管理员'
                                break;
                            case 2:
                                return '采购员'
                                break;
                            case 3:
                                return '审批员'
                                break;
                        }
                    }
                },
                {
                    title: '创建时间',
                    dataIndex: 'create_time',
                    align: 'center'
                },
                {
                    title: '账户状态',
                    dataIndex: 'state',
                    align: 'center',
                    render: (text) => {
                        switch (text) {
                            case 0:
                                return '关闭'
                                break;
                            default:
                                return '开启'
                                break;
                        }
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'opr',
                    align: 'center',
                    width: 280,
                    render: (text, record, $index) => {
                        return (
                            <div>
                                {/* <Link to={{pathname:'/user/showSubaccountDetails'}}>查看</Link> */}
                                <span className='blue' onClick={() => { this.isShowModal('detailsModalVisible', true, record, 'see') }}>查看</span>
                                <Divider type="vertical" />
                                <span className='blue' onClick={() => { this.closeAcountModal(record.id, $index) }}>{record.state ? '关闭' : '开启'}</span>
                                <Divider type="vertical" />
                                <span className='blue' onClick={() => { this.isShowModal('addressModalVisible', true, record, 'address') }}>地址列表</span>
                                <Divider type="vertical" />
                                <span className="blue" onClick={() => { this.isShowModal('invoiceModalVisible', true, record, 'invoice') }}>发票列表</span>
                            </div>
                        )
                    }
                },
            ],
            addressModalVisible: false,  //  地址列表弹窗
            invoiceModalVisible: false,  //  发票列表弹窗
            detailsModalVisible: false,  //  子账户详情弹窗
            role: '采购员',  //  当前查看详情的角色类型
            isClose: false,  //  是否是关闭状态
        }
    }
    // input ===> onChange
    handleInputOnchange = (type, val) => {
        this.setState({
            [type]: val
        })
    }
    //  控制当前页  弹窗的显示与隐藏
    isShowModal = (type, isTrue, record, Which) => {
        this.setState({
            [type]: isTrue,
        }, () => {
            if (isTrue && Which === 'address') {
                this.addressModal.getId(record.id)
            } else if (isTrue && Which === 'invoice') {
                this.InvoiceModal.getId(record.id)
            } else if (isTrue && Which === 'see') {
                this.seeModal.getIdAndType(record.id, record.type)
            }

        })
    }
    // 日期
    DateChange = (dates, dateStrings) => {
        this.setState({
            start_time: dateStrings[0],
            end_time: dateStrings[1],
            dateRange: dates
        })
    }
    // 角色选择
    roleSelectChange = (value, option) => {
        this.setState({
            type: value
        })
    }
    // 子账户列表和搜索子账户列表展示
    getAndSearchSubAccList = (pageN, pageS, isOverall = true, isReset = false) => {
        if (isReset) {
            this.setState({
                name: '',
                type: undefined,
                dateRange: [null, null]
            })
        }
        const { name, type, start_time, end_time, page_number, page_size } = this.state;
        const data = {
            name: isOverall ? '' : name,
            page_number: pageN ? pageN : page_number,
            page_size: pageS ? pageS : page_size,
            type: isOverall ? 100 : type ? type : 100,
            start_time: isOverall ? '' : start_time,
            end_time: isOverall ? '' : end_time,
            company_id: this.props.company_id
        }
        // console.log('data', data);
        api.axiosPost('getSubAccountList', data).then(res => {
            // console.log(res);
            if (res.data.code === 1) {
                const { page, result } = res.data.data;
                result.map((item) => {
                    item.key = item.id
                })
                this.setState({
                    tableData: result,
                    subAccountTotalNum: page.totalRow,
                    page_number: page.pageNumber,
                    page_size: page.pageSize,
                    isSearch: isOverall ? 0 : 1,
                })
            }
        })
    }
    // 切换分页
    pageOnChange = (page) => {
        const { isSearch } = this.state;
        this.setState({ page_number: page })
        if (isSearch == 0) {
            this.getAndSearchSubAccList(page, '');
        }
        if (isSearch == 1) {
            this.getAndSearchSubAccList(page, '', false);
        }
    }
    // 页码改变
    onShowSizeChange = (current, size) => {
        if (this.state.subAccountTotalNum < size) return false;
        const { isSearch } = this.state;
        this.setState({ page_size: size })
        if (isSearch == 0) {
            this.getAndSearchSubAccList(current, size);
        }
        if (isSearch == 1) {
            this.getAndSearchSubAccList(current, size, false);
        }
    }
    componentDidMount() {
        this.getAndSearchSubAccList()
    }
    render() {
        const { dateRange, subAccountTotalNum, type, tableData, columns, page_number, page_size, name } = this.state;
        // 地址列表props
        const addressListObj = {
            display: this.state.addressModalVisible,
            isShowModal: this.isShowModal
        }
        // 发票列表props
        const invoiceListObj = {
            display: this.state.invoiceModalVisible,
            isShowModal: this.isShowModal
        }
        // 账户详情props
        const detailsObj = {
            display: this.state.detailsModalVisible,
            isShowModal: this.isShowModal
        }
        // 分页配置
        const pagination = {
            total: subAccountTotalNum,
            current: page_number,
            pageSize: page_size,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "30", "40"],
            onChange: this.pageOnChange,
            onShowSizeChange: this.onShowSizeChange
        };

        return (
            <div>
                <Row className="line-height-30 margin-bottom-30">
                    <Col span={24} className='search-box'>
                        <div className="info">
                            公司名称：
                <Input className="width-200" value={name} placeholder="公司名称/账户/名称" onChange={(e) => { this.handleInputOnchange('name', e.target.value) }}></Input>
                        </div>
                        <div>
                            角色类型：
                <Select className="width-200" placeholder="请选择角色类型" onChange={this.roleSelectChange} value={type}>
                                <Option value={1}>管理员</Option>
                                <Option value={2}>采购员</Option>
                                <Option value={3}>审批员</Option>
                            </Select>
                        </div>
                        <div>
                            创建时间：
                <RangePicker
                                format={dateFormat}
                                value={dateRange}
                                onChange={this.DateChange}
                            />
                        </div>
                        <div className="btn-box">
                            <Button type="primary" onClick={() => { this.getAndSearchSubAccList('', '', false) }}>搜索</Button>
                            <Button type="primary" onClick={() => { this.getAndSearchSubAccList('', '', true, true) }}>重置<Icon type="rollback" /></Button>
                        </div>
                    </Col>
                </Row>
                <div className="merchant-nums margin-bottom-10">
                    <Icon type="info-circle" className="iconColor" />&nbsp;账户总数:<em>{subAccountTotalNum}</em>个
        </div>
                <div className="tab-box">
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        bordered
                        pagination={pagination}
                    // loading={this.state.tableLoading}
                    />
                </div>
                <SubAddressListModal ref={(ref) => { this.addressModal = ref }} {...addressListObj} />
                <SubInvoiceListModal ref={(ref) => { this.InvoiceModal = ref }} {...invoiceListObj} />
                <DetailsModalVisible ref={(ref) => { this.seeModal = ref }} {...detailsObj} />
            </div>
        )
    }
    // 关闭账户的操作
    closeAcountModal = (id, $index) => {
        const {tableData} = this.state;
        console.log('tableData[$index]', tableData[$index]);
        const content = tableData[$index].state ?  '关闭成功，账户将无法正常使用，继续关闭吗？' : '您是否要开启这个账户？'
        const url = tableData[$index].state ? 'closeSubAccout' : 'openSubAccount'
        const _that = this;
        confirm({
            title: `${tableData[$index].state? '关闭': '开启'}账户`,
            content: content,
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                return new Promise((resolve, reject) => {
                    api.axiosPost(url, { id: id }).then(res => {
                        // console.log(res)
                        if (res.data.code === 1) {
                            tableData[$index].state = tableData[$index].state? 0 : 1;
                            message.success(res.data.msg);
                            _that.setState({
                                tableData: tableData
                            })
                            resolve(true);
                        } else {
                            message.error(res.data.msg);
                            reject(false);
                        }
                    })
                }).catch(() => console.log('Oops errors!'));
            },
            onCancel() {
                // console.log('Cancel');
            },
        });
    }
}