import Axios from "./axios";

// const port = "http://192.168.2.167:83";
//const port = "http://192.168.2.167:10083";
// const port = "https://console.api.anmro.cn";
//const port = "https://console.api.anmro.cn";
const port = "http://192.168.2.88:83";
//const port = "http://192.168.2.132:83";

// const sign = 'http://14j508a766.iok.la:28430';

class api {
    urlApi = {
        getProductSign: port + "/getProductSign",  //获取上传图片的签名
        getProductSignDelete: port + "/delete",  //删除图片

        login: port + "/admin/login",
        productClass: port + "/product_class/save",  //添加修改分类信息
        productClassGetList: port + "/product_class/get_list",  //得到分类列表
        productClassSetSort: port + "/product_class/set_sort",  //设置分类顺序
        productClassSetIndexMenu: port + "/product_class/set_index_menu",  //设置分类顺序
        productClassGetParam: port + "/product_class/get_param",  //分类的属性列表
        getClassProductCount: port + "/product_class/get_class_product_count",
        /* ----------- */
        businessSearch: port + "/merchants/search",    //  商家列表商家搜索
        businessList: port + "/merchants/get_list",   //  商家列表
        businessResetPwd: port + "/merchants/reset",  //  商家重置密码
        businessInfo: port + "/merchants/see",        //  商家详情
        getAreas: port + "/merchants/get_area",       //  拉省市区
        businessSaveEdit: port + "/merchants/edit",    //  保存编辑
        goodsList: port + "/merchants_product/get_list",  // 商品列表
        getCate: port + "/merchants_product/get_cate",    // 获取分类下拉
        goodsSearch: port + "/merchants_product/search",  //  搜索商品
        goodsDetails: port + "/merchants_product/show",   //  商品详情
        businessExamine: port + "/merchants/examine",     //  商家审核
        JDgoodsCate: port + "/jd/get_jd_class",           //  京东下拉分类
        JDgoodsSearch: port + "/jd/product_list",         //  京东搜索
        JDgoodsDetail: port + "/jd/product_info",         //  京东商品详情
        /* ------------------815 */
        /* ------------------账户 */
        homeStatistics: port + "/system/statistics",      // 首页统计

        qiniuAccoutList_search: port + "/user/get_list",  //  企牛采账户列表和搜索 
        addMainAccount: port + "/user/add",               //  添加主账户
        editMainAccount: port + "/user/edit",             //  编辑
        seeMainAccountDetail: port + "/user/show",        //  查看总账户详情
        accountResetPwd: port + "/user/reset",            //  主账户重置密码
        getSubAccountList: port + "/user/get_list_son",   //  子账户列表 
        getSubAccountAddrList: port + "/user/address_list",// 获取子账户的地址列表
        getSubAccountInvoice: port + "/user/invoice_list",  //获取子账户的发票列表   
        closeSubAccout: port + "/user/close",              // 关闭子账户
        openSubAccount: port + "/user/start",              // 开启子账户
        seeSubAccountDetail: port + "/user/son_show",      // 查看子账户详情
        departmentList: port + "/user/department_list",    // 部门列表
        getApprovalList: port + "/user/examine_list",      // 审批管理
        getProjectList: port + "/user/project_list",       // 项目管理
        getAllClass: port + "/user/product_class",         // 获取全部分类的接口
        /* -------------------订单  */
        platOrderList: port + "/order/order_list",         // 平台订单列表
        parentOrderDetails: port + "/order/detail",        // 父订单详情
        editInvoice: port + "/order/edit_invoice",         // 修改发票
        editConsigneeAddr: port + "/order/edit_address",   // 修改收货人信息
        closeOrder: port + "/order/closed",                // 关闭订单
        remarkOrder: port + "/order/remark",               // 备注订单
        orderEditGoodsList: port + "/order/get_goods_list", // 订单修改商品列表
        deleteGoods: port + "/order/get_goods_list_delete", // 删除订单商品
        recoveryOrderQuato: port + "/order/reply",          // 恢复订单额度
        
        editGoodsNumAndParice: port + "/order/get_goods_list_edit", // 编辑订单商品数量和价格
        searchGoodsDetails: port + "/order/get_goods_list_show",    // 搜索商品后的详情
        addNewOrder: port + "/order/add_sub_order",                 // 添加新订单

        searchOrderGoods: port + "/order/get_goods_search",         // 搜搜订单商品

        subOrderDetails: port + "/order/detail_son",       // 子订单详情

        JDOrderList: port + "/order/order_list_jd",        // 京东订单详情
        setOrder: port + "/order/system",                  // 设置订单失效和自动收货
        checkOrderTime: port + "/order/system_show",       // 查看订单时间
        getProductLookSign: port + "/getProductLookSign", // 获取附件签名

        // 待处理订单的接口
        pendingOrderList: port + "/third/third_order_list", // 待处理订单的列表
        replaceOrder: port + "/third/replace_order",           // 替换订单 
        submitingOrder: port + "/third/commit_jd_order",       // 提交订单

        addApprovalReason: port + "/system/reason",            // 获取默认审批原因
        deleteApprovalReason: port + "/system/reason_del",     // 删除原因
        // 物流管理的接口
        logisticsManageApi: port + "/order/express_code_list", // 获取物流公司列表
        setLogisticsShow: port + "/order/set_express_display", // 设置物流显示与否
        setLogisticSort: port + "/order/set_express_sort",     // 设置物流排序
        getLogoticsDetail: port + "/order/search_express",     // 获取物流详情信息

        // 角色权限
        user_list: port + "/role/user_list",     // 用户管理列表
        add: port + "/role/add",     // 用户添加
        edit: port + "/role/edit",     // 用户编辑
        delete: port + "/role/delete",     // 用户删除
        role_select: port + "/role/role_select",     // 角色下拉获取
        // role_select: port + "/role/release_role_select",     // 角色下拉获取
        department_select: port + "/role/department_select",     // 部门下拉获取
        // department_select: port + "/role/release_department_select",     // 部门下拉获取

        department_list: port + "/role/department_list",     // 部门管理列表
        department_add: port + "/role/department_add",     // 部门添加
        department_edit: port + "/role/department_edit",     // 部门编辑
        department_delete: port + "/role/department_delete",     // 部门删除

        role_list: port + "/role/role_list",     // 角色管理列表
        role_add: port + "/role/role_add",     // 角色添加
        role_edit: port + "/role/role_edit",     // 角色编辑
        role_delete: port + "/role/role_delete",     // 角色删除

        role_set: port + "/role/role_setup",  // 权限设置
        role_test: port + "/role/lll",  // 权限设置

        // 物流管理的接口
        logisticsManageApi: port + "/order/express_code_list", // 获取物流公司列表
        setLogisticsShow: port + "/order/set_express_display", // 设置物流显示与否
        setLogisticSort: port + "/order/set_express_sort",     // 设置物流排序
        getLogoticsDetail: port + "/order/search_express",     // 获取物流详情信息

        // 类目管理
        get_company_class_list: port + "/product_class/get_company_class_list",     // 获取采购企业类目列表
        _class_save: port + "/product_class/company_class_save",     // 保存分类
        set_company_class_sort: port + "/product_class/set_company_class_sort",     // 保存分类
        get_product_class_for_dict: port + "/product_class/get_product_class_for_dict",     // 获取商品分类
        get_buyer_class_product_count: port + "/product_class/get_buyer_class_product_count",     // 分类数量统计
        get_buyer_class_parent_name: port + "/product_class/get_buyer_class_parent_name",     // 获取上级分类
        
        // 商品模板
        set_product_template: port + "/merchants_product/set_product_template",     // 设置商品模板
    };
    axiosPost(url, data, form) {
        const add = this.urlApi[url] ? this.urlApi[url] : url;
        return Axios(add, data, "post", form);
    };
    axiosGet(url, data) {
        const add = this.urlApi[url];
        return Axios(add, data, "get");
    };
    imgUrl = "http://img.anmro.cn/";
}

export default new api();
