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

    const userInfo = tools.getUserData_storage();

    if (userInfo.token) {
      this.props.login(userInfo);
    }
  }

  componentDidMount() {
  }

  authLogin = () => {
    const userInfo = tools.getUserData_storage();
    const {admin = {}} = this.props;
    if (admin.token || userInfo.token) {  // 已登录
      return <Layout/>
    } else {                                           // 未登录 -》 重定向到登录页面
      const callback = window.location.href;
      return <Redirect to={{
        pathname: '/login',
        search: callback ? '?callback=' + encodeURIComponent(callback) : '',
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

