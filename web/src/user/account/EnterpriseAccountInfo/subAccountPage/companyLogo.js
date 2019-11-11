import React, { Children } from 'react';
import { Input, Row, Col, Icon, Modal, Form, Cascader, Upload, message, Spin } from "antd";
import api from "./../../../../components/api";
import publicFn from "./../../../../components/public";

export default class AddressListModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            previewVisible: false,  //  控制查看图片弹框的显示与隐藏
            previewImage: '',      //  查看图片弹框的地址
            productId: 0,  // 商品ID
            fileList: [],
            fileUpDomNum: [false, false, false, false, false],
            signature: {}, //  上传文件的签名
            spinLoading: false,  //  上传文件的加载状态
            company_id: '',     // 企业id
        }
    }
    //图片大图转换为base64
    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    //关闭图片大图查看
    handleCancel = () => this.setState({ previewVisible: false });
    //查看图片大图
    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await this.getBase64(file.originFileObj);
        }
        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
        });
    };
    //图片改变回调
    handleChange = (file) => {
        const { fileUpDomNum, fileList } = this.state;
        if (!file.fileList.length) { return false; }
        this.setState({
            // fileList: fileList
            spinLoading: true
        }, () => { this.goodsImg(file, 'operating') });
    };
    // 获取签名接口
    getProductSign = (file, index, fn) => {
        const { company_id } = this.props;
    
        const data = {
            id: company_id,
            dir: publicFn.getProductSign('merchant', company_id)
        };
        // console.log('data', data);
        // console.log(data)
        api.axiosGet("getProductSign", data).then((res) => {
            if (res.status == 200) {
                this.setState({
                    signature: res.data
                }, () => {
                    if (file && fn) {
                        fn(file, index);
                    }
                })
            }
        })
    };
    //添加图片地址
    goodsImg = (file, index) => {
        const { signature, fileList, company_id } = this.state;
        publicFn.antdUpFile(file, signature, company_id, index).then((res) => {
            if (res.status == 'ok') {
                console.log('resresresres', res);
                const newFile = [res.data]
                this.setState({
                    fileList: newFile,
                    spinLoading: false
                })
            }
        })
            .catch((error) => {
                this.getProductSign(file, index, this.goodsImg);
            });
    };
    //图片删除
    deleteImg = (file, index) => {
        let { company_id } = this.state;
        const data = {
            bucket: "cn-anmro",
            // dir:`merchant/`,
            dir: publicFn.deleteImgDir('merchant'),
            file: `${file.name}`,
            mid: company_id
        };
        // console.log(data)
        return new Promise((resolve, reject) => {
            api.axiosPost("getProductSignDelete", data).then((res) => {
                if (res.status == 200) {
                    resolve(true);
                    const fileList = [];
                    this.setState({ fileList });
                } else {
                    resolve(false)
                }
            });
        });
    };
    
    componentDidMount(){
        // console.log('aaaaaaaaaaaaaa', this.props.company_id);
        this.setState({
            company_id: this.props.company_id
        })
         this.getProductSign()
         // id 存在之后 去获取签名
        const imgDom = this.refs.img;
        setTimeout(() => {
          if ((imgDom.offsetWidth > 100 && imgDom.offsetHeight > 0)) {
            this.setState({
              fileList: [
                {
                  uid: 'operating',
                  name: `${this.props.company_id}-operating.jpg`,
                  status: "done",
                  url: publicFn.imgUrl(this.props.company_id, this.props.company_id, 'operating', 1000, 'merchant'),
                }
              ]
            });
          } else {
            this.setState({ fileList: [] })
          }
        }, 1000)
    }
    render() {
        const { previewVisible, previewImage, fileList, spinLoading } = this.state;
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );


        return (
            <div>
                <div className="accounts-logo">
                    <Spin spinning={spinLoading} delay={500}>
                        <Upload
                            // style={{marginLeft: '20px'}}
                            accept="image/jpg, image/jpeg, /image/png, /image/gif"
                            listType="picture-card"
                            className="avatar-uploader"
                            key={Math.random() * 100}
                            beforeUpload={() => { return false }}
                            fileList={fileList}
                            onPreview={this.handlePreview}
                            onRemove={(file) => { this.deleteImg(file, 'operating') }}
                            onChange={(file) => { this.handleChange(file) }}
                        >
                            {fileList.length ? null : uploadButton}
                        </Upload>
                    </Spin>
                </div>
                
                <div className="logo-tips">
                    <p><span>Logo尺寸：</span>宽为100px,高度为62px</p>
                    <p><span>格式：</span>jpg、jpeg、gif</p>
                    <p><span>大小：</span>小于1024KB</p>
                </div>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
                < img
                    ref='img'
                    style={{ position: "fixed", left: "0", top: "0", opacity: "0", zIndex: "-1" }}
                    src={`${publicFn.imgUrl(this.state.company_id, this.state.company_id, 'operating', 1000, 'merchant')}`}
                />
            </div>
        )
    }
}