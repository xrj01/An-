import React from "react";
import { Link } from "react-router-dom";
import bind from "react-autobind";
import { Table, Row, Col, Input, Button, message, Icon, Select, Switch  } from "antd";
import './index.scss';
import api from "../../components/api";
import publicFn from './../../components/public';

const { Option } = Select; 

class order extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            title: '',                 // 物流公司名称，没有传空
            state: undefined,          // 0不显示 1显示  没有传空
            tableData: [],             // 表格数据数组
            total_row: 0,                  // 当前物流总数量
            page_number: 1,                // 页码
            page_size: 10,              // 每页数量
            isSearch: false,            // 是否搜索
            thirdJur: {},               // 权限
            columns: [
                {
                    title: '物流公司',
                    dataIndex: 'title',
                    align: 'center',
                    render: (text, record) => {
                        return (
                            <span>{text}</span>
                        )
                    }
                },
                {
                    title: '排序',
                    dataIndex: 'sort_index',
                    align: 'center',
                    render: (text, record, $index) => {
                        return (
                            <Input style={{width: 80}} defaultValue={text} onBlur={(e)=>{this.setLogisticSort(record.express_code, $index, e.target, text)}}/>
                        )
                    }
                },
                {
                    title: '前台显示',
                    dataIndex: 'display',
                    align: 'center',
                    render: (text, record, $index) => {
                       return <Switch checked={text? true : false} disabled={!this.state.thirdJur[44].display} onChange={()=>{this.switchShowHide(record.express_code, $index, text)}}/>
                    }
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
    // 重置搜索
    reset () {
        this.setState({
            title: '',
            state: undefined,
            page_number: 1,
            page_size: 10
        },()=>{
            this.getLogList()
        })
    }
    // 设置物流前台展示与否
    switchShowHide (code, index, isShow) {
        const {tableData} = this.state;
        api.axiosPost('setLogisticsShow', {express_code: code}).then(res=>{
            console.log('是否显示', res);
            if(res.data.code === 1) {
                tableData[index].display = isShow? 0 : 1
                this.setState({
                    tableData: [...tableData]
                })
                message.success(res.data.msg)
            }
        })
    }
    // 设置物流排序
    setLogisticSort (code, index, target, oldSort) {
        console.log('sort_index', target.value);
        const reg = /^[+]{0,1}(\d+)$/;
        if(!reg.test(target.value)){
            target.focus()
            target.select()
            message.error('请输入正整数进行排序！')
            return
        }
        if(oldSort ==  target.value){ return }
        
        api.axiosPost('setLogisticSort', {express_code: code, sort_index: target.value}).then(res=>{
            console.log('是否显示', res);
            if(res.data.code === 1) {
                message.success(res.data.msg)
            }
        })
    }
    // 获取订单列表
    /* 
    *   @isAll 判断是否是全局获取数据  最主用于控制分页
    */
    getLogList (isAll=true, pageN, pageS) {
        const { title, state, page_number, page_size } = this.state;
       
        const param = {
            title: isAll? "" : title,
            state: isAll? "" : state? state : "",
            page_number: pageN? pageN : 1,
            page_size: pageS? pageS : page_size,
        }
        api.axiosPost('logisticsManageApi', param).then(res=>{
            if ( res.data.code === 1 ) {
                const data = res.data.data.list;
                data.map((item, index)=>{
                    item.key = item.express_code
                })
                this.setState({
                    tableData : data,
                    total_row: res.data.data.total_row,
                    isSearch: isAll ? false : true,
                    page_number: pageN? pageN : 1,
                    page_size: pageS? pageS : page_size,
                })
            }
        })
        
    }
    // 切换分页
    pageOnChange (page) {
        this.setState({
            page_number: page
        }, () => {
            const {isSearch} = this.state;
            if(isSearch){
                this.getLogList(false, page)
            }else {
                this.getLogList(true, page)
            }
        })
    }
    // 切换分页尺寸
    onShowSizeChange = (page, size) => {
        this.setState({
            page_number: page,
            page_size: size
        }, () => {
            const {isSearch} = this.state;
            if(isSearch){
                this.getLogList(false, page, size)
            }else {
                this.getLogList(true, page, size)
            }
        })
    }

    componentDidMount() {
        this.getLogList()

        const {navList} = this.props;
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }
    render() {
        const {  title,state, tableData, columns, total_row, page_number, page_size } = this.state;
        // 分页配置
        const pagination = {
            total: total_row,
            current: page_number,
            pageSize: page_size,
            showSizeChanger: true,
            onChange: this.pageOnChange,
            onShowSizeChange: this.onShowSizeChange
        };
        return (
            <div className='pending-orider-box'>
                <h4 className='h4-title'>物流管理</h4>
                <Row className="line-height-30 margin-bottom-30">
                    <Col span={24} className="search-box">
                        <div className="info">
                            物流公司名称：
                            <Input 
                                className="width-200" 
                                value={title} onChange={(e) => { this.handleOnchange('title', e.target.value) }} 
                                placeholder="请输入物流公司名称" 
                            />
                        </div>
                        <div>
                            显示状态：
                            <Select
                                className="width-200" 
                                value={state} placeholder="物流显示状态" 
                                onChange={(v) => { this.handleOnchange('state', v) }} 
                            >
                                <Option value="1">显示</Option>
                                <Option value="0">不显示</Option>
                            </Select>
                        </div>
                        <div className="btn-box">
                            <Button type="primary" onClick={(e) => { this.getLogList(false) }}>搜索</Button>
                            <Button type="primary" onClick={this.reset}>重置<Icon type="rollback" /></Button>
                        </div>
                    </Col>
                </Row>
                {/* 订单统计 */}
                <div className="merchant-nums margin-bottom-10 clearfix">
                    <Icon type="info-circle" className="iconColor" />&nbsp;
                    物流总数：<em>{total_row}</em>个
                </div>
                {/* 订单的表格 */}
                <div className="tab-box">
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        bordered
                        pagination={pagination}
                    />
                </div>
            </div>
        )
    }

}
export default order;
