import React from "react";
import { Input, Button,Select ,DatePicker,Row,Col,Icon,Table,Divider,message,Modal } from "antd";
import moment from 'moment';
import {Link} from "react-router-dom";
import api from "./../../components/api";
import publicFn from "./../../components/public";
import EditMerchantModal from './editMerchantModal';
import ExamineModal from './examineModal';
import 'moment/locale/zh-cn';
import './index.scss';
moment.locale('zh-cn');
const Option = Select.Option;
const {RangePicker} = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const { confirm } = Modal;

class Merchants extends React.Component{
    constructor(props) {
        console.log("商家",props)
        super(props);
        this.state = {
            totalNum:10000,  // 商家总数
            columns : [
                {
                    title: '商家ID',
                    dataIndex: 'id',
                    align: 'center'
                },
                {
                    title: '公司名称',
                    dataIndex: 'company',
                    align: 'center'
                },
                {
                    title: '账户',
                    dataIndex: 'phone',
                    align: 'center'
                },
                {
                    title: '联系人姓名',
                    dataIndex: 'contacter',
                    align: 'center'
                },
                {
                    title: '联系人电话',
                    dataIndex: 'contacterPhone',
                    align: 'center'
                },
                {
                    title: '经营地区',
                    dataIndex: 'address',
                    align: 'center'
                },
                {
                    title: '商品种类',
                    dataIndex: 'goods_num',
                    align: 'center'
                },
                {
                    title: '累计订单',
                    dataIndex: 'order_num',
                    align: 'center'
                },
                {
                    title: '累计销售额',
                    dataIndex: 'price_num',
                    align: 'center'
                },
                {
                    title: '注册时间',
                    dataIndex: 'regist_time',
                    align: 'center'
                },
                {
                    title: '备注',
                    dataIndex: 'remark',
                    align: 'center',
                    render: (text , record) => {
                        return text ? text : '-'
                    }
                },
                {
                    title: '状态',
                    dataIndex: 'state',
                    align: 'center'
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    // width:230,
                    align: 'center',
                    fixed: 'right',
                    render:(text,record)=>{
                        // console.log(record)
                        const { thirdJur } = this.state;
                        return(
                            <div>
                                {
                                    thirdJur[2].display ? <span><Link to={`/user/BusinessInfo/${record.id}`}>查看</Link> <Divider type="vertical" /> </span>: ''
                                }
                                
                                {
                                    record.state == '未提交' ? '' :  <div style={{display: thirdJur[3].display ? 'inline' : 'none'}}>
                                                                        <span className="editbtn" onClick={()=>{this.isShowModal('visible',true,record)}}>编辑</span>
                                                                        <Divider type="vertical" />
                                                                    </div>
                                }
                                {
                                    record.state == '待审核' ? <div style={{display: thirdJur[5].display ? 'inline' : 'none'}}>
                                                                <span className="editbtn" onClick={()=>{this.isShowExamineModal('examineVisable',true,record)}}>审核</span> 
                                                                <Divider type="vertical" />
                                                               </div> : '' 
                                }
                                {
                                    thirdJur[4].display ? <span className="editbtn" onClick={()=>{ this.resetAcountPWDModal(record) }}>重置密码</span> : ''
                                }
                                
                            </div>
                        )
                    }
                }, 
            ],
            data:[],         // 表格数据
            visible: false,  // 控制弹出层的显示与隐藏
            examineVisable: false,
            
            singleRowData: {}, //  编辑弹窗单条数据
            singleExaminData: {}, //  审核弹窗单条数据
            name:'',    //   搜索内容
            state:undefined,    //  审批状态
            regist_time_start:'', // 注册开始时间
            regist_time_end:'',  // 注册结束时间
            dateRange: [null,null] , // 日期范围
            page_number:1,  // 页码
            page_size:10,    // 每页数量
            tabloading:false, // 表格加载状态
            totalRowNum: '',  // 分页总数
            isSearch: 0,
            thirdJur: {},     // 三级权限
        }
    }
    componentDidMount(){
        const {navList} = this.props;
        const thirdJur = publicFn.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }

    // 控制编辑弹窗显示与隐藏
    isShowModal = (type,isTrue,record) =>{
        this.setState({
            [type]:isTrue,
            singleRowData: record
        },()=>{
            this.editModal.handelRowData(record)
        });
    }
    // 
    isShowExamineModal = (type,isTrue,record) => {
        this.setState({
            [type] : isTrue,
        },()=>{
            this.refs.exanineModal.handelParents(record)
        })
    }
    // input =====》 onChange
    handelInputOnChange = (type,value)  => {
        this.setState({
            [type]: value
        })
    }
    // select ====> onChange
    handelSelectOnChange = (value,option) => {
        this.setState({
            state:parseInt(value)
        })
    }
    // 日期
    DateChange = (dates,dateStrings) =>{
        // console.log('dates',dates,'----------','dateStrings',dateStrings)
        this.setState({
            regist_time_start:dateStrings[0],
            regist_time_end:dateStrings[1],
            dateRange: dates
        })
    }
    // 商家列表数据获取
    merchantList = (pageN,pageS,type) => {
        // 点击重置按钮的操作
        if(type == 'reset'){
            this.setState({
                name: '',
                state: undefined,
                dateRange: [null,null],
                regist_time_start: "",
                regist_time_end: ""
            })
        }

        const {page_number,page_size} = this.state;
        const data = {
            page_number:pageN ? pageN : page_number,
            page_size: pageS ? pageS : page_size
        }
        api.axiosPost('businessList',data).then((res,req) => {
            // console.log('pageres',res)
            if(res.data.code === 1){
                const {result,page} = res.data.data;
                // console.log('data',data)
                result.map((item)=>{
                    item.key = item.id
                });
                this.setState({
                    data : result,
                    tabloading:false,
                    totalRowNum:page.totalRow,
                    isSearch: 0,
                    totalNum: page.totalRow
                })
            }else {
                message.error(res.data.msg);
            }
        })
    }
    // 搜索
    handelSearch = (pageN,pageS) => {
        this.setState({tabloading:true})
        const {name,state,regist_time_start,regist_time_end,page_number,page_size} = this.state;
        const data = {
            name,
            state: state === undefined ? -1000 :state,
            regist_time_start:regist_time_start.replace(/\s*/g,""),
            regist_time_end:regist_time_end.replace(/\s*/g,""),
            page_number:pageN ? pageN : 1,
            page_size: pageS ? pageS : page_size
        }
        // console.log(data)
        api.axiosPost('businessSearch',data).then((res,req) => {
            // console.log(res)
            const {page,result} = res.data.data
            if(res.data.code === 1){
                result.map( (item,index) => {
                    item.key = item.id
                })
                this.setState({
                    data:result,
                    tabloading:false,
                    totalRowNum:page.totalRow,
                    isSearch: 1,
                    totalNum: page.totalRow,
                    page_number:page.pageNumber
                })
            }
        })
    }
    // 切换分页
    pageOnChange = (page, pageSize)=>{
        // console.log(page,pageSize,this.state.isSearch)
        const {isSearch} = this.state;
        this.setState({
            page_number:page
        })
        if(isSearch == 0){
            this.merchantList(page)
        }
        if(isSearch == 1){
            this.handelSearch(page)
        }
    }
    // 页码改变
    onShowSizeChange = (current,size) => {
        // console.log(current,size)
        const {isSearch} = this.state;
        this.setState({
            page_size:size
        })
        if(isSearch == 0){
            this.merchantList(current,size)
        }
        if(isSearch == 1){
            this.handelSearch(current,size)
        }
    }
    componentWillMount(){
        this.merchantList()
    }
    // 重置密码的操作
    resetAcountPWDModal = (record) => {
        confirm({
        title: '确定要重置密码么',
        content: '重置之后的密码为123456。',
        okText: '确认',
        okType: '',
        cancelText: '取消',
        onOk() {
            return new Promise((resolve, reject) => {
                api.axiosPost('businessResetPwd',{id:record.id}).then(res=>{
                    console.log(res)
                    if(res.data.code){
                        message.success('重置成功！');
                        resolve(true);
                    }else{
                        message.error('重置失败');
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
    render(){
        const {totalNum} = this.state;
        // 编辑弹框的props
        const modalObj = {
            display: this.state.visible,
            hideModal: this.isShowModal,
            merchantList: this.merchantList,
            isSearch: this.state.isSearch,
            handelSearch: this.handelSearch
        }
        // 审核弹框的props
        const exanineModal = {
            display: this.state.examineVisable,
            hideModal: this.isShowExamineModal,
            merchantList: this.merchantList,
            isSearch: this.state.isSearch,
            handelSearch: this.handelSearch
        }
        // 分页配置
        const pagination={
            total:this.state.totalRowNum,
            current:this.state.page_number,
            pageSize:this.state.page_size,
            pageSizeOptions:["10","20","30"],
            onChange:this.pageOnChange,
            showSizeChanger: true,
            onShowSizeChange:this.onShowSizeChange
        };
        return(
            <div className="merchant-list-box">
                <h4 className='h4-title'>商家列表</h4>
                <Row className="line-height-30 margin-bottom-30">
                    <Col span={24} className="form-box">
                        <div>
                            商家信息：
                            <Input 
                                className="width-300 " 
                                value={this.state.name}
                                onChange={(e)=>{this.handelInputOnChange('name',e.target.value)}} 
                                placeholder="商家ID/账户/公司名称/联系人/电话">
                            </Input>
                        </div>
                        <div>
                            状态：
                            <Select className="width-200"  value={this.state.state} onChange={this.handelSelectOnChange} placeholder="请选择">
                                {/* <Option value={1000}>请选择状态</Option> */}
                                <Option value={-101}>禁用</Option>
                                <Option value={-2}>未提交</Option>
                                <Option value={-1}>审批驳回</Option>
                                <Option value={0}>待审核</Option>
                                <Option value={1}>审批通过</Option>
                                <Option value={101}>审批通过(未登录)</Option>
                            </Select>
                        </div>
                        <div>
                            注册时间：
                            <RangePicker
                                value={this.state.dateRange}
                                format={dateFormat}
                                onChange = {this.DateChange}
                            />
                        </div>
                        <div className="btn-box">
                            <Button type="primary" onClick={()=>(this.handelSearch())}>搜索</Button>
                        </div>
                        <div className="btn-box">
                            <Button type="primary" onClick={()=>{this.merchantList('','','reset')}}>重置<Icon type="rollback" /></Button>
                        </div>
                    </Col>
                </Row>

                <div className="merchant-nums margin-bottom-10">
                    <Icon type="info-circle" className="iconColor"/>&nbsp;商家总数：<em>{totalNum}</em>个
                </div>

                <div className="tab-box">
                    <Table 
                        dataSource={this.state.data} 
                        columns={this.state.columns}
                        bordered
                        scroll={{ x: 2000 }}
                        pagination={pagination}
                        loading={this.state.tabloading}
                    />
                    
                    {/* <div className="batch-operation">
                        <Button className="batch-btn">批量禁用</Button>
                        <Button className="batch-btn">批量启用</Button>
                        <Button className="batch-btn">批量通过</Button>
                    </div> */}
                </div>
                <EditMerchantModal {...modalObj} wrappedComponentRef={(e)=>{this.editModal = e}}/>
                <ExamineModal {...exanineModal} ref="exanineModal"/>
            </div>
        )
    }

}

export default Merchants;