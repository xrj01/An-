import React from "react";
import {Input, Button ,DatePicker,Row,Col,Icon,Table,Divider} from "antd";
import moment from 'moment';
import {Link} from "react-router-dom";
import api from './../../components/api';
import publicFn from './../../components/public'

const {RangePicker} = DatePicker; 
const dateFormat = 'YYYY-MM-DD'; // 规定日期选择器的格式

class Account extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],  //  表格数据
            columns:[
                {
                    title: '订单编号',
                    dataIndex: 'id',
                    align: 'center',
                    render: (text,record)=>{
                        const url = this.state.thirdJur[29].display ? `/order/jdOrderList/?${text}` : '/order/JDOrder'
                        return (
                            <Link to={url} target='_blank' disabled={!this.state.thirdJur[29].display} >{text}</Link>
                        )
                    }
                },
                {
                    title: '商家',
                    dataIndex: 'company',
                    align: 'center'
                },
                {
                    title: '下单人账号',
                    dataIndex: 'buyer',
                    align: 'center'
                },
                {
                    title: '订单状态',
                    dataIndex: 'state',
                    align: 'center',
                    render: (text, record) => {
                        return (
                            text =='0'?'待提交'
                            :text =='1'?'待付款'
                            :text =='2'?'待发货'
                            :text =='3'?'已发货'
                            :text =='4'?'已完成'
                            :text =='-1'?'已取消'
                            :text =='-2'?'已关闭'
                            :text =='-3'?'已驳回'
                            :''
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
                    align: 'center'
                },
                {
                    title: '运费',
                    dataIndex: 'freight',
                    align: 'center'
                },
                {
                    title: '订单金额',
                    dataIndex: 'order_price',
                    align: 'center'
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
                }
            ],
            page_number: 1,          //  页码
            page_size:10,            //  每页数量
            totalRowNum: 0,          //  分页总数据量

            name: '',                //  查询条件
            dateRange: [null, null], //  时间选择器的value
            start: '',               //  开始时间
            end: '',                 //  结束时间
            isSearch: 0,             //  是否为搜索 0全局展示 1搜索展示

            count: '',               //  订单总数
            total_price: '',          //  订单总金额
            thirdJur: {},            //  权限
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
            dateRange: [null, null], //  时间选择器的value
            start: '',            //  开始时间
            end: '',              //  结束时间
            name: '',             //  查询条件
        },()=>{
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
    getOrderList = (isOverAll=true) => {
        // alert(type);
        const {page_number, page_size, name, order_from, user_from, end, start} = this.state;
        const data = {
            page_number,
            page_size,
            name:       isOverAll ? '': name,
            end:        isOverAll ? '': end,
            start:      isOverAll ? '': start,
            state: this.props.state
        }
        api.axiosPost('JDOrderList', data).then( res => {
            if(res.data.code === 1){
                const { total_price, result, page, num} = res.data.data;
                result && result.length && result.map((item) => {
                    item.key = item.id;
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
    pageOnChange =  (page) => {
        const {isSearch} = this.state
        this.setState({
            page_number: page
        },() => {
            if(isSearch){
                this.getOrderList(false)
            }else{
                this.getOrderList()
            }
        })
    }
    // 切换分页尺寸
    onShowSizeChange = (page,size) => {
        const {isSearch} = this.state
        this.setState({
            page_size: size
        },() => {
            if(isSearch){
                this.getOrderList(false)
            }else{
                this.getOrderList()
            }
        })
    }
    componentDidMount(){
        this.props.onRef(this.getOrderList);

        const {navList} = this.props;
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }
    render(){
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
                            <Input className="width-300 " value={name} onChange={(e) => {this.handleOnchange('name', e.target.value)}} placeholder="订单编号/下单人/收货人"></Input>
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
                            <Button type="primary" onClick={(e)=>{this.getOrderList(false)}}>搜索</Button>
                            <Button type="primary" onClick={this.reset}>重置<Icon type="rollback" /></Button>
                        </div>
                    </Col>
                </Row>

                <div className="merchant-nums margin-bottom-10 clearfix">
                    <Icon type="info-circle" className="iconColor"/>&nbsp;
                    订单总数：<em>{count}</em>个，订单总额：<em>{total_price}</em>元
                </div>

                <div className="tab-box">
                    <Table 
                        dataSource={this.state.tableData} 
                        columns={this.state.columns} 
                        bordered
                        pagination= {pagination}
                    />
                </div>
            </div>
        )
    }
}

export default Account;