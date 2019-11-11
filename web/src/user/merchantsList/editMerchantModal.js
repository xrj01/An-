import React from "react";
import { Input, Row, Col, Icon, Modal, Form, Cascader, Upload, message, Spin } from "antd";
import api from "./../../components/api";
import publicFn from "./../../components/public";

const { TextArea } = Input;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};

class MerchantsModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      confirmDirty: false,  // 密码确认

      phone: "",   // 用户名
      contacter: "",  // 联系人姓名
      contacterPhone: "",  // 联系人电话
      address_json: "",  // 省市区地址
      license_address_info: "",  // 详细地址
      longitude: "",  //　经度
      latitude: "",　　// 纬度
      coordinates: "", // 经纬度字符串
      introduce: "",   // 简介
      areaOption: [],   // 级联选择器数据
      defaultValue: [],  // 省市区的值
      flag: true,       // 定义回显省市区的开关  true：可以继续请求子集 、 false：不在往下一级请求
      levelAddress: "", // 省市区拼接字符串  ==>四川省成都市武侯区
      password: "",     // 密码

      previewVisible: false,  //  控制查看图片弹框的显示与隐藏
      previewImage: '',      //  查看图片弹框的地址
      productId: 0,  // 商品ID
      fileList: [],
      fileUpDomNum: [false, false, false, false, false],
      signature: {}, //  上传文件的签名
      spinLoading: false,  //  上传文件的加载状态
      remark: '',       // 备注信息
    }
  }
  /* 
  *********************************************功能隐藏
  // 第一次密码的验证
  validateToNextPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && this.state.confirmDirty) {
          form.validateFields(['confirmpwd'], { force: true });
      }
      callback();
  };
  // 确认密码的验证
  compareToFirstPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value !== form.getFieldValue('password')) {
          callback('两次密码不一致');
      } else {
          callback();
      }
  };
  // 确认密码失焦 判断两次密码是否一直
  handleConfirmBlur = e => {
      const value = e.target.value;
      this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }; 
  
  */
  //  保存修改
  saveEdit = e => {
    // 表单取值
    e.preventDefault();
    const { validateFieldsAndScroll, getFieldValue, validateFields } = this.props.form;

    // 保存之前验证表单
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        /* 
        *************************************************功能隐藏
        // 输入密码之后 验证确认密码  密码可填可不填
        if(getFieldValue('password')){
          validateFields(["confirmpwd"],(error)=>{
            if(!error){
              const pwd = getFieldValue('password');
              // console.log('密码',pwd)
              this.savePost(pwd);
            }else{
              // console.log('请再次确认密码！')
            }
          })
        }else{
          this.savePost();
        } 
        */
        this.savePost();
      } else {
        // console.log(values)
      }
    });
  }
  // 保存编辑
  savePost = (pwd) => {
    const { productId, contacter, contacterPhone, longitude, latitude, introduce, license_address_info, address_json, remark } = this.state;
    // 后台所需要得省市区对象
    let obj = {
      province_id: address_json[0].id,
      province_name: address_json[0].name,
      city_id: address_json.length < 2 ? '' : address_json[1].id,
      city_name: address_json.length < 2 ? '' : address_json[1].name,
      country_id: address_json.length < 3 ? '' : address_json[2].id,
      country_name: address_json.length < 3 ? '' : address_json[2].name,
    }
    // 后台所需data
    const parameter = {
      id: productId,
      contacter,
      contacter_phone: contacterPhone,
      coordinates: `${longitude},${latitude}`,
      license_address: obj,
      introduce,
      license_address_info,
      remark
    }

    /* 
      ****************************************************功能隐藏
      // 如果有密码输入或改变  就像后台发送新密码
      if(pwd){
        parameter.password = pwd
      } 

    */
    api.axiosPost('businessSaveEdit', parameter).then((res) => {
      if (res.data.code === 1) {
        message.success('保存成功');
        this.updateTables(); //  保存成功，更新table
        this.hideModal();    //  隐藏弹窗
      } else {
        message.error(res.data.msg)
      }
    })
  }
  //  隐藏弹框
  hideModal = () => {
    this.props.hideModal('visible', false);
    this.setState({ fileList: [] })
  }
  // 更新表格
  updateTables = () => {
    if (this.props.isSearch == 1) {
      this.props.handelSearch()
    } else {
      this.props.merchantList()
    }
  }
  // input =====》 onChange
  handelInputOnChange = (type, value) => {
    this.setState({
      [type]: value
    })
  }
  // 第一打开弹窗就去请求旧的省市区所需要的所有数据
  async getNextArea(id, obj, cityid, length) {
    const { flag } = this.state;
    await api.axiosPost('getAreas', { parent_id: id }).then((res) => {
      const { data } = res.data;
      if (res.data.code === 1) {
        data.map((subitem) => {
          if (data.length == 0) {
            return;
          };
          obj.children.push({
            id: subitem.id,
            name: subitem.name,
            isLeaf: length == 2 ? true : !flag,
          });
        });
        this.setState({
          areaOption: [...this.state.areaOption]
        })
      }
    })
    // 请求第三级--- 区---- 的数据
    if (flag) {
      obj.children.map((aitem) => {
        if (aitem.id === cityid) {
          if (length > 2) {
            aitem.children = [];
            aitem.isLeaf = false;
          }
          this.setState({
            flag: false
          })
          this.getNextArea(aitem.id, aitem);
        }
      })
    }
  }
  // 父组件的数据
  handelRowData = (record) => {
    // console.log(record)
    this.setState({ flag: true })
    if (record) {   // 判断当前行数据是否存在
      const { areaOption } = this.state;
      if (record.address_json != '') {
        // 旧的省市区
        const oldAdd = record.address_json;
        const defaultValue = [], levelAddress = [];
        oldAdd.map((item, index) => {
          if (item.id != '') {
            defaultValue.push(item.id)
          }
          levelAddress.push(item.name)
          this.setState({
            levelAddress: levelAddress.join(''),
            defaultValue: defaultValue
          })
        })
        // 回显旧的省市区
        areaOption.map((item, index) => {
          if (item.id === defaultValue[0]) {
            item.children = [];
            item.isLeaf = false;
            this.getNextArea(item.id, item, defaultValue[1], defaultValue.length)
          }
        })
      } else {
        this.setState({ defaultValue: [] })
      }
      // 拆分经纬度
      const localtions = record.coordinates.split(",");
      // 设置表单初始值
      this.setState({
        phone: record.phone,
        contacter: record.contacter,
        contacterPhone: record.contacterPhone,
        address_json: record.address_json,
        license_address_info: record.license_address_info,
        longitude: localtions[0],
        latitude: localtions[1],
        coordinates: record.coordinates,
        introduce: record.introduce,
        productId: record.id
      }, () => {
        // id 存在之后 去获取签名
        this.getProductSign();
        const imgDom = this.refs.img;
        setTimeout(() => {
          if ((imgDom.offsetWidth > 100 && imgDom.offsetHeight > 0)) {
            this.setState({
              fileList: [
                {
                  uid: 9,
                  name: `${this.state.productId}-9.jpg`,
                  status: "done",
                  url: publicFn.imgUrl(this.state.productId, this.state.productId, 9, 1000, 'merchant'),
                }
              ]
            });
          } else {
            this.setState({ fileList: [] })
          }
        }, 1000)
      })
    } else {
      this.setState({
        phone: '',
        contacter: '',
        contacterPhone: '',
        license_address_info: '',
        longitude: '',
        latitude: '',
        introduce: ''
      })
    }
  }
  // 动态加载市区
  loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const id = targetOption.id;
    targetOption.loading = true;
    // 根据当前的id请求下一级地区集合
    this.getAreas(id, targetOption);
  }
  // 获取首次下拉数据
  getAreas = (id, tar) => {
    const data = { parent_id: id }
    if (id === 0) {
      api.axiosPost('getAreas', data).then((res) => {
        const { data } = res.data;
        if (res.data.code === 1) {
          // console.log('country',data)
          this.setState({
            areaOption: data
          })
        }
      })
    } else if (id && id > 0) {
      // 获取市 区 的地址
      api.axiosPost('getAreas', data).then((res) => {
        const { data } = res.data;
        if (res.data.code === 1) {
          tar.loading = false;
          tar.children = [];
          data.map((item) => {
            tar.children.push(item)
          })
          this.setState({
            areaOption: [...this.state.areaOption]
          })
        }
      })
    }
  }
  // 切换省市区的函数
  cascaderOnChange = (value, selectedOptions) => {
    // console.log(value,selectedOptions)
    const levelAddress = []
    selectedOptions.map((a) => {
      levelAddress.push(a.name)
    })
    this.setState({
      levelAddress: levelAddress.join(''),
      address_json: selectedOptions
    })
  }
  // getPoint  获取经纬度
  getPoint = () => {
    const { levelAddress, license_address_info } = this.state;
    const location = `${levelAddress}${license_address_info ? license_address_info : ''}`;
    let BMap = window.BMap
    let myGeo = new BMap.Geocoder();
    myGeo.getPoint(location.replace(/\s*/g, ""), (point) => {
      if (point) {
        const lng = (+point.lng || 0).toFixed(6);
        const lat = (+point.lat || 0).toFixed(6);
        //截取小数后6位
        this.props.form.setFieldsValue({
          longitude: lng,
          latitude: lat,
        })
        this.setState({
          longitude: lng,
          latitude: lat,
          // coordinates : `${lng},${lat}`
        })
      } else {
        message.error("输入的地址百度地图不能解析");
      }
    }, "中国");
  }
  // -------------------------------------------------------

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
    }, () => { this.goodsImg(file, 9) });
  };
  // 获取签名接口
  getProductSign = (file, index, fn) => {
    const { productId } = this.state;
    const data = {
      id: productId,
      dir: publicFn.getProductSign('merchant', productId)
    };
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
    const { signature, fileList, productId } = this.state;
    publicFn.antdUpFile(file, signature, productId, index).then((res) => {
      if (res.status == 'ok') {
        const newFile = [res.data]
        this.setState({
          fileList: newFile,
          spinLoading: false
        })
        //  console.log('newFile',newFile)
      }
    })
      .catch((error) => {
        this.getProductSign(file, index, this.goodsImg);
      });
  };
  //图片删除
  deleteImg = (file, index) => {
    let { productId } = this.state;
    const data = {
      bucket: "cn-anmro",
      // dir:`merchant/`,
      dir: publicFn.deleteImgDir('merchant'),
      file: `${file.name}`,
      mid: productId
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
  componentWillMount() {
    this.getAreas(0);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { previewVisible, previewImage, fileList, spinLoading } = this.state;
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { display } = this.props;
    const fieldNames = { label: 'name', value: 'id', children: 'children' };
    return (
      <Modal
        title="编辑商家信息"
        visible={display}
        onOk={this.saveEdit}
        onCancel={this.hideModal}
        okText="保存"
        cancelText="取消"
        maskClosable={false}
        destroyOnClose
        centered
        bodyStyle={{ height: '580px', overflowY: 'scroll' }}
        width={700}
        afterClose={() => this.props.form.resetFields()}
      >
        <Form {...formItemLayout}>
          <Form.Item label="用户名">
            {getFieldDecorator('username', {
              initialValue: this.state.phone
            })(
              <Input className="usernames" disabled={true} />,
            )}
          </Form.Item>
          <Form.Item label="联系人姓名">
            {getFieldDecorator('contactName', {
              rules: [
                { required: true, message: '请输入联系人姓名' },
                { pattern:  /^[\u4E00-\u9FA5]{1,20}$/, message: '联系人姓名仅支持中文' },
              ],
              initialValue: this.state.contacter
            })(
              <Input placeholder="请输入联系人姓名" onChange={(e) => { this.handelInputOnChange('contacter', e.target.value) }} />,
            )}
          </Form.Item>
          <Form.Item label="联系人电话">
            {getFieldDecorator('contactPhone', {
              rules: [
                { required: true, message: '请输入联系人电话', },
                { pattern: /^1[345789]\d{9}$/, message: '手机号码格式不正确' }
              ],
              initialValue: this.state.contacterPhone
            })(
              <Input placeholder="请输入联系人电话" onChange={(e) => { this.handelInputOnChange('contacterPhone', e.target.value) }} />,
            )}
          </Form.Item>
          <Form.Item label="公司地址" wrapperCol={{ span: 18 }} htmlFor="area">
            {getFieldDecorator('address', {
              rules: [
                { type: 'array', required: true, message: '请输入公司地址' }
              ],
              initialValue: this.state.defaultValue
            })(
              <Cascader
                placeholder="请选择"
                options={this.state.areaOption}
                fieldNames={fieldNames}
                loadData={this.loadData}
                changeOnSelect
                onChange={this.cascaderOnChange}
                notFoundContent="暂时没有数据"
                getPopupContainer = {(triggerNode)=>{ return triggerNode}}
              />
            )}
          </Form.Item>
          <Form.Item label="详细地址" wrapperCol={{ span: 18 }}>
            {getFieldDecorator('detailAddress', {
              rules: [
                { required: true, message: '详细地址' }
              ],
              initialValue: this.state.license_address_info
            })(
              <Input placeholder="请输入详细地址" onChange={(e) => { this.handelInputOnChange('license_address_info', e.target.value) }} />,
            )}
          </Form.Item>
          <Form.Item label="经纬度" wrapperCol={{ span: 18 }} style={{ marginBottom: '5px' }}>
            <Row gutter={16}>
              <Col span={9}>
                <Form.Item>
                  {getFieldDecorator('longitude', {
                    rules: [
                      { required: true, message: '请输入经度' }
                    ],
                    initialValue: this.state.longitude

                  })(
                    <Input placeholder="经度" onChange={(e) => { this.handelInputOnChange('longitude', e.target.value) }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item>
                  {getFieldDecorator('latitude', {
                    rules: [
                      { required: true, message: '请输入纬度' }
                    ],
                    initialValue: this.state.latitude
                  })(
                    <Input placeholder="纬度" onChange={(e) => { this.handelInputOnChange('latitude', e.target.value) }} />
                  )}
                </Form.Item>
              </Col>
              <a href="javascript:void(0)" onClick={this.getPoint}>查询经纬度</a>
            </Row>
          </Form.Item>

          {
            /* 
            ************************************************功能隐藏
            <Form.Item label="登录密码">
            {getFieldDecorator('password', {
              rules: [
                { message: '请填写6-8位数字和字母组成的密码' , pattern : /^([a-z0-9A-Z)]){6,8}$/i},
                { validator: this.validateToNextPassword },
              ]
            })(
              <Input.Password placeholder="请输入登录密码" />,
            )}
          </Form.Item>
          <Form.Item label="确认密码">
            {getFieldDecorator('confirmpwd', {
              rules: [
                { message: '请再次确认密码' },
                { validator: this.compareToFirstPassword },
              ]
            })(
              <Input.Password 
                placeholder="请输入确认密码" 
                onBlur={this.handleConfirmBlur}
              />,
            )}
          </Form.Item> */
          }
          <Form.Item label="店铺logo" wrapperCol={{ span: 4 }}>
            <Spin spinning={spinLoading} delay={500}>
              <Upload
                accept="image/jpg, image/jpeg, /image/png, /image/gif"
                listType="picture-card"
                className="avatar-uploader"
                key={Math.random() * 100}
                beforeUpload={() => { return false }}
                fileList={fileList}
                onPreview={this.handlePreview}
                onRemove={(file) => { this.deleteImg(file, 0) }}
                onChange={(file) => { this.handleChange(file) }}
              >
                {fileList.length ? null : uploadButton}
              </Upload>
            </Spin>
            <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
              <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </Form.Item>
          <Form.Item label="商家简介" wrapperCol={{ span: 18 }}>
            {getFieldDecorator('businessProfile', {
              rules: [
                { required: true, message: '请输入商家简介' }
              ],
              initialValue: this.state.introduce
            })(
              <TextArea placeholder="请输入商家简介" rows={4} onChange={(e) => { this.handelInputOnChange('introduce', e.target.value) }} />,
            )}
          </Form.Item>
          <Form.Item label="备注" wrapperCol={{ span: 18 }}>
            {getFieldDecorator('remark', {
              rules: [
                { required: false, message: '请输入备注信息' }
              ],
              initialValue: this.state.introduce
            })(
              <TextArea placeholder="请输入备注信息" rows={4} onChange={(e) => { this.handelInputOnChange('remark', e.target.value) }} />,
            )}
          </Form.Item>
        </Form>
        < img
          ref='img'
          style={{ position: "fixed", left: "0", top: "0", opacity: "0", zIndex: "-1" }}
          src={`${publicFn.imgUrl(this.state.productId, this.state.productId, 9, 1000, 'merchant')}`}
        />
      </Modal>
    )
  }
}

export default Form.create()(MerchantsModal);