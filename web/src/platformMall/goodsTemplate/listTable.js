import React from "react";
import { Table, Row, Col, Button, Input, Select, DatePicker, Form, Modal, Divider, Cascader, Pagination, message } from "antd";
import { Link } from 'react-router-dom';
import api from "../../components/api";

import "./index.scss"
const dateFormat = 'YYYY-MM-DD'; // 规定日期选择器的格式

class ListTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [1],  //  表格数据
            totalGoodsNum: '',
            columns: [
                {
                    title: '序号',
                    dataIndex: 'product_id',
                    align: 'center'
                },
                {
                    title: '略缩图',
                    dataIndex: 'pic',
                    align: 'center',
                    render: (text, record) => {
                        return <img src={text} style={{ width: 55, height: 38, border: '1px solid #ccc' }} />
                    }
                },
                {
                    title: '商品名称',
                    dataIndex: 'title',
                    align: 'center'
                },
                {
                    title: '品牌',
                    dataIndex: 'class_name',
                    align: 'center'
                },
                {
                    title: '商品分类',
                    dataIndex: 'merchants',
                    align: 'center',
                },
                {
                    title: '添加时间',
                    dataIndex: 'jd_price',
                    align: 'center'
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    align: 'center',
                    render: (text, record) => {
                        return (
                            <div>
                                <Link to={`/platform/templateDetails/${record.product_id}`}>查看</Link>
                                <Divider type="vertical" />
                                <Link to={`/platform/templateDetails/${record.product_id}`}>编辑</Link>
                                <Divider type="vertical" />
                                <Link to={`/platform/templateDetails/${record.product_id}`}>删除</Link>
                            </div>
                        )
                    }
                },
            ],
            loading: false,
            page_size: 10,    //  每页显示数量
            page_number: 1,   // 当前页码
            total: 0,
            dateRange: [null, null],         //  时间范围
            JDcataArr: [],   // 京东商品分类
            cascaderValue: [],  //  级联选择器的value
            class_id: '',    //  默认分类id
            keyword: '',     //  商品编号 / 名称
            cid1: '',  // 第一级分类id
            cid2: '',  // 第二级分类id
        }

    }

    render() {
        const {dateRange,total,page_size,page_number} = this.state
        const { RangePicker } = DatePicker;

        // 分类属性名
        const fieldNames = { label: 'name', value: 'id', children: 'children' };
        // 分页配置
        const pagination={
            total:total,
            pageSize:page_size,
            current:page_number,
            onChange:(page,size)=>{
                this.setState({page_number:page,page_size:size,spinning:true},()=>{
                    this.userList()
                })
                document.getElementById('root').scrollIntoView(true)
            }
        };
        return (
            <div className='jd-content-box'>
                <Row className='line-height-30 margin-bottom-10'>
                    <Col span={24} className='search-box'>
                        <div> 
                            <Input
                                className='width-200'
                                placeholder="请输入商品名称"
                                value={this.state.keyword}
                                onChange={(e) => { this.handleInputOnchange('keyword', e.target.value) }}
                            />
                        </div>
                        <div>
                            <Cascader
                                placeholder="请选择分类"
                                className='width-300'
                                value={this.state.cascaderValue}
                                options={this.state.JDcataArr}
                                fieldNames={fieldNames}
                                loadData={this.loadData}
                                changeOnSelect
                                onChange={this.cataOnChange}
                            />
                        </div>
                        <div>
                            创建时间：
                            <RangePicker
                                style={{width:230,lineHeight:'33px'}}
                                value={dateRange}
                                format={dateFormat}
                                onChange={this.DateChange}
                            />
                        </div>
                        <div className='line-height-33 ml50'>
                            <Button type='primary' onClick={() => { this.handelSearch() }}>搜索</Button>
                            {/* <Button
                                type="primary"
                                style={{ marginLeft: '10px' }}
                                onClick={() => { this.searchGoodsAndShowList('', '', true, 'reset') }}
                            >重置<Icon type="rollback" /></Button> */}
                        </div>
                    </Col>
                </Row>
                {/* 表格 */}
                <div className='jd-table-box'>
                    <div className='jd-table-box-title'>
                        商品总数：<span>{this.state.totalGoodsNum}</span>
                    </div>
                </div>
                <Table
                    className='jd-table'
                    bordered
                    pagination={false}
                    
                    loading={this.state.loading}
                    dataSource={this.state.dataSource}
                    columns={this.state.columns}
                />
                <div className="class-pagination-box">
                    <Pagination 
                        defaultCurrent={1}   
                        {...pagination} 
                        hideOnSinglePage={true} 
                        showSizeChanger 
                        showQuickJumper={{goButton: <Button className='pagination-btn'>确定</Button>}} 
                        onShowSizeChange={this.onShowSizeChange}/>
                </div>
            </div>
        )
    }
    componentDidMount() {
        
    }
    // input ===> onChange
    handleInputOnchange = (type, val) => {
        this.setState({
            [type]: val
        })
    }
    // 分类三级联动的onchange事件
    cataOnChange = (value) => {
        let valueArr = ['', '', ''];
        const lastValue = value != '' ? value[value.length - 1].toString() : ''
        // const areaArr = this.state.address.concat(Arr).toString();
        this.setState({
            class_id: lastValue,
            cascaderValue: value,
            cid1: '',
            cid2: '',
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
    // 搜索
    handelSearch = () => {
        const {userName,cascaderValue,dateRange} = this.state
        
        if(userName || cascaderValue.length>0 || dateRange[0] !=null){
            this.setState({
                name: userName,
                page_number:1,
            },()=>{})
            
        }else{
            message.error('请设置搜索条件！')
        }
        
    }
    // 分页数量切换
    onShowSizeChange = (number,size) =>{
        this.setState({
            page_number:number,
            page_size:size
        },()=>{this.userList()})
    }
    
}
export default Form.create()(ListTable)