import React from "react";
import { Tabs } from "antd"
import { Link } from "react-router-dom";
import AccountDetails from './subAccountPage/accountDetails';
import SubaccountList from './subAccountPage/subaccountList';
import DepartmentManage from './subAccountPage/departmentManage';
import ApprovalManage from './subAccountPage/approvalManage';
import ProjectManage from './subAccountPage/projectManage';
import CompanyLogo from './subAccountPage/companyLogo';
// import api from "../../../../components/api";
import publicFn from "./../../../components/public";
import CategoryManage from './subAccountPage/categoryManage';
import './index.scss';

const { TabPane } = Tabs;


export default class BusinessInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: '1',   //  tab当前被激活的值
            main_accountID: '',    //  id 主账户id
            company_id: '',    // 公司ID
            thirdJur: {}
        }
    }
  
  callback = (key) => {
    this.setState({ activeKey: key });
    sessionStorage.setItem('activekey', key)
  }
    componentDidMount() {
        const activeKey = sessionStorage.getItem('activekey');
        const { location } = this.props;
        let accountID, company_id;
        if (location.state && location.state.id) {
            accountID = location.state.id;
            company_id = location.state.company_id;
            sessionStorage.setItem('accountID', accountID);
            sessionStorage.setItem('company_id', company_id);
        } else {
            accountID = sessionStorage.getItem('accountID');
            company_id = sessionStorage.getItem('company_id');
        }
        this.setState({
            activeKey: activeKey ? activeKey : '1',
            main_accountID: accountID,
            company_id: company_id
        })
    

        const { navList } = this.props;
        // 获取其上一级路由 以此来判断当前路由的权限
        const path = this.props.location.pathname.slice(0, this.props.location.pathname.lastIndexOf('/'))
        const thirdJur = publicFn.thirdPermissions(navList, path)
        console.log('thirdJur', thirdJur);
        this.setState({ thirdJur });

    }
    componentWillUnmount() {
    sessionStorage.removeItem('activekey');
    sessionStorage.removeItem('accountID');
    }
    render() {
        const { activeKey, main_accountID, company_id, thirdJur } = this.state;
        console.log('thirdJur', thirdJur);
        return (
            <div className="accountInfo-box">
                <h4 className="h4-title">企牛采账户详情</h4>
                <Tabs onChange={this.callback} activeKey={activeKey} animated type="line">
                    {
                        Object.keys(thirdJur).length && thirdJur[10].display ?
                            <TabPane tab="账户详情" key="1" forceRender>
                                {
                                    activeKey === '1' ? <AccountDetails accountID={main_accountID} /> : <div></div>
                                }
                            </TabPane> : ''
                    }
                    {
                        Object.keys(thirdJur).length && thirdJur[47].display ?
                        <TabPane tab="子账户列表" key="2">
                            {
                                activeKey === '2' ? <SubaccountList company_id={company_id} accountID={main_accountID} /> : <div></div>
                            }
                        </TabPane> : ''
                    }
                    
                    {
                        Object.keys(thirdJur).length && thirdJur[10].display ?
                            <TabPane tab="部门管理" key="3">
                                {
                                    activeKey === '3' ? <DepartmentManage company_id={company_id} /> : <div></div>
                                }
                            </TabPane> : ''
                    }

                    {
                        Object.keys(thirdJur).length && thirdJur[11].display ?
                            <TabPane tab="审批管理" key="4">
                                {
                                    activeKey === '4' ? <ApprovalManage company_id={company_id} /> : <div></div>
                                }
                            </TabPane> : ''
                    }
                    {
                        Object.keys(thirdJur).length && thirdJur[11].display ?
                            <TabPane tab="项目管理" key="5">
                                {
                                    activeKey === '5' ? <ProjectManage company_id={company_id} /> : <div></div>
                                }
                            </TabPane> : ''
                    }

                    {
                        Object.keys(thirdJur).length && thirdJur[46].display ?
                            <TabPane tab="企业logo" key="6">
                                {
                                    activeKey === '6' ? <CompanyLogo company_id={company_id} /> : <div></div>
                                }
                            </TabPane> : ''
                    }
                    <TabPane tab="类目管理" key="7">
                        {
                            activeKey === '7' ? <CategoryManage company_id={company_id}/> : <div></div>
                        }
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}