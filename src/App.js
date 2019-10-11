import React, {Component} from 'react';
import {
  Switch,
  Redirect,
  Route,
  HashRouter as Router,
  // Link
} from 'react-router-dom';

import {connect} from 'react-redux';

import Login from './pages/Login/login';
import NotFound from './pages/NotFound';
import Layout from './pages/Layout';
import {login} from '@/redux/models/admin';
import tools from '@/utils/tools';
import {Notification} from 'element-react';
// import {_environment} from '@/config/baseConfig';
// import '../src/assets/font/iconfont.css'

if (!window.String.prototype.trim) {
  /*---------------------------------------
   * 清除字符串两端空格，包含换行符、制表符
   *---------------------------------------*/
  window.String.prototype.trim = function () {
    return this.replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, "");
  }
}

export default
@connect(state => ({
    admin: state.admin
  }),
  {login},
  undefined,
  {pure: true}
)
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentWillMount() {

    /*
     * 刷新会导致用户数据丢失,
     * 如果有本地数据，需要将用户信息从本地储存中加载到redux中
     * */
    const userInfo = tools.getUserData();
    // console.log(userInfo)
    if (userInfo['auth-token']) {
      this.props.login(userInfo);
    }
  }

  componentDidMount() {
    // 隐藏首屏loading加载
    document.querySelector('#page-loading').style.display = 'none';
  }

  authLogin = () => {
    const userInfo = tools.getUserData();
    const lastOperation = (localStorage.getItem('zishengCMS_lastOperation') || '0') / 1;
    const diffTime = new Date().getTime() - lastOperation;
    const expressMin = 720; // 12*60 分钟过期(12小时过期)
    let expire = true; // 登录过期
    if (diffTime < expressMin * 60 * 1000) {
      expire = false;
    }
    const {admin = {}} = this.props;
    if (admin.token || userInfo['auth-token']) {  // 已登录
      // return <Layout/>
      if (!expire) {
        return <Layout/>
      } else {
        tools.removeUserData_storage();
        Notification({
          title: '登录已过期',
          message: '登录信息已过期,请重新登录',
          type: 'error',
        });
        return this.getRedirect()
      }
    } else {                                           // 未登录 -》 重定向到登录页面
      return this.getRedirect()
    }
  };
  getRedirect = () => {
    const callback = window.location.href;
    return <Redirect to={{
      pathname: '/login',
      search: callback ? '?callback=' + encodeURIComponent(callback) : '',
    }}/>
  };

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/404" component={NotFound}/>
          <Route path="/" render={this.authLogin}/>
        </Switch>
      </Router>
    );
  }
}
