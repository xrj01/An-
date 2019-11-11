import React from "react";
import { Link } from "react-router-dom";
import bind from "react-autobind";
import { Table, Row, Col, Input, Button, message, Modal,  DatePicker, Icon } from "antd";
import './index.scss';
import api from "../../components/api";
import publicFn from './../../components/public';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD'; // 规定日期选择器的格式

class order extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            totalNum: 0,               // 待处理订单总数
            dateRange: [null,null],    // 时间范围
            name: '',                  // 搜索===> 订单编号、商家名称、下单人、商品名称
            tableData: [],             // 表格数据数组
            count: 0,                  // 当前总数量以及筛选数量
            total_price: 0.00,         // 当前总金额以及筛选之后的金额
            selectedRowKeys: [],       // 选中数据的集合
            isidentical: false,        // 判断是否相同
            confirmLoading: false,     // 替换订单的确认按钮的加载状态
            replaceModalVisable: false, // 替换订单的窗口显示隐藏
            parentData: [],             // 父订单列表
            thirdJur: {},               // 权限
            columns: [
                {
                    title: '子订单编号',
                    dataIndex: 'id',
                    align: 'center',
                    // fixed: 'left',
                    render: (text, record) => {
                        
                        const url = this.state.thirdJur[48].display ? `/order/subOrder/?${text}` : '/order/pendingOrder'
                        return (
                            <Link to={url} target='_blank' disabled={!this.state.thirdJur[48].display} >{text}</Link>
                        )
                    }
                },
                {
                    title: '关联父订单',
                    dataIndex: 'parent_id',
                    align: 'center',
                    // fixed: 'left',
                    render: (text, record) => {
                        const url = this.state.thirdJur[49].display ? `/order/parentOrder/?${text}` : '/order/pendingOrder'
                        return (
                            <Link to={url} target='_blank' disabled={!this.state.thirdJur[49].display} >{text}</Link>
                        )
                    }
                },
                {
                    title: '商品名称',
                    dataIndex: 'product_name',
                    align: 'center',
                    render: (text, record) => {
                        // console.log('record----', record);
                        const url = record.type ? `/platform/commodityDetails/` : `/platform/ProductDetails/`
                        return <Link to={{ pathname: `${url}${record.product_id}`, search:`?${record.merchant_id}` }} className="link-detail" target="_blank">{text}</Link>
                    }
                },
                {
                    title: '商家',
                    dataIndex: 'company',
                    align: 'center',
                    render: (text, record) => {
                        // console.log('record', record);
                        switch (record.type) {
                            case 0:
                                return text
                                break;
                            case 1:
                                    return '京东'
                                    break;
                            default:
                                return text
                                break;
                        }
                    }
                },
                {
                    title: '下单人',
                    dataIndex: 'buyer',
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
                    title: '下单时间',
                    dataIndex: 'create_time',
                    align: 'center'
                },
                {
                    title: '支付时间',
                    dataIndex: 'pay_time',
                    align: 'center'
                },
            ],
        }
        bind(this)
    }

    // input ===> onChange
    handleOnchange (type, val)  {
        this.setState({
            [type]: val
        })
    }
    // 控制弹窗的显示与隐藏
    isShowModal = (type, isTrue,) => {
        this.setState({
            [type]: isTrue
        })

    }
    // 日期
    DateChange  (dates, dateStrings) {
        this.setState({
            start: dateStrings[0],
            end: dateStrings[1],
            dateRange: dates
        })
    }
    // 获取订单列表
    getOrderList (isOverAll = true) {
        api.axiosPost('pendingOrderList').then(res=>{
            // console.log('待处理订单的数据', res);
            if ( res.data.code === 1 ) {
                const data = res.data.data;
                data.map((item,index)=>{
                    item.key= item.id
                })

                this.setState({
                    tableData : data
                })
            }
        })
        
    }
    // 选中项发生变化时的回调
    onSelectOnChange (selectedRowKeys, selectedRows) {
        // console.log("selectedRowKeys changed: ", selectedRowKeys, selectedRows);
        this.setState({ selectedRowKeys });
    }
    // 选择单挑数据的方法
    onSingleeSlect (record, selected, selectedRows) {
        this.setState({
            parentData: selectedRows
        })
        
    }
    // 判断是否有选择
    handleIsSelect (type) {
        const { selectedRowKeys } = this.state
        if(!selectedRowKeys.length) {
            message.error(`请选择您要${type}的商品！`)
            return
        }else if(type === '替换') {
            this.isShowModal("replaceModalVisable", true,)
        }else if(type === '提交') {
            this.submitOrder()
        }
    }
    // 处理替换订单弹窗的确认处理
    handleReplaceOk () {
        const { selectedRowKeys } = this.state;
       
        const newArr = selectedRowKeys.join(',').split(',')
        api.axiosPost('replaceOrder',{sub_order_id:newArr}).then(res=>{
            if(res.data.code === 1) {
                message.success(res.data.msg)
                this.isShowModal("replaceModalVisable", false)  // 关闭弹窗
                this.setState({
                    selectedRowKeys: []                         // 清空当前所选择
                })
            } else {
                message.error(res.data.msg)
            }
        }).catch(error => {
            message.error(error)
        })
    }
    // 处理提交订单
    submitOrder () {
        const {isidentical,selectedRowKeys,parentData} = this.state
        // console.log('isidentical',isidentical);
        let isidenticals = true;
        let initValue = parentData[0].parent_id;
       
        for (let index = 0; index < parentData.length; index++) {
            const element = parentData[index].parent_id;
            if(initValue !== element){
                message.error("请选择相同父订单！")
                isidenticals = false;
                return false 
            }
        }
        // console.log('isidenticals', isidenticals);
        if(isidenticals){
            const newSelectedRowKeys = selectedRowKeys.join(',').split(',')
            api.axiosPost('submitingOrder',{sub_order_id: newSelectedRowKeys}).then(res=>{
                if( res.data.code === 1 ) {
                    message.success(res.data.msg)
                    this.setState({
                        selectedRowKeys: []                         // 清空当前所选择
                    })
                } else {
                    message.error(res.data.msg)
                }
            })
        } else {
            message.error('请选择相同父订单！')
            return
        }
    }

    componentDidMount() {
        this.getOrderList()

        const {navList} = this.props;
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }
    render() {
        const { totalNum, dateRange, name, tableData, columns, total_price, count, selectedRowKeys, confirmLoading, replaceModalVisable,thirdJur } = this.state;
        // 多选配置
        const selections = {
            selectedRowKeys,
            onChange: this.onSelectOnChange,
            columnTitle: '选择',
            columnWidth: '80px',
            onSelect: this.onSingleeSlect
        }
        // 权限
        const controlThirdJur = (id) => Object.keys(thirdJur).length && thirdJur[id].display
        return (
            <div className='pending-orider-box'>
                <h4 className='h4-title'>待处理订单</h4>
                {/* <div className="margin-bottom-20"><Button type="primary">待处理({totalNum})</Button></div>
                <Row className="line-height-30 margin-bottom-30">
                    <Col span={24} className="search-box">
                        <div className="info">
                            <Input className="width-300" value={name} onChange={(e) => { this.handleOnchange('name', e.target.value) }} placeholder="订单编号/商家名称/下单人/收货人"></Input>
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
                </Row> */}
                {/* 订单统计 */}
                <div className="merchant-nums margin-bottom-10 clearfix">
                    {/* <Icon type="info-circle" className="iconColor" />&nbsp;
                    订单总数：<em>{count}</em>个，订单总额：<em>{total_price}</em>元 */}
                    <div className="addNew">
                        {
                            controlThirdJur(33) ? <Button type="primary" style={{marginRight: 20}} size="small" onClick={() => { this.handleIsSelect('替换') }}>替换订单</Button> : ''
                        }
                        {/* <Button type="primary" style={{marginRight: 20}} size="small" onClick={() => { this.handleIsSelect('替换') }}>替换订单</Button> */}
                        {
                            controlThirdJur(34) ? <Button type="danger" size="small" onClick={() => { this.handleIsSelect('提交') }}>提交订单</Button> : ''
                        }
                        
                    </div>
                </div>
                {/* 订单的表格 */}
                <div className="tab-box">
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        bordered
                        rowSelection = {selections}
                        pagination={false}
                    />
                </div>
                {/* 替换订单的弹窗 */}
                <Modal
                    title="替换订单"
                    visible={replaceModalVisable}
                    onOk={this.handleReplaceOk}
                    confirmLoading={confirmLoading}
                    onCancel={()=>{this.isShowModal('replaceModalVisable', false)}}
                >
                    <h3>确认要将已勾选信息提交到商家<b>平台商品账户</b>吗？</h3>
                </Modal>
            </div>
        )
    }

}
export default order;
