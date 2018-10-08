import React, {Component} from 'react';
import {connect} from 'react-redux';
import sha512 from 'js-sha512'
import {Form, Input, Button, Notification} from 'element-react';
import {login} from '@/redux/models/admin';
import tools from '@/utils/tools';
import './login.scss';
import httpRequest from '@/utils/httpRequest';
import API from '@/config/api'

@connect(state => ({}), {login})

export default
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      appName: '新华网内容管理系统',
      form: {
        password: '',
        username: ''
      },
      rules: {
        username: [
          {required: true, message: '账号不能为空', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '密码不能为空', trigger: 'blur'},
        ]
      }
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  handleSubmit(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.form.validate((valid) => {
      if (valid) {
        this.setState({
          isLoading: true
        });
        this.submitForm();
      } else {
        console.log('error submit!!');
        return false;
      }
    });
  }

  // 提交表单
  submitForm = () => {
    const {username, password} = this.state.form;
    httpRequest({
      url: API.login,
      type: 'POST',
      dataType: 'json',
      data: {
        login_name: username,
        password: sha512(password)
      }
    }).done((resp) => {
      if (resp.code === 0) {
        const userInfo = resp.data;
        this.loginSuccess(userInfo);
      } else {
        this.setState({
          isLoading: false
        });
        Notification({
          title: '登录失败',
          message: resp.msg,
          type: 'error',
        });
      }
    }).fail(() => {
      this.setState({
        isLoading: false
      });
      Notification({
        title: '登录失败',
        message: '内部服务器错误',
        type: 'error',
      });
    })
  };
  loginSuccess = (userInfo) => {
    this.props.login(userInfo);
    // sessionStorage.setItem('xjb_userInfo', JSON.stringify(userInfo));
    const userInfo_without_node = {...userInfo, nodes: null};
    const userInfo_string = JSON.stringify(userInfo_without_node);
    // 30分钟过期
    tools.setCookie('xinhua_userInfo', userInfo_string, 30 / (24 * 60));
    this.setState({
      isLoading: false
    });
    Notification({
      title: '登陆成功',
      message: `欢迎您，${userInfo.user_name}`,
      type: 'success'
    });
    const params = tools.getParams(decodeURIComponent(window.location.search));
    const backurl = params.backurl || '/';
    this.props.history.push(backurl);
  };

  onChange = (key, value) => {
    this.setState({
      form: Object.assign({}, this.state.form, {[key]: value})
    });
  };
  // 按键抬起
  keyUp = (e) => {
    if (e.keyCode === 13) { // enter
      this.handleSubmit();
    }
  };

  render() {
    const {appName, isLoading} = this.state;
    return (
      <div className="page_wrapper">
        <div className="login">
          <div className="login_left">
            <div className="app_name">
              <p className="title">{appName}</p>
              <p className="sub_title">Content Management System of News.cn</p>

            </div>
          </div>
          <div className="login_right">
            <div className="login_box">
              <div className="formWrapper" onKeyUp={this.keyUp}>
                <h3>{appName}</h3>
                <Form ref="form"
                      model={this.state.form}
                      rules={this.state.rules}
                      labelWidth="60">
                  <Form.Item label="账号" prop="username">
                    <Input value={this.state.form.username}
                           onChange={this.onChange.bind(this, 'username')}/>
                  </Form.Item>
                  <Form.Item label="密码" prop="password">
                    <Input type="password"
                           value={this.state.form.password}
                           onChange={this.onChange.bind(this, 'password')}
                           autoComplete="off"/>
                  </Form.Item>
                  <div className="login_btn">
                    <Button type="primary"
                            loading={isLoading}
                            onClick={this.handleSubmit.bind(this)}>{isLoading ? '登录中...' : '登录'}</Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>

    )
  }
}