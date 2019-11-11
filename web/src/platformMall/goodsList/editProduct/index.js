import React from "react";
import { Form, Input, Layout, Checkbox, Button,Table, Popconfirm,Upload, Icon, Modal, message ,InputNumber } from 'antd';

import EditorConvertToHTML from "./editorConvertToHTML";
import {Link} from 'react-router-dom';
import bind from "react-autobind"

import './index.scss'
class editProduct extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            dataSource:[{number:'1'}],
            columns:[
                {
                    title: '属性',
                    dataIndex: 'attribute',
                    align:'center'
                },
                {
                    title: '销售价',
                    dataIndex: 'shopMoney',
                    align:'center',
                    width: '30%',
                    render:(text,record)=>{
                        const {productPrice} = this.state;
                        return(
                            <span>
                                <Input style={{ width: '80%' }} onChange={(e)=>{this.inputChange("price",e.target.value)}}
                                  /> 元
                            </span>
                        )
                    }
                },
                {
                    title: '商品编号',
                    dataIndex: 'goodsNum',
                    align:'center'
                },
                {
                    title: '操作',
                    dataIndex: 'class',
                    align:'center',
                    render:()=>{
                        return(
                            <div style={{ color: 'red' }}>
                                删除
                            </div>
                        )
                    }
                },
                
            
            ],
            
            previewVisible: false,
            previewImage: '',
            fileList: [
                {
                    uid: '-1',
                    name: 'xxx.png',
                    status: 'done',
                    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
                },
            ],
        }
        
        bind(this)
    }
    

    render(){
        //表单
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 2 },
            },
              wrapperCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
        };
        //多选
        let brandOptions = [
            { label: '选项一', value: '选项一' },
            { label: '选项二', value: '选项二' },
            { label: '选项三', value: '选项三' },
        ];

        let colorOptions = [
            { label: '选项一', value: '选项一' },
            { label: '选项二', value: '选项二' },
            { label: '选项三', value: '选项三' },
        ];
        //表格
        
        //图片上传
        const { previewVisible, previewImage, fileList } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        //富文本
        const editorHtml={
            content:this.content
        };
        return(
            <div className='edit-product-box'>
                <h4 className='h4-title'>编辑商品</h4>
                {/* 商品类别 */}
                <div className='edit-product-category'>
                    您当前选择的商品类别是：<span className='product-category-ft'>一级> 二级> 三级</span><Link to=''>重新选择</Link>
                </div>

                <Form {...formItemLayout} onSubmit={this.handleSubmit}> 
                    {/* 基本信息 */}
                    <div className='edit-product-basicinfo'>
                        <div className='product-basicinfo-title margin-bot'>
                            基本信息
                        </div>
                        <Form.Item label='商品名称'>
                            {getFieldDecorator('gondsName', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入商品名称'
                                    }
                                ]
                            })(
                                <Input placeholder='请输入商品名称'/>
                            )}
                        </Form.Item>
                        <Form.Item label='商品单位'>
                            {getFieldDecorator('goodsUnit', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入商品单位'
                                    }
                                ]
                            })(
                                <Input placeholder='单位'/>
                            )}
                        </Form.Item>
                        <Form.Item label='库存'>
                            {getFieldDecorator('goodNum',{
                                rules: [
                                    {
                                        required: true,
                                        messag: '请输入商品库存'
                                    }
                                ]
                            })(
                                <Input placeholder='库存数'/>
                            )}
                        </Form.Item>
                        <Form.Item label='商家'>
                            <span>商家</span>
                        </Form.Item>
                        <Form.Item label='商品货号'>
                            <span>123456789</span>
                        </Form.Item>
                    </div>
                    {/* 属性设置 */}
                    <div className='edit-product-attribute'>
                        <div className='product-basicinfo-title margin-bot'>
                            属性设置
                        </div>
                        <div className='edit-product-content'>
                            <div className='edit-product-option'>
                                <Form.Item>
                                    <span>品牌: </span>
                                    <Checkbox.Group options={brandOptions} onChange={this.onChange}/>
                                </Form.Item>
                                <Form.Item>
                                    <span>颜色: </span>
                                    <Checkbox.Group options={colorOptions} onChange={this.onChange}/>
                                </Form.Item>
                            </div>
                            <div className='edit-product-table'>
                                <Table
                                bordered
                                pagination={false}
                                dataSource={this.state.dataSource} 
                                columns={this.state.columns} 
                                />
                            
                            </div>
                        </div>
                    </div>
                    {/* 图片管理 */}
                    <div className='edit-product-img'>
                        <div className='product-basicinfo-title margin-bot'>
                            图片管理
                        </div>
    
                        <div className="edit-product-imgupload">
                            <Upload
                                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={this.handlePreview}
                                onChange={this.handleChange}
                                >
                                {fileList.length >= 5 ? null : uploadButton
                                    
                                }
                                </Upload>
                                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                </Modal>
                            <p>
                                1.支持jpg、gif、png格式上传或从图片空间中选择   2.尺寸在800x800像素以上、大小不超过1M的正方形图片   3.每种规格上传数量限制在5张
                            </p>
                        </div>
                        
                    </div>
                    {/* 富文本 */}
                    <div className='edit-product-description'>
                        <div className='product-basicinfo-title margin-bot'>
                            商品描述
                        </div>
                        <EditorConvertToHTML {...editorHtml}/>
                    </div>

                    {/* 按钮 */}
                    <div>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
                
            </div>

        
        )
        
        
    }
    //多选
    onChange(checkedValues) {
        // console.log('checked = ', checkedValues);
    }
    //表格价格改变时执行函数
    inputChange=(type,value)=>{
        this.setState({
            [type]:value
        })
        // console.log(type,value);
        
    };
    //图片上传
    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    handleCancel = () => this.setState({ previewVisible: false });
    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await this.getBase64(file.originFileObj);
        }
        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });
    };
    handleChange = ({ fileList }) => this.setState({ fileList });

    //提交按钮
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
          if (!err) {
            console.log('Received values of form: ', values);
          }
        });
    };
}
export default Form.create()(editProduct)