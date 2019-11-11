import React from "react";
import { Table, Input, Select, Button, Row, Col, message, Switch, Icon, Divider } from "antd"
import api from "./../../components/api";
import Public from "./../../components/public";
import AddClass from "./addModal"
import "./index.scss";
const Option = Select.Option;
class ClassList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columns: [
                {
                    title: '编号',
                    dataIndex: 'id',
                },
                {
                    title: '分类名称',
                    dataIndex: 'name',
                },
                {
                    title: '商品数量',
                    dataIndex: 'number',
                },
                {
                    title: '导航栏显示',
                    dataIndex: 'is_index_menu',
                    render: (text, record) => {

                        const switchDom = [];
                        if (record.id > 99) {
                            switchDom.push(<Switch key={record.id} checked={text} onChange={() => { this.listSwitch(record) }} />)
                        }
                        return (<div>{switchDom}</div>)
                    }
                },
                {
                    title: '排序',
                    dataIndex: 'sort',
                    render: (text, record) => {
                        return (
                            <Input onBlur={(e) => { this.classSort(e.target.value, record) }} className='width-50' defaultValue={text} />
                        )
                    }
                },
                {
                    title: '分类显示',
                    dataIndex: 'display',
                    render: (text) => {
                        return (
                            <span>{text ? "显示" : "隐藏"}</span>
                        )
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    render: (text, record) => {
                        const { thirdJur } = this.state;
                        return (
                            <div className='operation-box'>
                                {
                                    thirdJur[21].display ?
                                        <span style={{ display: record.id > 9999 ? "none" : "inline-block" }} onClick={() => { this.isAddModal("addClassModal", true, record, 'add') }}>新增下级<Divider type="vertical" /></span> : ''
                                }
                                {
                                    thirdJur[22].display ?
                                        <span onClick={() => { this.isAddModal("addClassModal", true, record, 'edit') }}>编辑</span> : ''
                                }
                            </div>
                        )
                    }
                }
            ],
            data: [],
            parent: 1,
            addClassModal: false,
            isAdd: "add",
            classTotal: [0, 0, 0],
            saveRecord: null,
            addLevel: false,
            thirdJur: {}
        }
    }

    componentDidMount() {
        this.getList();
        this.getClassProductCount();

        const { navList } = this.props;
        const thirdJur = Public.thirdPermissions(navList, this.props.location.pathname)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });
    }

    //列表开关
    listSwitch = (record) => {
        const { data } = this.state;
        record.is_index_menu = !record.is_index_menu;
        const ajaxData = {
            is_index_menu: record.is_index_menu ? 1 : 0,
            id: record.id
        };
        api.axiosPost("productClassSetIndexMenu", ajaxData).then((res) => {
            if (res.data.code == 1) {
                message.success(res.data.msg, .5);
                this.setState({ data });
            }
        })
    };
    //分类排序
    classSort = (value, record) => {
        const ajaxData = {
            id: record.id,
            sort: parseInt(value)
        };
        if (value != record.sort) {
            api.axiosPost("productClassSetSort", ajaxData).then((res) => {
                if (res.data.code == 1) {
                    message.success(res.data.msg);
                    this.getList();
                }
            })
        }
    };
    //获取分类列表
    getList = () => {
        const { parent } = this.state;
        const data = { parent };
        api.axiosPost("productClassGetList", data).then((res) => {
            if (res.data.code == 1) {
                const data = res.data.data;
                data.map((item) => {
                    item.key = item.id;
                    item.children = []
                });
                this.setState({
                    data: data
                })
            }
        })
    };
    //隐藏显示分类
    isAddModal = (type, isTrue, record, isAdd, addLevel) => {
        if (isAdd == "add" && record && record.id >= 99999) {
            message.error("三级分类不能添加子分类");
            return;
        }
        this.setState({
            [type]: isTrue,
            isAdd,
            addLevel
        }, () => {
            const addClassModal = this.refs.addClassModal;
            if (type == "addClassModal" && isTrue && isAdd == "add") {
                addClassModal.superiorDate(record);
            }
            if (type == "addClassModal" && isTrue && isAdd == "edit") {
                addClassModal.editDate(record)
                this.setState({
                    saveRecord: record ? record : null
                })
            }
        });
    };
    //获取分类数量统计
    getClassProductCount = () => {
        api.axiosPost('getClassProductCount').then((res) => {
            if (res.data.code == 1) {
                this.setState({
                    classTotal: res.data.data
                })
            }
        })
    };
    //查询子节点
    queryChildren = (expanded, record) => {
        if (expanded) {
            const { data } = this.state;
            const parent = record.id;
            api.axiosPost("productClassGetList", { parent }).then((res) => {
                if (res.data.code == 1) {
                    const childrenData = res.data.data;
                    childrenData.map((item) => {
                        item.key = item.id;
                        if (parent < 999) {
                            item.children = []
                        }
                    });
                    record.children = childrenData;
                    this.setState({
                        data: data
                    })
                }
            })
        }
    };
    //编辑成功后对数据进行更新 -- 不从后台重新获取
    editRefresh = (record, type) => {
        const { data, saveRecord } = this.state;
        if (type == "edit") {
            saveRecord.display = record.display == 1 ? true : false;
            saveRecord.is_index_menu = record.is_index_menu == 1 ? true : false;
            saveRecord.name = record.name;
        } else {
            record.key = record.id;
            record.sort = 0;
            record.display = record.display == 1 ? true : false;
            record.is_index_menu = record.is_index_menu == 1 ? true : false;
            const id = record.id;
            if (id > 0 && id < 100) {
                record.children = [];
                data.unshift(record)
            } else if (id > 100 && id < 10000) {
                const parent = parseInt(record.id / 100);
                record.children = [];
                data.map((item) => {
                    if (item.id == parent) {
                        item.children.unshift(record)
                    }
                })
            } else {
                const progenitor = parseInt(record.id / 10000);
                const parent = parseInt(record.id / 100);
                data.map((item) => {
                    if (item.id == progenitor) {
                        item.children.map((childItem) => {
                            if (childItem.id == parent) {
                                childItem.children.unshift(record)
                            }
                        })
                    }
                })
            }
        }

        this.setState({ data })
    };

    render() {
        const { columns, data, classTotal, thirdJur } = this.state;
        const addClassDate = {
            display: this.state.addClassModal,
            hideModal: this.isAddModal,
            isAdd: this.state.isAdd,
            editRefresh: this.editRefresh,
            addLevel: this.state.addLevel
        };
        return (
            <div className='class-list-box'>
                <h4 className='h4-title'>商品分类</h4>
                <Row className='line-height-30 margin-bottom-10 table-header'>
                    <Col span={18}>
                        <Icon type="info-circle" />&emsp;
                        一级分类：{classTotal[0]} 个 &emsp;&emsp;
                        二级分类：{classTotal[1]} 个 &emsp;&emsp;
                        三级分类：{classTotal[2]} 个
                    </Col>
                    <Col span={6} className='text-right'>
                        {
                            Object.keys(thirdJur).length && thirdJur[20].display ?
                                <Button type='primary' onClick={() => { this.isAddModal("addClassModal", true, null, "add", "level1") }}>添加一级分类</Button> : ''
                        }

                    </Col>
                </Row>
                <div className="table-box">
                    <Table onExpand={(expanded, record) => { this.queryChildren(expanded, record) }} columns={columns} dataSource={data} />
                </div>

                <AddClass {...addClassDate} ref='addClassModal' />
            </div>
        )
    }

}

export default ClassList;