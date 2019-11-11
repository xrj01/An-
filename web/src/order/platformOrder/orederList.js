import React from "react";
import { Input, Button, Select, DatePicker, Row, Col, Icon, Table, Divider, Modal, message } from "antd";
import moment from 'moment';
import { Link } from "react-router-dom";
import api from "../../components/api";
import publicFn from './../../components/public'

const Option = Select.Option; // 引入Option组件
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD'; // 规定日期选择器的格式
const { confirm } = Modal;

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],  //  表格数据
            columns: [
                {
                    title: '子订单编号',
                    dataIndex: 'id',
                    align: 'center',
                    fixed: 'left',
                    render: (text, record) => {
                        const url = this.state.thirdJur[28].display ? `/order/subOrder/?${text}` : '/order'
                        return (
                            <Link to={url} target='_blank' disabled={!this.state.thirdJur[28].display} >{text}</Link>
                        )
                    }
                },
                {
                    title: '关联父订单',
                    dataIndex: 'parent_id',
                    align: 'center',
                    fixed: 'left',
                    render: (text, record) => {
                        const url = this.state.thirdJur[27].display ? `/order/parentOrder/?${text}` : '/order'
                        return (
                            <Link to={{ pathname: url, }} target='_blank' disabled={!this.state.thirdJur[27].display} >{text}</Link>
                        )
                    }
                },
                {
                    title: '商家',
                    dataIndex: 'company',
                    align: 'center',
                    width: 300,
                    render: (text, record) => {
                        // console.log('record', record);
                        /* switch (record.type) {
                            case 0:
                                return text
                                break;
                            case 1:
                                    return '京东'
                                    break;
                            default:
                                return text
                                break;
                        } */
                        if(record.type === 1 && record.merchant_id === -1) {
                            return '京东'
                        } else {
                            return text
                        }
                    }
                },
                {
                    title: '订单来源',
                    dataIndex: 'order_from',
                    align: 'center',
                    render: (text, record) => {
                        return text === 0 ? '企牛采' : text === 1 ? '昂牛商城' : ''
                    }
                },
                {
                    title: '下单人',
                    dataIndex: 'buyer',
                    align: 'center'
                },
                {
                    title: '账户来源',
                    dataIndex: 'user_from',
                    align: 'center',
                    render: (text, record) => {
                        return text === 0 ? '企牛采' : text === 1 ? '昂牛商城' : ''
                    }
                },
                {
                    title: '发票类型',
                    dataIndex: 'invoice_type',
                    align: 'center',
                    render: (text, record) => {
                        switch (text) {
                            case 1:
                                return '增值税发票'
                                break;
                            case 0:
                                return '普通发票'
                                break;
                            default:
                                return '集中开票'
                                break;
                        }
                    }
                },
                {
                    title: '备注信息',
                    dataIndex: 'remark',
                    align: 'center'
                },
                {
                    title: '子订单状态',
                    dataIndex: 'state',
                    align: 'center',
                    render: (text, record) => {
                        return (
                            text == '0' ? '待提交'
                                : text == '1' ? '待付款'
                                    : text == '2' ? '待发货'
                                        : text == '3' ? '已发货'
                                            : text == '4' ? '已完成'
                                                : text == '-1' ? '已取消'
                                                    : text == '-2' ? '已关闭'
                                                        : text == '-3' ? '已驳回'
                                                            : ''
                        )
                    }
                },
                {
                    title: '收货人',
                    dataIndex: 'consignee',
                    align: 'center'
                },
                {
                    title: '商品金额',
                    dataIndex: 'price',
                    align: 'center',
                    render: (text, record) => {
                        return `￥${text}`
                    }
                },
                {
                    title: '运费',
                    dataIndex: 'freight',
                    align: 'center',
                    render: (text, record) => {
                        return `￥${text}`
                    }
                },
                {
                    title: '订单金额',
                    dataIndex: 'order_price',
                    align: 'center',
                    render: (text, record) => {
                        return `￥${text}`
                    }
                },
                {
                    title: '下单时间',
                    dataIndex: 'create_time',
                    align: 'center'
                },
                {
                    title: '支付时间',
                    dataIndex: 'pay_time',
                    align: 'center'
                },
                {
                    title: '操作',
                    dataIndex: 'opration',
                    // fixed: 'right',
                    align: 'center',
                    render: (text, record, $idnex) => {
                        return (
                            record.state === 4 ? <span onClick={() => {this.recoveryAccountPeriod(record.id, record.order_price, $idnex, record.reply_display)}} className={["recovery-bule", record.reply_display ?'' : 'gray'].join(' ')}>恢复账期</span> : ''
                        )

                    }
                }
            ],
            page_number: 1,       //  页码
            page_size: 10,         //  每页数量
            totalRowNum: 0,       //  分页总数据量
            name: '',             //  查询条件

            order_from: undefined,//  订单来源 0企牛采 1商城
            user_from: undefined, //  账户来源 0企牛采 1商城
            dateRange: [null, null], //  时间选择器的value
            start: '',            //  开始时间
            end: '',              //  结束时间
            isSearch: 0,          //  是否为搜索 0全局展示 1搜索展示

            count: '',            //  订单总数
            total_price: '',       //  订单总金额
            thirdJur: {}          // 
        }
    }

    // input ===> onChange
    handleOnchange = (type, val) => {
        this.setState({
            [type]: val
        })
    }
    // 重置
    reset = () => {
        this.setState({
            order_from: undefined,//  订单来源 0企牛采 1商城
            user_from: undefined, //  账户来源 0企牛采 1商城
            dateRange: [null, null], //  时间选择器的value
            start: '',            //  开始时间
            end: '',              //  结束时间
            name: '',             //  查询条件
        }, () => {
            this.getOrderList()
        })
    }
    // 日期
    DateChange = (dates, dateStrings) => {
        this.setState({
            start: dateStrings[0],
            end: dateStrings[1],
            dateRange: dates
        })
    }
    // 更新父组件状态栏的数量
    updateParentNum = (num) => {
        this.props.updateOrderNum(num)
    }
    // 获取订单列表
    getOrderList = (isOverAll = true) => {
        // alert(type);
        const { page_number, page_size, name, order_from, user_from, end, start } = this.state;
        const data = {
            page_number,
            page_size,
            name: isOverAll ? '' : name,
            order_from: isOverAll ? 100 : order_from ? order_from : 100,
            user_from: isOverAll ? 100 : user_from ? user_from : 100,
            end: isOverAll ? '' : end,
            start: isOverAll ? '' : start,
            state: this.props.state
        }
        // console.log('data=======>', data);
        api.axiosPost('platOrderList', data).then(res => {
            // console.log('res=======>', res);
            if (res.data.code === 1) {
                const { total_price, result, page, num } = res.data.data;
                result && result.length && result.map((item, index) => {
                    item.key = index;
                })
                this.setState({
                    tableData: result,
                    count: page.totalRow,
                    total_price,
                    page_number: page.pageNumber,
                    page_size: page.pageSize,
                    totalRowNum: page.totalRow,
                    isSearch: isOverAll ? 0 : 1
                })
                this.updateParentNum(num)
            }
        })
    }
    // 切换分页
    pageOnChange = (page) => {
        const { isSearch } = this.state
        this.setState({
            page_number: page
        }, () => {
            if (isSearch) {
                this.getOrderList(false)
            } else {
                this.getOrderList()
            }
        })
    }
    // 切换分页尺寸
    onShowSizeChange = (page, size) => {
        const { isSearch } = this.state
        this.setState({
            page_size: size
        }, () => {
            if (isSearch) {
                this.getOrderList(false)
            } else {
                this.getOrderList()
            }
        })
    }
    // 恢复账期
    // 关闭账户的操作
    recoveryAccountPeriod = (id, money, $index, isClick) => {
        const _that = this;
        if(isClick) {
            confirm({
                title: '恢复账期',
                content: `确认恢复此笔订单金额￥${money}的账期？`,
                okText: '确认',
                okType: 'danger',
                cancelText: '取消',
                onOk() {
                    return new Promise((resolve, reject) => {
                        api.axiosPost('recoveryOrderQuato', { order_id: id }).then(res => {
                            // console.log('恢复账期', res)
                            // console.log('this.state', _that.state);
                            if (res.data.code === 1) {
                                // 置灰按钮 ------------------------------
                                const reply_display = res.data.data.reply_display;
                                const { tableData } = _that.state;
                                tableData[$index].reply_display = reply_display
                                _that.setState({
                                    tableData : tableData
                                })
                                // ------------------- ↑ ------------------
                                message.success(res.data.msg);
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
        } else {
            return
        }
        
    }
    componentDidMount() {
        this.props.onRef(this.getOrderList);

        const {navList} = this.props;
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }

    render() {
        const { page_number, page_size, name, order_from, user_from, dateRange, totalRowNum, total_price, count } = this.state;
        // 分页配置
        const pagination = {
            total: totalRowNum,
            current: page_number,
            pageSize: page_size,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "30", "40"],
            onChange: this.pageOnChange,
            onShowSizeChange: this.onShowSizeChange
        };
        return (
            <div className='order-list'>
                <Row className="line-height-30 margin-bottom-30">
                    <Col span={24} className='search-box'>
                        <div className="info">
                            <Input className="width-300" value={name} onChange={(e) => { this.handleOnchange('name', e.target.value) }} placeholder="订单编号/商家名称/下单人/收货人"></Input>
                        </div>
                        <div>
                            <Select className="width-200" placeholder="请选择订单来源" value={order_from} onChange={(value) => { this.handleOnchange('order_from', value) }}>
                                <Option value={1}>企牛采</Option>
                                <Option value={2}>昂牛商城</Option>
                            </Select>
                        </div>
                        <div>
                            <Select className="width-200" placeholder="请选择账户来源" value={user_from} onChange={(value) => { this.handleOnchange('user_from', value) }}>
                                <Option value={1}>企牛采</Option>
                                <Option value={2}>昂牛商城</Option>
                            </Select>
                        </div>
                        <div>
                            下单时间：
                            <RangePicker
                                value={dateRange}
                                format={dateFormat}
                                onChange={this.DateChange}
                            />
                        </div>
                        <div className="btn-box">
                            <Button type="primary" onClick={(e) => { this.getOrderList(false) }}>搜索</Button>
                            <Button type="primary" onClick={this.reset}>重置<Icon type="rollback" /></Button>
                        </div>
                    </Col>
                </Row>
                <div className="merchant-nums margin-bottom-10 clearfix">
                    <Icon type="info-circle" className="iconColor" />&nbsp;
                    订单总数：<em>{count}</em>个，订单总额：<em>{total_price}</em>元
                </div>

                <div className="tab-box">
                    <Table
                        dataSource={this.state.tableData}
                        columns={this.state.columns}
                        bordered
                        scroll={{ x: 1700 }}
                        pagination={pagination}
                    />
                </div>
            </div>
        )
    }
}

export default Account;