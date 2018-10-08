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
import tools from '@/utils/tools';
import {login} from '@/redux/models/admin';

@connect(state => ({
    admin: state.admin
  }),
  {login}
)
export default
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
    const userInfo_string = tools.getCookie('xinhua_userInfo');
    let userInfo = {};
    if (userInfo_string) {
      userInfo = JSON.parse(userInfo_string);
    }
    if (userInfo.token) {
      this.props.login(userInfo);
    }
  }

  componentDidMount() {
  }

  authLogin = () => {
    const userInfo_string = tools.getCookie('xinhua_userInfo');
    let userInfo = {};
    if (userInfo_string) {
      userInfo = JSON.parse(userInfo_string);
    }
    const {admin = {}} = this.props;
    if (admin.token || userInfo.token) {  // 已登录
      return <Layout/>
    } else {                                           // 未登录 -》 重定向到登录页面
      let backurl = '';
      if (this.props.location) {
        backurl = this.props.location.pathname;
      }
      return <Redirect to={{
        pathname: '/login',
        search: backurl ? '?backurl=' + encodeURIComponent(backurl) : '',
      }}/>
    }

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

