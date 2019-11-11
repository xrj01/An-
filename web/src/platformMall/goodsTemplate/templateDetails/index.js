import React from "react";
import { Row, Col, Button } from 'antd';
import api from "../../../components/api";
// import Public from "./../../../components/public";
import './index.scss'
export default class templateDetails extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            JD_img:[],  //  商品详情图片
            id: 0,      //  当前商品的id
            JD_info: {} //  当前商品的具体信息
        }
    }

    render(){
        const {JD_info} = this.state;
        return(
            <div className='commodity-details-box'>
                <h4 className='h4-title'>查看商品模板</h4>
                {/* 基本信息 */}
                <div className='commodity-basicinfo'>
                    <div className='commodity-basicinfo-title'>
                        基本信息
                    </div>
                    <div className='commodity-basicinfo-content'>
                        <Row>
                            <Col span={8}>
                                <span>商品名称：</span>
                                <span>{JD_info.title}</span>
                            </Col>
                            <Col span={8}>
                                <span>商品分类：</span>
                                <span>{JD_info.class_name}</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <span>商家：</span>
                                <span>-</span>
                            </Col>
                            <Col span={8}>
                                <span>商品品牌：</span>
                                <span>{JD_info.brand_name}</span>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={8}>
                                <span>商品货号：</span>
                                <span>-</span>
                            </Col>
                        </Row>
                        
                    </div>
                </div>
                {/* 销售信息 */}
                <div className='commodity-basicinfo'>
                    <div className='commodity-basicinfo-title'>
                        销售信息
                    </div>
                    <div className='commodity-basicinfo-content'>
                        
                    </div>
                </div>
                {/* 图片管理 */}
                <div className='commodity-img-management'>
                    <div className='commodity-basicinfo-title'>图片管理</div>
                    <div className='commodity-img-box'>
                        {this.state.JD_img.map((item,index) =>(
                                <div className="commodity-img" key={index}><img src={item} /></div>
                            )
                        )
                        }
                    </div>
                </div>
                {/* 商品描述 */}
                <div className='commodity-product-description'>
                    <div className='commodity-basicinfo-title'>商品描述</div>
                    <div className='commodity-product-content'>
                        <div className="table-box" dangerouslySetInnerHTML={{__html:JD_info.param}}>
                        </div>
                        <div dangerouslySetInnerHTML={{__html:JD_info.introduction}}>
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
    componentDidMount(){
        const id = this.props.match.params.id;
        console.log(id)
        this.setState({
            id : id
        })
        api.axiosPost('JDgoodsDetail',{product_id:id}).then(res => {
            console.log(res)
            if(res.data.code === 1){
                const {data} = res.data;
                this.setState({
                    JD_info: data,
                    JD_img: data.pic
                })
            }
        })
    }
}