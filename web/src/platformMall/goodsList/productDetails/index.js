import React from "react";
import { Row, Col ,Table ,Button} from 'antd';
import './index.scss';
import api from "./../../../components/api";
import Public from "./../../../components/public"
import { Math } from "core-js";
export default class ProductDetails extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            img:[],
            dataSource:[],
            columns:[
                {
                    title: '属性',
                    dataIndex: 'sku_value',
                    align:'center',
                },
                {
                    title: '销售价',
                    dataIndex: 'price',
                    align:'center'
                },
                {
                    title: '库存',
                    dataIndex: 'inventory',
                    align:'center'
                }
            ],
            id : '',
            info: {},
            salesInformation:[],
            imgURL : [],
            merchant_id: ''  //  商家id
        }
    }

    componentDidMount(){
        // console.log(this.props.history)
        const { match,location } = this.props;
        const goodID = match.params.id;
        /* let merchant_id;
        if(location.query && location.query.merchant_id){
            merchant_id = location.query.merchant_id;
            sessionStorage.setItem('merchant_id',merchant_id);
        }else {
            merchant_id = sessionStorage.getItem('merchant_id')
        } */
        const merchant_id = this.props.location.search.split('?')[1];
        this.setState({
            id :goodID,
            merchant_id: merchant_id
        })  
        api.axiosPost('goodsDetails',{id:goodID}).then(res=>{
            // console.log(res)
            if(res.data.code === 1){
                const {info,param} = res.data.data;
                
                let imgNumArr = []
                for (let i=0 ; i<info.picCount;i++){
                    imgNumArr.push(i)
                }
                param.map((item,index) => {
                    item.key = index
                })
                this.setState({
                    info,
                    salesInformation: param,
                    img: imgNumArr,
                    dataSource: param
                })
                
            }
        })
    }
    /* componentWillUnmount(){
        sessionStorage.removeItem('merchant_id');
    } */

    render(){
        const {info} = this.state;
        return(
            <div className='product-details-box'>
                <h4 className='h4-title'>商品详情</h4>
                {/* 基本信息 */}
                <div className='product-basicinfo'>
                    <div className='product-basicinfo-title'>
                        基本信息
                    </div>
                    <div className='product-basicinfo-content'>
                        <Row>
                            <Col span={8}>
                                {/* <div> */}
                                    <span>商品名称：</span>
                                    <span>{info.title}</span>
                                {/* </div> */}
                            </Col>
                            <Col span={8}>
                                <span>商品分类：</span>
                                <span>{info.class_name}</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <span>商家：</span>
                                <span>{info.company}</span>
                            </Col>
                            <Col span={8}>
                                <span>商品品牌：</span>
                                <span>{info.brand}</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <span>商品货号：</span>
                                <span>{info.articleNumber}</span>
                            </Col>
                            <Col span={8}>
                                <span>更新时间：</span>
                                <span>{info.update_time}</span>
                            </Col>
                        </Row>
                    </div>
                </div>
                {/* 销售信息 */}
                <div className='product-sales-message'>
                    <div className='product-basicinfo-title'>销售信息</div>
                    <div className='product-sales-table'>
                        <Table
                            bordered
                            pagination={false}
                            dataSource={this.state.dataSource} 
                            columns={this.state.columns} 
                            size='small'
                        />
                    </div>
                    
                </div>
                {/* 图片管理 */}
                <div className='product-img-management'>
                    <div className='product-basicinfo-title'>图片管理</div>
                    <div className='product-img-box'>
                        {
                            this.state.img.map((item,index) =>{
                                // return <img key={index} className='product-img' src={`${api.imgUrl}product/${this.state.merchant_id}/${this.state.id}-${item}.jpg${Public.imgSize(160)}`} />
                                return <img src={Public.imgUrl(this.state.merchant_id,this.state.id,item,160)} />
                            })
                        }
                    </div>
                </div>
                {/* 商品描述 */}
                <div className='product-product-description'>
                    <div className='product-basicinfo-title'>商品描述</div>
                    <div className='product-product-content'>
                        <div dangerouslySetInnerHTML={{__html:info.content}}>

                        </div>
                    </div>
                </div>
                <Row type="flex" justify="center">
                    <Col span={2}>
                        <Button type="primary" onClick={()=>{this.props.history.goBack()}}>返回</Button>
                    </Col>
                </Row>
            </div>
        )
    }

}