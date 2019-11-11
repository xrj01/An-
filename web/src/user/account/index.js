
import React from "react";
import { Input, Button, DatePicker, Row, Col, Icon, Table, Divider, Cascader, message, Empty, Modal } from "antd";
import moment from 'moment';
import { Link } from "react-router-dom";
import AddEditModal from './addeditModal';
import { createHashHistory } from 'history';
import api from './../../components/api';
import publicFn from "./../../components/public";
import './index.scss';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD'; // 规定日期选择器的格式
const history = createHashHistory();
const { confirm } = Modal;


class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 列表表头信息
            columns: [
                {
                    title: '公司ID',
                    dataIndex: 'company_id',
                    align: 'center'
                },
                {
                    title: '公司名称',
                    dataIndex: 'company_name',
                    align: 'center'
                },
                {
                    title: '账户名',
                    dataIndex: 'username',
                    align: 'center'
                },
                {
                    title: '手机号',
                    dataIndex: 'phone',
                    align: 'center'
                },
                {
                    title: '地区',
                    dataIndex: 'adress',
                    align: 'center'
                },
                {
                    title: '子级账户(个)',
                    dataIndex: 'son_num',
                    align: 'center'
                },
                {
                    title: '创建时间',
                    dataIndex: 'create_time',
                    align: 'center'
                },
                {
                    title: '项目统计',
                    dataIndex: 'project_num',
                    align: 'center'
                },
                {
                    title: '授信额度（元）',
                    dataIndex: 'credit',
                    align: 'center'
                },
                {
                    title: '账户状态',
                    dataIndex: 'state',
                    align: 'center'
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    align: 'center',
                    render: (text, record) => {
                        const { thirdJur } = this.state;
                        return (
                            <div>
                                {
                                    thirdJur[7].display ? <span>
                                                            <Link to={{ pathname: '/user/account/EnterpriseAccountInfo', state: { id: record.id, company_id: record.company_id } }}>查看</Link>
                                                            <Divider type="vertical" />
                                                          </span> : ''
                                }
                                {
                                    thirdJur[8].display ? <span>
                                                            <span className="editbtn" onClick={() => { this.isShowModal('visible', true, record, 0) }}>编辑</span>
                                                            <Divider type="vertical" />
                                                          </span> : ''
                                }
                                {
                                    thirdJur[9].display ? <span>
                                                            <span className="editbtn" onClick={()=>{ this.resetAcountPWDModal(record.id) }}>重置密码</span>
                                                          </span> : ''
                                }
                                <Divider type="vertical" />
                                <span onClick={()=>{this.enterAcc(record.id, record.company_id)}} className='category'>类目管理</span>
                            </div>
                        )
                    }
                }
            ],
            // 表格数据
            tableData: [],
            tableLoading: false,  //  表格是否在加载中
            visible: false,        //  新建账户和编辑账户弹窗的操作
            isAddNew: 0,           //  判断是编辑弹窗还是新建弹窗
            areaOptions: [],       //  搜索-->省市的数据
            page_number: 1,        //  当前页码
            page_size: 10,         //  每页显示数量
            accountTotalNum: 0,    //  总数据量
            dateRange: [null, null],         //  时间范围
            isSearch: 0,           //  当前是 全局展示 还是 搜索展示
            cascaderValue: [],     //  级联的值
            // ------------------- 搜索关键词
            name: '',              //  公司名称/账户/名称
            address: '',           //  地址
            start_time: '',        //  开始时间
            end_time: '',          //  结束时间
            thirdJur: {},          // 三级权限
        }
        // 子组件实例的方法
        this.child = ''
    }
    //
    enterAcc = (id, cid) =>{
        sessionStorage.setItem('activekey',7)
        sessionStorage.setItem('accountID',id)
        sessionStorage.setItem('company_id',cid)
        history.push({pathname:'/user/account/EnterpriseAccountInfo'})

    }
    // input ===> onChange
    handleInputOnchange = (type, val) => {
        this.setState({
            [type]: val
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
    // 控制弹窗的显示与隐藏
    isShowModal = (type, isTrue, record, isAdd) => {
        this.setState({
            [type]: isTrue,
            isAddNew: isAdd,
        }, () => {
            // console.log(record)
            if (!isAdd && isTrue) {
                this.child.handelEditParentData(record.id, record.company_id);
            }
        })

    }
    // 地址改变的操作
    handleAreaChange = (value) => {
        let defaultArr = ['______', '______', '______'];
        // console.log('value', value);
        const Arr = defaultArr.slice(value.length);
        const areaArr = value.concat(Arr).toString();
        this.setState({
            address: value.length ? areaArr : '',
            cascaderValue: value
        })
    }
    // 动态加载市区
    loadData = (selectedOptions) => {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const id = targetOption.id;
        targetOption.loading = true;
        // 根据当前的id请求下一级地区集合
        this.getAreas(id, targetOption);
    }
    // 获取省市区
    getAreas = (id = 0, tar) => {
        const data = { parent_id: id };
        api.axiosPost('getAreas', data).then(res => {
            const { data } = res.data;
            if (res.data.code === 1) {
                if (id === 0) {
                    this.setState({
                        areaOptions: data
                    })
                } else if (id > 0) {
                    tar.loading = false;
                    tar.children = [];
                    data.map((item) => {
                        item.isLeaf = true;
                        tar.children.push(item);
                    })
                    this.setState({
                        areaOptions: [...this.state.areaOptions]
                    })
                }
            }
        })
    }
    // 获取企牛采账户列表
    getUserAccount = (pageN, pageS, isOverall = true, reset) => {
        if (reset) {
            this.setState({
                name: '',
                cascaderValue: [],
                dateRange: [null, null]
            })
        }
        const { name, address, start_time, end_time, page_number, page_size } = this.state;
        const data = {
            name: isOverall ? '' : name,
            page_number: pageN ? pageN : page_number,
            page_size: pageS ? pageS : page_size,
            address: isOverall ? '' : address,
            start_time: isOverall ? '' : start_time,
            end_time: isOverall ? '' : end_time
        }
        api.axiosPost('qiniuAccoutList_search', data).then(res => {
            // console.log(res);
            if (res.data.code === 1) {
                const { page, result } = res.data.data;
                result.map((item) => {
                    item.key = (+item.id)
                })
                this.setState({
                    tableData: result,
                    accountTotalNum: page.totalRow,
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
        this.setState({
            page_number: page
        })
        if (isSearch == 0) {
            this.getUserAccount(page, '');
        }
        if (isSearch == 1) {
            this.getUserAccount(page, '', false);
        }
    }
    // 页码改变
    onShowSizeChange = (current, size) => {
        const { isSearch } = this.state;
        this.setState({
            page_size: size
        })
        if (isSearch == 0) {
            this.getUserAccount(current, size);
        }
        if (isSearch == 1) {
            this.getUserAccount(current, size);
        }
    }
    // 得到子组件的方法
    onRef = (ref) => {
        this.child = ref
    }
    componentDidMount() {
        this.getUserAccount('', '', true);  //  首次获取列表数据
        this.getAreas(); // 获取分类省市区

        const {navList} = this.props;
        // console.log('this.props.location.pathname', this.props.location.pathname);
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }
    // 重置密码的操作
    resetAcountPWDModal = (id) => {
        confirm({
            title: '确定要重置密码么',
            content: '重置之后的密码为123456。',
            okText: '确认',
            okType: '',
            cancelText: '取消',
            onOk() {
                return new Promise((resolve, reject) => {
                    api.axiosPost('accountResetPwd', { id: id }).then(res => {
                        // console.log(res)
                        if (res.data.code === 1) {
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
    }

    render() {
        const { accountTotalNum, page_number, page_size, dateRange, name, areaOptions, cascaderValue, thirdJur } = this.state;
        console.log('thirdJur', thirdJur);
        // 分页配置
        const pagination = {
            total: accountTotalNum,
            current: page_number,
            pageSize: page_size,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "30", "40"],
            onChange: this.pageOnChange,
            onShowSizeChange: this.onShowSizeChange
        };
        // 新建账户和编辑账户弹框所需props
        const addClassDate = {
            display: this.state.visible,
            hideModal: this.isShowModal,
            isAddNew: this.state.isAddNew,
            isSearch: this.state.isSearch,
            refresh: this.getUserAccount
        };
        const fieldNames = { label: 'name', value: 'id', children: 'children' };

        return (
            <div className="account-box">
                <h4 className='h4-title'>企牛采账户列表</h4>
                <Row className="line-height-30 margin-bottom-30">
                    <Col span={24} className='search-box'>
                        <div className="info">
                            公司名称：
                            <Input className="width-200" onChange={(e) => { this.handleInputOnchange('name', e.target.value) }} value={name} placeholder="公司名称/账户/名称"></Input>
                        </div>
                        <div>
                            地区：
                            <Cascader
                                placeholder="请选择省市"
                                options={areaOptions}
                                fieldNames={fieldNames}
                                loadData={this.loadData}
                                changeOnSelect
                                value={cascaderValue}
                                onChange={this.handleAreaChange}
                            />
                        </div>
                        <div>
                            创建时间：
                            <RangePicker
                                value={dateRange}
                                format={dateFormat}
                                onChange={this.DateChange}
                            />
                        </div>
                        <div className="btn-box">
                            <Button type="primary" onClick={() => { this.getUserAccount('', '', false) }}>搜索</Button>
                            <Button type="primary" onClick={() => { this.getUserAccount('', '', true, true) }}>重置<Icon type="rollback" /></Button>
                        </div>
                    </Col>
                </Row>

                <div className="merchant-nums margin-bottom-10 clearfix">
                    <Icon type="info-circle" className="iconColor" />&nbsp;商家总数：<em>{accountTotalNum}</em>个
                    <div className="addNew">
                        {
                           Object.keys(thirdJur).length && thirdJur[6].display ? <Button type="primary" size="small" onClick={() => { this.isShowModal("visible", true, "", 1) }}>新建账户</Button> : ''
                        }
                    </div>
                </div>

                <div className="tab-box">
                    <Table
                        dataSource={this.state.tableData}
                        columns={this.state.columns}
                        bordered
                        className='table'
                        hideDefaultSelections={true}
                        pagination={pagination}
                        loading={this.state.tableLoading}
                    // locale={{ emptyText: empty }}
                    />
                </div>
                <AddEditModal {...addClassDate} wrappedComponentRef={(e) => { this.addSub = e }} onRef={this.onRef}></AddEditModal>
            </div>

        )
    }
}

export default Account;