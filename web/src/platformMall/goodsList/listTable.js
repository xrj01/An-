import React from "react";
import { Table, Row, Col, Button, Input, Select, DatePicker, Cascader, message, Icon, Modal, Divider } from "antd";
import { Link } from 'react-router-dom';
import api from "./../../components/api";
import Public from "./../../components/public";
import 'moment/locale/zh-cn';
import './index.scss';
const Option = Select.Option;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const dateFormat = 'YYYY-MM-DD';
export default class ListTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            columns: [
                {
                    title: '商品货号',
                    dataIndex: 'article_number',
                },
                {
                    title: '略缩图',
                    dataIndex: 'img',
                    render: (text, record) => {
                        const imgUrl = Public.imgUrl(record.merchant_id, record.id)

                        return (
                            <div className="thumbnail" >
                                <img
                                    src={imgUrl}
                                    onClick={(e) => { this.handleModalShow(e, true, record.merchant_id, record.id) }}
                                    onError={this.imgError} />
                            </div>
                        )
                    }
                },
                {
                    title: '主标题',
                    dataIndex: 'title',
                    render: (text) => {
                        return (
                            <div className='mainTitle'>
                                {text}
                            </div>
                        )
                    }
                },
                {
                    title: '商品分类',
                    dataIndex: 'class_name',
                },
                {
                    title: '商家',
                    dataIndex: 'company',
                    render: (text, record) => {
                        return (
                            <div className='mainCompany'>
                                {text}
                            </div>
                        )
                    }
                },
                {
                    title: '销售价',
                    dataIndex: 'price',
                },
                {
                    title: '库存',
                    dataIndex: 'inventory',
                },
                {
                    title: '状态',
                    dataIndex: 'state',
                },
                {
                    title: this.renderDateText(),
                    dataIndex: 'shelves_time',
                    align: 'center',
                    render: (text, record) => {
                        return (
                            <div>
                                {
                                    this.props.currentState == 2 ||
                                        this.props.currentState == -1 ? record.create_time : record.shelves_time
                                }
                            </div>
                        )
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    align: 'center',
                    render: (text, record) => {
                        const { thirdJur } = this.state;
                        return (
                            <div className='templateBtn'>
                                {
                                    thirdJur[16].display ? <Link to={{ pathname: `/platform/ProductDetails/${record.id}`, query: { merchant_id: record.merchant_id } }}>查看</Link> : ''
                                }
                                {
                                    record.is_tpl === '0' &&
                                    <span>
                                        <Divider type="vertical" />
                                        <span onClick={()=>{this.setTemplate(record)}}>设为模板</span>
                                    </span>
                                }
                            </div>

                        )
                    }
                },
            ],
            loading: false,       //   表格加载状态
            classOption: [],     //   分类数据
            page_number: 1,      //   当前页
            page_size: 10,       //   每一页数量
            totalRowData: 0,     //   分页总数
            lower_shelf: 0,      //  已下架
            stay_on_the_shelf: 0,//  待上架
            upper_shelf: 0,      //  已上架
            whole: 0,           //  全部商品总数
            class_id: '',         //  默认分类id
            company_list: [],    //  商家列表
            name: '',            //  商品编号、标题
            business: 1000,        //  商家
            shelves_time_start: '',  // 开始时间
            shelves_time_end: '',     // 结束时间
            cascaderValue: [],      // 级联选择器的value
            rangeDate: [null, null], // 日期选择器的value
            isSearch: 0,            // 判断是否是搜索

            previewVisible: false,  // 查看图片弹窗显示隐藏
            recordMerID: '',        // 对应当前行的商家id
            recordProID: '',        // 对应当前行的商品id

            thirdJur: {},           // 权限
        }
    }

    // 图片404
    imgError = (e) => {
        e.target.src = require('../../image/img_404.png');
        e.target.setAttribute('data-error', true)
        e.target.onerror = null;
    }
    // input ===> onChange
    handleInputOnchange = (type, val) => {
        this.setState({
            [type]: val
        })
    }
    // select ===> onChange
    selectOnChange = (value) => {
        this.setState({
            business: value,
        })
    }
    // tab标签的数量
    tabNUM = (value) => {
        this.props.totalNum(value)
    }
    // 商品列表
    getGoodsList = (page_number, page_size, type) => {
        if (type == 'reset') {
            this.setState({
                name: '',
                cascaderValue: [],
                rangeDate: [null, null],
                business: 1000,
                shelves_time_start: '',
                shelves_time_end: '',
                class_id: ''
            })
        }
        this.setState({ loading: true })
        // return
        const data = {
            page_number: page_number ? page_number : this.state.page_number,
            page_size: page_size ? page_size : this.state.page_size,
            state: this.props.currentState
        }
        // 获取商品列表
        api.axiosPost('goodsList', data).then((res) => {
            if (res.data.code === 1) {
                const { goods, total, company_list, page } = res.data.data;
                goods.map((GoodItem) => {
                    GoodItem.key = GoodItem.id
                })
                this.setState({
                    dataSource: goods,
                    whole: total.whole,  //  商品总数
                    upper_shelf: total.upper_shelf,  //  已上架
                    stay_on_the_shelf: total.stay_on_the_shelf,  //  待上架
                    lower_shelf: total.lower_shelf,         //   已下架
                    company_list: company_list,
                    loading: false,
                    totalRowData: page.totalRow, // 分页总数
                    isSearch: 0,
                })
                const objNum = {
                    val1: total.whole,
                    val2: total.upper_shelf,
                    val3: total.stay_on_the_shelf,
                    val4: total.lower_shelf
                }
                this.tabNUM(objNum)
            } else {
                message.error(res.data.msg)
            }
        })
    }
    // 分类下拉
    getCate = (id, tar) => {
        const cateId = {
            id: id
        }
        // 获取分类下拉
        api.axiosPost('getCate', cateId).then((res) => {
            // id === 0 请求第一级
            if (id == 0) {
                const { data } = res.data;
                if (res.data.code === 1) {
                    this.setState({
                        classOption: data
                    })
                }
            } else if (id && id > 0) {    //  id>0  请求子集
                const { data } = res.data;
                if (res.data.code === 1) {
                    tar.loading = false;
                    tar.children = [];
                    data.map((item) => {
                        tar.children.push(item)
                    })
                    this.setState({
                        classOption: [...this.state.classOption]
                    })
                }
            }
        })
    }
    // 分类三级联动的onchange事件
    cataOnChange = (value) => {
        // console.log(value)
        const lastValue = value != '' ? value[value.length - 1].toString() : '';
        this.setState({
            class_id: lastValue,
            cascaderValue: value
        })
    }
    // 动态加载分类数据
    loadData = (selectedOptions) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const id = targetOption.id;
        targetOption.loading = true;
        this.getCate(id, targetOption)
    }
    // 上架日期
    DateChange = (dates, dateStrings) => {
        this.setState({
            shelves_time_start: dateStrings[0],
            shelves_time_end: dateStrings[1],
            rangeDate: dates
        })
    }
    // 搜索商家
    searchGoods = (pageN, pageS) => {
        this.setState({ loading: true })
        const { name, class_id, business, shelves_time_end, shelves_time_start, page_size } = this.state;
        const { currentState } = this.props;
        const data = {
            name,
            class_id,
            merchant_id: business == 1000 ? 0 : business,
            shelves_time_end,
            shelves_time_start,
            page_size: pageS ? pageS : page_size,
            page_number: pageN ? pageN : 1,
            state: currentState,
            time_type: currentState == 2 || currentState == -1 ? 0 : 1
        }
        // console.log(data)
        api.axiosPost('goodsSearch', data).then(res => {
            if (res.data.code === 1) {
                const { goods, page } = res.data.data;
                // console.log('商品数据',res)
                goods.map((GoodItem) => {
                    GoodItem.key = GoodItem.id
                })
                this.setState({
                    dataSource: goods,
                    loading: false,
                    isSearch: 1,
                    totalRowData: page.totalRow, // 分页总数
                    page_number: page.pageNumber
                })
            } else {
                message.error(res.data.msg)
            }
        }).catch(error => {
            console.log('error', error)
        })
    }
    // 切换页码 ==> 请求新一页数据
    pageOnChange = (page, pageSize) => {
        const { isSearch } = this.state;
        this.setState({
            page_number: page
        })
        /**
         * 判断是搜索筛选的数据还是全局数据 
         * isSearch === 0  请求全局数据
         * isSearch ===1   请求筛选后的数据
         *  */
        if (isSearch == 0) {
            this.getGoodsList(page)
        }
        if (isSearch == 1) {
            this.searchGoods(page)
        }
    }
    // 每一页数量改变时
    onShowSizeChange = (current, size) => {
        const { isSearch } = this.state;
        this.setState({
            page_size: size
        })
        if (isSearch == 0) {
            this.getGoodsList(current, size)
        }
        if (isSearch == 1) {
            this.searchGoods(current, size)
        }
    }
    // 创建显示日期的判断   创建时间/上架时间/下架时间
    renderDateText = () => {
        let dateText;
        switch (this.props.currentState) {
            case -1:
            case 2:
                dateText = (<span>创建时间：</span>);
                break;
            case 1:
                dateText = (<span>上架时间：</span>);
                break;
            case 0:
                dateText = (<span>下架时间：</span>);
                break;
        }
        return dateText;
    }
    // 处理弹窗关闭
    handleModalShow = (e, istrue, mid, pid) => {
        if (!e.target.hasAttribute('data-error')) {
            this.setState({
                previewVisible: istrue,
                recordMerID: mid,
                recordProID: pid
            })
        }
    }
    // 设为模板弹窗
    setTemplate = (record) => {
        let _this = this
        confirm({
        title: '设为模板',
        content: '确定将此商品设为模板？',
        okText: '确认',
        centered:true,
        icon:<Icon type="exclamation-circle" className='delet-icon'></Icon>,
        okType: '',
        cancelText: '取消',
        onOk() {
                const data = {
                    product_id : record.id,
                    title : record.title,
                    sku : '',
                    class_id : record.class_id,
                    brand : '',
                    article_number : record.article_number,
                    content : record.content,
                    type : 0,
                    merchant_id : record.merchant_id,
                }
                api.axiosPost('set_product_template',data).then(res=>{
                    if(res.data.code === 1){
                        _this.getGoodsList()
                        message.success(res.data.msg);
                        
                        
                    }else{
                        message.error(res.data.msg);
                        
                    }
                })
            }
        })
    }
    componentDidMount() {
        this.getGoodsList();
        this.getCate(0)

        const {navList} = this.props;
        // console.log('this.props.location.pathname', this.props);
        const thirdJur = Public.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }
    render() {
        const { previewVisible, recordMerID, recordProID } = this.state;
        // 分页配置
        const pagination = {
            total: this.state.totalRowData,
            current: this.state.page_number,
            pageSize: this.state.page_size,
            pageSizeOptions: ["10", "20", "30"],
            onChange: this.pageOnChange,
            showSizeChanger: true,
            onShowSizeChange: this.onShowSizeChange
        };
        const { company_list } = this.state;

        const fieldNames = { label: 'name', value: 'id', children: 'children' };
        return (
            <div>
                <Row className='line-height-30 margin-bottom-10'>
                    <Col span={24}>
                        <Input
                            className='width-200 margin-bottom-10 good-code'
                            placeholder="商品货号/标题"
                            value={this.state.name}
                            onChange={(e) => { this.handleInputOnchange('name', e.target.value) }}
                        /> &emsp;

                        <Cascader
                            placeholder="商品分类"
                            className='width-300 margin-bottom-10'
                            value={this.state.cascaderValue}
                            options={this.state.classOption}
                            fieldNames={fieldNames}
                            loadData={this.loadData}
                            changeOnSelect
                            onChange={this.cataOnChange}
                        />&emsp;
                        <Select className='width-200 margin-bottom-10 good-code' placeholder="商家" onChange={this.selectOnChange} value={this.state.business}>
                            <Option key={-111} value={1000}>请选择商家</Option>
                            {
                                company_list && company_list.map((item, index) => (
                                    <Option key={index} value={item.id}>{item.company}</Option>
                                ))
                            }
                        </Select>&emsp;
                        {
                            this.renderDateText()
                        }
                        <RangePicker
                            className='margin-bottom-10 good-code'
                            format={dateFormat}
                            onChange={this.DateChange}
                            value={this.state.rangeDate}
                        />&emsp;&nbsp;
                        <div style={{ display: 'inline-block' }} className='margin-bottom-10'>
                            <Button type='primary' onClick={() => { this.searchGoods() }}>搜索</Button>
                            <Button type="primary" style={{ marginLeft: '10px' }} onClick={() => { this.getGoodsList('', '', 'reset') }}>重置<Icon type="rollback" /></Button>
                        </div>
                    </Col>
                </Row>
                <Table
                    pagination={pagination}
                    // rowSelection={{ fixed: true }}
                    loading={this.state.loading}
                    dataSource={this.state.dataSource}
                    columns={this.state.columns}
                />

                <Modal visible={previewVisible} footer={null} onCancel={(e) => { this.handleModalShow(e, false) }}>
                    <img alt="example" style={{ width: '100%' }} src={Public.imgUrl(recordMerID, recordProID, 0, 1000)} />
                </Modal>
            </div>
        )
    }

}