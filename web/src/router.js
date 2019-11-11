import React,{PureComponent} from 'react';
import {  HashRouter as Router , Route, Switch,Redirect } from 'react-router-dom';
import RouterConfig from "./routerConfig";
import Login from "./login";
export default class RouterList extends PureComponent{
    constructor(props){
        super(props)
        this.state = {
            threeJur: []
        }
    }

    // componentDidMount(){
    //     const JurisdictArr = JSON.parse(sessionStorage.getItem('Jurisdiction'));

    // }

    render(){
        return(
            <Router>
                <Switch>
                    <Route exact path="/" component={Login} />
                    { RouterConfig && RouterConfig.length && RouterConfig.map((route, i) => {
                        // console.log(route,'-----------')
                        return(
                            <Route key={i} path={route.path} exact={route.exact}
                                render={ props => (
                                    <route.component {...props} routes={route.routes}/>
                                )}
                            />
                        )
                    })}
                    {/*<Redirect to="/404" />*/}
                </Switch>
            </Router>
        )
    }
}
