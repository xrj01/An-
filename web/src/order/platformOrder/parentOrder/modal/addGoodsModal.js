import React from 'react';
import ImgBig from '../../../../component/ImgBig'
import { Modal, Input, Select, Button, message } from 'antd';
import api from '../../../../components/api';

const { Option } = Select;

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

class AddGoodsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',       //  搜索商品名
            goods: [],      //  商品集合
            open: false,     //  是否展开 
            selectValue: undefined, //  有商品后显示的默认值
            displays: 'none',         //  商品详情的显示

            classBreadcrumb: {},
            param: [],   //改商品已有的属性列表
            attribute: {},
            key1: "00",
            key2: "00",
            key3: "00",
            key4: "00",
            key5: "00",
            product: {},  // ← 商品详情
            product_price: [],  // ← 商品sku和价格和库存

            price: 0,
            inventory: 0,
            sku: "",
            goodsId: "",
            selectSku: [],
            isInventory: false,

            // ↓ ------------- 获取同类商品接口数据 -----------
            compare_Data: [],
            classId: "",

            hasChosenSku: {
                0: [false, ""],
                1: [false, ""],
                2: [false, ""],
                3: [false, ""],
                4: [false, ""]
            },
            backupCanList: null,
            canList: {
                canNum1: [],
                canNum2: [],
                canNum3: [],
                canNum4: [],
                canNum5: [],
            },
            isSku: false,

            payNumber: 1,   // 购买数量

            goodsType: '', // 商品来自京东还是平台

        }
    }
    // 隐藏弹窗框
    hideModal = () => {
        this.props.hideModal('visible', false)
    }
    // input ===> onChange
    handleInputOnchange = (type, val) => {
        this.setState({
            [type]: val
        })
    }
    // 搜搜商品
    searchGoods = () => {
        const { name } = this.state;
        const param = { name }
        if (!name) {
            message.error('请输入您要搜索的商品名称或者商品货号！')
        } else {
            api.axiosPost('searchOrderGoods', param).then(res => {
                // console.log('搜索信息', res);
                if (res.data.code === 1 && res.data.data.length > 0) {
                    this.setState({
                        goods: res.data.data,
                        open: true,
                        selectValue: res.data.data[0].product_id,
                        displays: 'flex'
                    })
                    this.getGoodsData(res.data.data[0].product_id, res.data.data[0].type)
                } else {
                    message.warning('商品不存在!')
                }
            })
        }
    }

    // ↓ --------------------- 商家信息数据格式工厂 -------------------------
    userMerchant_Plant(data) {
        if (data.data.code == 1) {
            // const address =data.data.data.merchant.license_address;
            const trateName_data = {
                title: data.data.data.merchant.company,// ← 店面名/标题
                tel: data.data.data.merchant.contacter_phone + "(" + data.data.data.merchant.contacter + ")",// ←联系人
                // district:address.country_name+" "+address.city_name+" "+address.province_name+" "+data.data.data.merchant.license_address_info, // ←地址
                description: data.data.data.merchant.introduce// ← 描述
            };
            this.state.trateName_data = trateName_data;
            this.setState({ trateName_data: trateName_data });
        }
    }
    // 请求商品数据
    getGoodsData = (value, type) => {
        // console.log('typeeeeeeeeeeeeeeeeeeee', type);
        const param = { product_id: value, type: type, parent_id: this.props.parent_id, };
        this.setState({
            goodsType: type
        })
        api.axiosPost('searchGoodsDetails', param).then(res => {
            // console.log('商品信息', res);
            if (res.data.code === 1 && type === 0) {
                const { param, product } = res.data.data;
                const areProductPrice = res.data.data.product.product_price;
                const selectSku = [];
                const attribute = {
                    1: {},//属性1所选的值
                    2: {},//属性2所选的值
                    3: {},//属性3所选的值
                    4: {},//属性4所选的值
                    5: {},//属性5所选的值
                };
                let { key1, key2, key3, key4, key5, sku, inventory, canList } = this.state;
                let price = res.data.data.product.price;
                //单选框默认选中的数据
                areProductPrice && areProductPrice.map((item, i) => {
                    const newSku = "" + item.sku;
                    const pushSku = newSku.substring(7);
                    selectSku.push(pushSku);
                    selectSku.map((itemSku) => {
                        canList.canNum1.push(itemSku.substring(0, 2));
                        canList.canNum2.push(itemSku.substring(2, 4));
                        canList.canNum3.push(itemSku.substring(4, 6));
                        canList.canNum4.push(itemSku.substring(6, 8));
                        canList.canNum5.push(itemSku.substring(8));
                        attribute[1][itemSku.substring(0, 2)] = 1;
                        attribute[2][itemSku.substring(2, 4)] = 1;
                        attribute[3][itemSku.substring(4, 6)] = 1;
                        attribute[4][itemSku.substring(6, 8)] = 1;
                        attribute[5][itemSku.substring(8)] = 1;
                    });
                });
                canList.canNum1 = Array.from(this.arrRepeat(canList.canNum1));
                canList.canNum2 = Array.from(this.arrRepeat(canList.canNum2));
                canList.canNum3 = Array.from(this.arrRepeat(canList.canNum3));
                canList.canNum4 = Array.from(this.arrRepeat(canList.canNum4));
                canList.canNum5 = Array.from(this.arrRepeat(canList.canNum5));
                this.setState({
                    classBreadcrumb: res.data.data.class,
                    param: res.data.data.param.data,
                    product: res.data.data.product,
                    attribute,
                    price,
                    inventory,
                    sku,
                    canList,
                    backupCanList: canList,
                    selectSku,
                    key1, key2, key3, key4, key5,
                    product_id: value,

                    displays: 'flex',
                    goodsId: product.product_price[0].product_id,
                    product_price: product.product_price
                });
                // this.getsameCommodity()
            } else {
                this.setState({
                    product: res.data.data,
                    isSku: true
                })
            }
        })
    };
    // 选中商品后的回调
    seletOnChange = (value, option) => {
        // console.log('option',this.state.goodsType);
        this.getGoodsData(value, this.state.goodsType);
        this.setState({
            open: false,
            payNumber: 1,
            selectValue: value
        })

    };
    //数组去重
    arrRepeat = (arr) => {
        return new Set(arr);
    };
    //补0函数
    addZero = (number) => {
        if (number < 10) {
            return `0${number}`
        } else {
            return `${number}`
        }
    };
    //选择属性   看了会懵逼的，没事别动就好；
    selectAttribute = (e, skuIndex, attrIndex) => {
        const { selectSku, hasChosenSku, backupCanList } = this.state;
        const isActive = e.target.getAttribute("class");
        let activeVal = this.addZero(attrIndex);
        if (isActive == "active") {
            activeVal = "00";
            hasChosenSku[skuIndex] = [false, ""];
        } else {
            hasChosenSku[skuIndex] = [true, this.addZero(attrIndex)];
        }
        let activeSku = "";
        for (let key in hasChosenSku) {
            if (hasChosenSku[key][0]) {
                activeSku += hasChosenSku[key][1]
            } else {
                activeSku += "00"
            }
        }
        const type = `key${skuIndex + 1}`;
        this.setState({
            [type]: activeVal,
            hasChosenSku,
            isInventory: true,
            // canList
        }, () => { this.generateSKU() });
    };
    //生成SKU
    generateSKU = () => {
        const { key1, key2, key3, key4, key5, product } = this.state;
        // console.log(product)
        let { price, inventory } = this.state;
        const sku = `${product.class_id}${key1}${key2}${key3}${key4}${key5}`;
        price = "暂无报价";
        inventory = 0;
        let isSku = false;
        product.product_price && product.product_price.map((item) => {
            if (item.sku == sku) {
                price = item.price;
                inventory = item.inventory;
                isSku = true;
            }
        });
        this.setState({
            sku,
            price,
            inventory,
            isSku
        });
    };
    //数字验证
    isNumber = (number) => {
        if (!(/^[0-9]+$/).test(number)) {
            return false;
        }
        return true;
    }
    //输入框值改变
    inputChange = (e) => {
        const isNumber = this.isNumber(e.target.value);
        if (isNumber) {
            if (e.target.value == 0) {
                this.setState({ payNumber: 1 })
                return
            }
            this.setState({ payNumber: e.target.value })
        }
    };
    //加减购买数量
    addSubtractNumber = (type) => {
        let payNumber = parseInt(this.state.payNumber);
        if (type == "+") {
            payNumber += 1;
        } else {
            payNumber -= 1;
            if (payNumber <= 1) {
                payNumber = 1;
            }
        }
        this.setState({ payNumber })
    };
    // JoinOrder  加入订单
    JoinOrder = () => {
        const { merchant_id, article_number, product_price, title, merchant_name, } = this.state.product
        const param = {
            parent_id: this.props.parent_id,
            merchant_id, article_number, merchant_name,
            sku: this.state.sku,
            product_name: title,
            product_id: this.state.goodsId,
            price: this.state.price,
            count: this.state.payNumber,
            type: this.state.goodsType
        }
        if (this.state.goodsType ===0 ) {
            param.class_id= this.state.product.class_id
            param.class_name= this.state.product.class_name
        }
        if (this.state.goodsType === 1) {
            const { product } = this.state;
            param.merchant_id = '-1'
            param.sku = product.sku
            param.merchant_name = '京东'
            param.product_id = product.sku.toString()
            param.price = product.price
            param.pic = product.pic[0]
        }
        
        if (!this.state.isSku) {
            message.warning('请选择正确的商品规格！')
            return
        } else {
            api.axiosPost('addNewOrder', param).then(res => {
                // console.log('加入订单状态', res);
                if (res.data.code === 1) {
                    message.success(res.data.msg);
                    this.props.getGoodsList();
                    this.hideModal();
                } else {
                    message.error(res.data.msg);
                }
            })
        }
        // console.log('param', param, this.state.isSku, this.state.sku);
    }
    render() {
        const { display } = this.props;
        const { name, goods, selectValue, displays, product, goodsId, param, attribute, canList, price, goodsType } = this.state;
        return (
            <Modal
                title="添加商品"
                visible={display}
                onCancel={this.hideModal}
                onOk={this.JoinOrder}
                destroyOnClose={true}
                maskClosable={false}
                // afterClose={}
                width={1200}
                okText="加入订单"
            >
               
                <div className="addGoods-box">
                    <div className="addGoods-search-box margin-bottom-20">
                        <div className="addGoods-search-text">搜索商品</div>
                        <div className="addGoods-search-input">
                            <Input className="width-200" placeholder="商品名称/货号" value={name} onChange={(e) => { this.handleInputOnchange('name', e.target.value) }} />&nbsp;&nbsp;&nbsp;
                            <Button type="primary" onClick={this.searchGoods}>搜索</Button>&nbsp;&nbsp;&nbsp;
                        </div>
                        <div className="addGoods-search-text bl">搜索结果</div>
                        <div className="addGoods-search-input">
                            <Select
                                placeholder="选择商品"
                                className="width-600"
                                onChange={this.seletOnChange}
                                value={selectValue}
                                ref={(ref) => this.Select = ref}
                            >
                                {
                                    goods && goods.length && goods.map((item, index) => {
                                        return (
                                            <Option value={item.product_id} key={item.product_id}>{item.title}</Option>
                                        )
                                    })
                                }

                            </Select>
                        </div>
                    </div>
                    <div className="goods-introduce" style={{ display: displays }}>
                        <div className="goods-img-big-box">
                            <ImgBig pic_cont={product && product.pic_count} pic_id={goodsId} merchant_id={product && product.merchant_id} picType={goodsType} jdpic={product && product.pic} />
                        </div>
                        <div className="goods-introduce-box">
                            <div className="goods-introduce-title margin-bottom-10">
                                <h1 className="goods-title">
                                    {product && product.title}
                                </h1>
                                <div className="goods-price">
                                    <div className="price">￥{goodsType === 1 ? product && product.price : price}</div>
                                    <div>价格</div>
                                </div>
                            </div>
                            <div className="goods-instructions-box">
                                <ul>
                                    <li>
                                        品牌：<span>{product && product.brand}</span>
                                    </li>
                                    <li>
                                        商品编号：<span>{product && product.article_number}</span>
                                    </li>
                                </ul>
                            </div>
                            {
                                goodsType !== 1 ?
                                    <div className="goods-props-select">
                                        {
                                            param && param.length>0 && param.map((item) => {
                                                return item.name && item.name.map((itemName, k) => {
                                                    if (item.display[k]) {
                                                        const isShow = attribute[k + 1] && attribute[k + 1]['00'];
                                                        const canListSpan = canList[`canNum${k + 1}`];
                                                        let activeK = `key${k + 1}`;
                                                        return (
                                                            <div key={itemName} className='goods-specifications line-height-30' style={{ display: isShow ? "none" : "block" }}>
                                                                <div className='goods-specifications-list-box'>
                                                                    <div className='goods-specifications-name'>
                                                                        {itemName}：
                                                                        </div>
                                                                    <div className='goods-specifications-span'>
                                                                        {
                                                                            item.val[0] && item.val[0][k] && item.val[0][k].map((val, j) => {
                                                                                let defaultChecked = false;
                                                                                if (attribute[k + 1][this.addZero(j + 1)]) {
                                                                                    defaultChecked = true;
                                                                                }
                                                                                return (
                                                                                    <span className={
                                                                                        this.state[activeK] == this.addZero(j + 1) ? "active" :
                                                                                            canListSpan.indexOf(this.addZero(j + 1)) == "-1" ? "noCan" : ""
                                                                                    }
                                                                                        onClick={(e) => {
                                                                                            if (canListSpan.indexOf(this.addZero(j + 1)) == "-1") { return };
                                                                                            this.selectAttribute(e, k, j + 1)
                                                                                        }}
                                                                                        key={`${val}-${j}`}
                                                                                        style={{ display: defaultChecked ? "inline-block" : "none" }}
                                                                                    >
                                                                                        {val}
                                                                                    </span>
                                                                                )
                                                                            })
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                })
                                            })
                                        }
                                    </div> : ''
                            }

                            <div className="goods-number-box">
                                <span>数 量：</span>
                                <div className="goods-number-btn">
                                    <button onClick={() => { this.addSubtractNumber('-') }}>-</button>
                                    <input type="text" className="ant-input" value={this.state.payNumber} onChange={this.inputChange} />
                                    <button onClick={() => { this.addSubtractNumber('+') }}>+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
}
export default AddGoodsModal