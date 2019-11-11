import Home from "./home";
import HomePage from "./home/home"
import User from "./user";
import Account from "./user/account";
import EnterpriseAccountInfo from "./user/account/EnterpriseAccountInfo";
import Merchants from "./user/merchantsList";
import Platform from "./platformMall";
import ProductDetails from "./platformMall/goodsList/productDetails";
import EditProduct from "./platformMall/goodsList/editProduct";
import GoodsList from "./platformMall/goodsList"
import JDGoods from "./platformMall/JDGoods"
import GoodsClass from "./platformMall/goodsClass"
import GoodsTemplate from "./platformMall/goodsTemplate"
import Order from "./order";
import PlatformOrder from "./order/platformOrder";
// import OrderTracking from "./order/platformOrder/orderTracking";
import CommodityDetails from './platformMall/JDGoods/commodityDetails'
import TemplateDetails from './platformMall/goodsTemplate/templateDetails'
import JDOrder from "./order/JDOrder";
import OrderSet from "./order/orderSet";
import Permissions from "./permissions";
import Department from "./permissions/department";
import Role from "./permissions/role";
import Members from "./permissions/members";
import BusinessInfo from "./user/merchantsList/businessInfo";
import ParentOrder from "./order/platformOrder/parentOrder";
import ReviseGoods from "./order/platformOrder/parentOrder/reviseGoods";
import SubOrder from "./order/platformOrder/subOrder";
import JDOrderList from "./order/JDOrder/orderDetail";
import PendingOrder from "./order/pendingOrder";
import LogisticsManage from "./order/logisticsManage";
import RoleJurisdiction from "./permissions/role/roleJurisdiction";
//路由配置 需要优化
const routes = [
    {
        path:"/home",component:Home, name:"首页",
        routes: [
            {path:"/home",component:HomePage, name:"商城首页",exact:true},
        ]
    },
    {
        path:"/user",component:User, name:"用户",
        routes:[
            {path:"/user",component:Merchants,name:"商户列表",exact:true,},
            {path:"/user/account",component:Account, name:"企牛采账户",exact:true,},
            {path:"/user/BusinessInfo/:id",component:BusinessInfo, name:"商家信息"},
            {path:"/user/account/EnterpriseAccountInfo",component:EnterpriseAccountInfo, name:"企业账户信息"},
        ]
    },
    {
        path:"/platform",component:Platform, name:"商品",
        routes:[
            {path:"/platform",component:GoodsList, name:"商品列表",exact:true},
            {path:"/platform/ProductDetails/:id",component:ProductDetails, name:"商品详情"},
            {path:"/platform/editProduct",component:EditProduct, name:"商品详情"},
            {path:"/platform/JDGoods",component:JDGoods, name:"京东商品"},
            {path:"/platform/GoodsClass",component:GoodsClass, name:"商品分类"},
            {path:"/platform/commodityDetails/:id",component:CommodityDetails, name:"京东商品详情"},
            {path:"/platform/GoodsTemplate",component:GoodsTemplate, name:"商品模板列表"},
            {path:"/platform/TemplateDetails/:id",component:TemplateDetails, name:"商品模板详情"}
        ]
    },
    {
        path:"/order",component:Order, name:"订单",
        routes:[
            {path:"/order",component:PlatformOrder, name:"平台订单列表",exact:true},
            {path:"/order/JDOrder",component:JDOrder, name:"京东订单"},
            {path:"/order/orderSet",component:OrderSet, name:"订单设置"},
            // {path:"/order/orderTracking",component:OrderTracking, name:"订单跟踪"},
            {path:"/order/parentOrder",component:ParentOrder,name:"平台父订单详情",},
            {path:"/order/reviseGoodInfo",component:ReviseGoods,name:"修改商品信息",},
            {path:"/order/subOrder",component:SubOrder,name:"平台子订单详情",},
            {path:"/order/jdOrderList",component:JDOrderList,name:"京东订单详情",},
            {path:"/order/pendingOrder",component:PendingOrder,name:"待处理订单",},
            {path:"/order/logisticsManage",component:LogisticsManage,name:"物流管理",},
        ]
    },
    {
        path:"/permissions",component:Permissions, name:"权限",
        routes:[
            {path:"/permissions",component:Department, name:"部门管理",exact:true},
            {path:"/permissions/role",component:Role, name:"角色管理"},
            {path:"/permissions/members",component:Members, name:"成员管理"},
            {path:"/permissions/roleJurisdiction",component:RoleJurisdiction, name:"权限设置",}
        ],
        
    }
    // { path: "/404", component: Error , name:"404"}
];

export default routes;