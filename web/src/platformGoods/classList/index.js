import React from "react";
import {Table,Input,Select,Button,Row,Col,message,Switch} from "antd"
import api from "./../../components/api";
import AddClass from "./../goodsClass"
import "./index.scss";
import {inject, observer} from "mobx-react";
const Option = Select.Option;
@inject("store")
@observer
class ClassList extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state={
            columns:[
                {
                    title: '编号',
                    dataIndex: 'id',
                },
                {
                    title: '分类名称',
                    dataIndex: 'name',
                },
                {
                    title: '级别',
                    dataIndex: 'address',
                },
                {
                    title: '商品数量',
                    dataIndex: 'number',
                },
                {
                    title: '导航栏显示',
                    dataIndex: 'isIndexMenu',
                    render:(text,record)=>{
                        return(
                            <Switch checked={text} onChange={()=>{this.listSwitch(record)}}/>
                        )
                    }
                },
                {
                    title: '排序',
                    dataIndex: 'sort',
                    render:(text,record)=>{
                        return(
                            <Input onBlur={(e)=>{this.classSort(e.target.value,record)}} className='width-50' defaultValue={text}/>
                        )
                    }
                },
                {
                    title: '属性参数',
                    dataIndex: 'attribute',
                    render:(text,record)=>{
                        let content="";
                        if(record.id > 9999){
                            content = "属性列表"
                        }
                        return(
                            <span>{content}</span>
                        )
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    render:(text,record)=>{
                        return(
                            <div>
                                <span onClick={()=>{this.isAddModal("addClassModal",true,record)}}>新增下级</span>&nbsp;|
                                <span>转移商品</span>&nbsp;|
                                <span>编辑</span>&nbsp;|
                                <span>删除</span>
                            </div>
                        )
                    }
                }
            ],
            data:[],
            parent:1,
            addClassModal:false
        }
    }

    componentDidMount() {
        this.getList()
    }

    //列表开关
    listSwitch=(record)=>{
         const {data} = this.state;
        if(record.id>99){
            record.isIndexMenu = !record.isIndexMenu;
            const ajaxData={
                is_index_menu:record.isIndexMenu ? 1 : 0,
                id:record.id
            };
            api.axiosPost("productClassSetIndexMenu",ajaxData).then((res)=>{
                if(res.data.code == 1){
                    message.success(res.data.msg);
                    this.setState({data});
                }else{
                    message.error(res.data.msg);
                }
            })
        }else{
            message.error("一级分类不能关闭");
        }
    };
    //分类排序
    classSort=(value,record)=>{
        const {data} = this.state;
        const ajaxData={
            id:record.id,
            sort:parseInt(value)
        };
        if(value != record.sort){
            api.axiosPost("productClassSetSort",ajaxData).then((res)=>{
                if(res.data.code == 1){
                    message.success(res.data.msg);
                    this.setState({data});
                }else{
                    message.error(res.data.msg)
                }
            })
        }
    };
    //获取分类列表
    getList=()=>{
        const {store} = this.props;
        const {parent} = this.state;
        const data={parent};
        api.axiosPost("productClassGetList",data).then((res)=>{
            if(res.data.code == 1){
                const data = res.data.data;
                data.map( (item)=>{
                    item.key = item.id;
                    item.children=[]
                } );
                this.setState({
                    data:data
                })
            }else if(res.data.code == -1006){
                message.error(res.data.msg);
                store.LoginStatus.isDisplay();
            }else{
                message.error(res.data.msg);
            }
        })
    };
    //隐藏显示分类
    isAddModal=(type,isTrue,record)=>{
        if(record && record.id >= 99999){
            message.error("三级分类不能添加子分类");
            return;
        }

        this.setState({
            [type]:isTrue
        },()=>{
            if(type == "addClassModal" && isTrue){
                const addClassModal = this.refs.addClassModal;
                addClassModal.superiorDate(record);
            }
        });
    };

    //查询子节点
    queryChildren=(expanded, record)=>{
        const{store} = this.props;
        if(expanded){
            const {data} = this.state;
            const parent = record.id;
            api.axiosPost("productClassGetList",{parent}).then((res)=>{
                if(res.data.code == 1){
                    const childrenData = res.data.data;
                    childrenData.map((item)=>{
                        item.key = item.id;
                        item.children = []
                    });
                    record.children=childrenData;
                    this.setState({
                        data:data
                    })
                }else if(res.data.code == -1006){
                    message.error(res.data.msg);
                    store.LoginStatus.isDisplay();
                }else{
                    message.error(res.data.msg);
                }
            })
        }
    };

    render(){
        const {columns,data} = this.state;
        const addClassDate={
            display:this.state.addClassModal,
            hideModal:this.isAddModal
        };
        return(
            <div className='class-list-box'>
                <Row className='line-height-30 margin-bottom-10'>
                    <Col span={24}>
                        分类名称/商品编号：
                        <Input className='width-200' placeholder="分类名称/商品编号"/> &emsp;
                        分类级别：
                        <Select className='width-200'  placeholder="分类级别">
                            <Option value={1}>一级分类</Option>
                            <Option value={2}>二级分类</Option>
                            <Option value={3}>三级分类</Option>
                        </Select>

                        <Button onClick={()=>{this.isAddModal("addClassModal",true)}}>添加一级分类</Button>
                    </Col>
                </Row>
                <div className="table-box">
                    <Table onExpand={(expanded, record)=>{this.queryChildren(expanded, record)}} columns={columns} dataSource={data} />
                </div>

                <AddClass {...addClassDate} ref='addClassModal'/>
            </div>
        )
    }

}

export default ClassList;