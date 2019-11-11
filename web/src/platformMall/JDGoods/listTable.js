import React from "react";
import { Table, Row, Col, Button, Input, Select, DatePicker, Form, Modal, Divider, Cascader, Icon, message } from "antd";
import { Link } from 'react-router-dom';
import TemplateModal from './templateModal'
import api from "./../../components/api";
import Public from "./../../components/public";

import "./index.scss"
class ListTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],  //  表格数据
            totalGoodsNum: '',
            columns: [
                {
                    title: '商品编号',
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
                    title: '主标题',
                    dataIndex: 'title',
                    align: 'center'
                },
                {
                    title: '商品分类',
                    dataIndex: 'class_name',
                    align: 'center'
                },
                {
                    title: '商家',
                    dataIndex: 'merchants',
                    align: 'center',
                    render: () => {
                        return '京东';
                    }
                },
                {
                    title: '京东价',
                    dataIndex: 'jd_price',
                    align: 'center'
                },
                {
                    title: '协议价',
                    dataIndex: 'anmro_price',
                    align: 'center'
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
                                    thirdJur[18].display ? <Link to={`/platform/commodityDetails/${record.product_id}`}>查看</Link> : ''
                                }
                                <Divider type="vertical" />
                                <span onClick={()=>{this.isShowModal('visible',true,record)}}>设为模板</span>
                            </div>
                        )
                    }
                },
            ],
            loading: false,
            visible: false,  // 控制弹出层的显示与隐藏
            page_size: 10,    //  每页显示数量
            page_number: 1,   // 当前页码
            JDcataArr: [],   // 京东商品分类
            cascaderValue: [],  //  级联选择器的value
            class_id: '',    //  默认分类id
            keyword: '',     //  商品编号 / 名称
            cid1: '',  // 第一级分类id
            cid2: '',  // 第二级分类id

            thirdJur: {},       // 权限
        }

    }

    render() {
        // 分页配置
        const pagination = {
            total: this.state.totalGoodsNum,
            current: this.state.page_number,
            pageSize: this.state.page_size,
            pageSizeOptions: ["10", "20", "30"],
            onChange: this.pageOnChange,
            showSizeChanger: true,
            onShowSizeChange: this.onShowSizeChange
        };
        const { RangePicker } = DatePicker;
        // 弹框数据
        const modalObj = {
            display: this.state.visible,
            singleRowData : this.state.singleRowData,
            hideModal: this.isShowModal,
            getList : this.searchGoodsAndShowList,
        }
        //表格全选
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                //   console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
                name: record.name,
            }),
        };
        // 分类属性名
        const fieldNames = { label: 'name', value: 'id', children: 'children' };
        return (
            <div className='jd-content-box'>
                <Row className='line-height-30 margin-bottom-10'>
                    <Col span={24}>
                        <Input
                            className='width-200'
                            placeholder="名称"
                            value={this.state.keyword}
                            onChange={(e) => { this.handleInputOnchange('keyword', e.target.value) }}
                        /> &emsp;

                        <Cascader
                            placeholder="请选择分类"
                            className='width-300'
                            value={this.state.cascaderValue}
                            options={this.state.JDcataArr}
                            fieldNames={fieldNames}
                            loadData={this.loadData}
                            changeOnSelect
                            onChange={this.cataOnChange}
                        />&emsp;
                        <Button type='primary' onClick={() => { this.searchGoodsAndShowList() }}>搜索</Button>
                        <Button
                            type="primary"
                            style={{ marginLeft: '10px' }}
                            onClick={() => { this.searchGoodsAndShowList('', '', true, 'reset') }}
                        >重置<Icon type="rollback" /></Button>
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
                    pagination={pagination}
                    // rowSelection={rowSelection}
                    loading={this.state.loading}
                    dataSource={this.state.dataSource}
                    columns={this.state.columns}
                />
                <TemplateModal {...modalObj} wrappedComponentRef={(e)=>{this.merchantModal = e}}/>
            </div>
        )
    }
    // 控制模板弹窗显示与隐藏
    isShowModal = (type,isTrue,record) =>{
        this.setState({
            [type]:isTrue,
            singleRowData: record
        });
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
    //搜索按钮
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
            }
        });
    };
    //  动态获取京东分类
    loadData = (selectedOptions) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        // console.log(selectedOptions)
        const level = selectedOptions.length;
        const id = targetOption.id;
        targetOption.loading = true;
        this.getJDcata(id, targetOption, level)
    }
    // 请求京东分类
    getJDcata = (id, tar, level) => {
        const cateId = {
            parent_id: id
        }
        api.axiosPost('JDgoodsCate', cateId).then((res) => {
            if (id == 0) {
                // console.log('京东商品',res)
                const { data } = res.data;
                if (res.data.code === 1) {
                    data.map(item => {
                        item.isLeaf = false
                    })
                    this.setState({
                        JDcataArr: data
                    })
                }
            } else if (id && id > 0) {
                const { data } = res.data;
                if (res.data.code === 1) {
                    tar.loading = false;
                    if (level <= 2) {
                        tar.children = [];
                    }
                    data.map((item) => {
                        item.isLeaf = level >= 2 ? true : false;
                        tar.children.push(item)
                    })

                    this.setState({
                        JDcataArr: [...this.state.JDcataArr]
                    })
                }
            }
        })
    }
    // 搜索商家  以及  商家列表
    searchGoodsAndShowList = (pageN, pageS, isOverall, type) => {
        if (type == 'reset') {
            this.setState({
                cascaderValue: [],  //  级联选择器的value
                class_id: '',    //  默认分类id
                keyword: '',     //  商品编号 / 名称
                cid1: '',
                cid2: '',
            })
        }
        this.setState({ loading: true })

        const { keyword, class_id, page_number, page_size, cascaderValue } = this.state;
        
        if(!isOverall){
            if(cascaderValue.length<2){
                cascaderValue.push('','')
            }else if(cascaderValue.length<3){
                cascaderValue.push('')
            }
        }
        //console.log(111,cascaderValue);
        
        let data = {
            keyword: isOverall ? '' : keyword,
            class_id: isOverall ? '' : cascaderValue[2].toString(),
            page_size: pageS ? pageS : page_size,
            page_number: pageN ? pageN : 1,
            cid1: isOverall ? '' : cascaderValue[0].toString(),
            cid2: isOverall ? '' : cascaderValue[1].toString(),
        }
        api.axiosPost('JDgoodsSearch', data).then(res => {
            // console.log('res',res)
            if (res.data.code === 1) {
                /* 
                    list:商品信息
                    page_number: 当前页
                    page_size: 每一页数据条数
                    total_page: 总页数
                    total_row: 商品总数
                */
                const { list, page_number, page_size, total_page, total_row } = res.data.data;
                // console.log('商品数据',res.data)
                list.map((GoodItem) => {
                    GoodItem.key = (+GoodItem.product_id)
                })
                this.setState({
                    dataSource: list,
                    loading: false,
                    isSearch: isOverall ? 0 : 1,
                    totalGoodsNum: total_row, // 分页总数
                    page_number,
                })
                this.showTotalNum(total_row);
            } else {
                message.error(res.data.msg)
            }
        }).catch(error => {
            message.error(<span>请求超时，请按<b style={{ color: "red" }}>F5</b>手动刷新</span>)
            this.setState({
                loading: false
            })
        })
    }
    // 在父组件中显示总数据
    showTotalNum = (num) => {
        this.props.totalNum(num)
    }
    // 切换分页
    pageOnChange = (page, pageSize) => {
        // console.log(page,pageSize)

        const { isSearch } = this.state;
        this.setState({
            page_number: page
        })
        if (isSearch == 0) {
            this.searchGoodsAndShowList(page, '', true);
        }

        if (isSearch == 1) {
            this.searchGoodsAndShowList(page);
        }


    }
    // 页码改变
    onShowSizeChange = (current, size) => {
        // console.log(current,size)
        const { isSearch } = this.state;
        this.setState({
            page_size: size
        })
        if (isSearch == 0) {
            this.searchGoodsAndShowList(current, size, true);
        }
        if (isSearch == 1) {
            this.searchGoodsAndShowList(current, size);
        }

    }

    componentDidMount() {

        const {navList} = this.props;
        const thirdJur = Public.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });

        this.getJDcata(0);
        this.searchGoodsAndShowList('', '', true)
    }
}
export default Form.create()(ListTable)