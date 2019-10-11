import React, {Component} from 'react';
import {connect} from 'react-redux';
import sha512 from 'js-sha512'
import {Form, Input, Button, Notification, Message} from 'element-react';
import {login} from '@/redux/models/admin';
import tools from '@/utils/tools';

import './login.scss';
import httpRequest from '@/utils/httpRequest';
import API from '@/config/api';
import {ReleaseTime} from '@/config/baseConfig';

export default
@connect(state => ({}), {login})
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      show_360tips: false,  // 非IE模式提示360急速模式切换方式
      appName: '吱声运营管理平台',
      appName_en: 'Content Management System of ZiSheng-App',
      form: {
        password: '',      // 密码
        username: '',     // 用户名
        phone_num: '',        // 电话号码
        message_code: '', // 短信验证码
        image: '',      //  图片验证码图片
        image_code: '', // 图片验证码
      },
      randomNum: '0',   // 随机数
      default_time: 120,
      cutDown_time: 0,
      visibility: false, // 版本号是否可见
      needImageCode: false,  //  是否需要图形验证码
      // needImageCode: true,  //  是否需要图形验证码
      is_cutDowning: false,  // 短信倒计时
      rules: {
        username: [
          {required: true, message: '账号不能为空', trigger: 'change'}
        ],
        password: [
          {required: true, message: '密码不能为空', trigger: 'change'},
        ],
        phone_num: [
          {required: true, message: '电话号码不能为空', trigger: 'change'},
        ],
        message_code: [
          {required: true, message: '短信验证码不能为空', trigger: 'change'},
        ],
        image_code: [
          {required: true, message: '图形验证码不能为空', trigger: 'change'},
        ],
      }
    };
    this.timer = null;
  }

  componentWillMount() {

  };

  componentDidMount() {
    this.checkBrowser();
    this.checkHasLogin();
    this.animation()
  }

  animation = () => {

  }

  componentWillUnmount() {
    // 清除定时器
    clearInterval(this.timer);
  };

  // 检测用户浏览器
  checkBrowser = () => {
    const browserName = tools.browser();
    if (browserName !== 'Chrome') {
      Notification.warning({
        title: '温馨提示',
        message: `建议使用 谷歌浏览器 或者 360浏览器选择极速模式 访问该页面`,
        duration: 0         // 显示时间, 毫秒。设为 0 则不会自动关闭
      })
    }
  };
  // 检测用户是否登录
  checkHasLogin = () => {
    const userInfo = tools.getUserData();
    if (userInfo['auth-token']) { // 用户已登录
      if (this.props.history) {
        this.props.history.push('/');
      }
    }
  };
  // 生成随机数
  getRandom = () => {
    const randomNum = ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
    const randomPassword = 'Xh' + randomNum;
    this.setState({
      randomNum: randomPassword
    })
  };

  handleSubmit(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
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
    setTimeout(() => {
      const userInfo = {
        'auth-token': "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxODQwODIyNjQ4MCIsInN1YiI6IntcImFnZW50XCI6XCIxXCIsXCJpZFwiOjEsXCJ1c2VyTmFtZVwiOlwiYWRtaW5cIn0iLCJleHAiOjE1NzEzOTE1NjR9.gpimbIT4jtTS4slOXKde4LM2jxIL0G_i4VVCgrv9B2k145",
        avatar: "",
        lastUpdatePasswordTime: "2019-09-27 17:01:58",
        mobile: "18408226480",
        nickname: "超级管理员",
        uid: 1,
        updatePasswordTime: 0,
        username: "admin",
      };
      this.loginSuccess(userInfo);
    }, 2000)
    // const {username, password, message_code} = this.state.form;
    // httpRequest({
    //   url: API.login,
    //   type: 'POST',
    //   dataType: 'json',
    //   data: {
    //     username: username,
    //     password: sha512(password),
    //     code: message_code,
    //     // picCode: image_code,
    //     // password: password
    //   }
    // }).done((resp) => {
    //   if (resp.code === 200) {
    //     const userInfo = resp.data;
    //     this.loginSuccess(userInfo);
    //   } else {
    //     this.setState({
    //       isLoading: false
    //     });
    //     Notification({
    //       title: '登录失败',
    //       message: resp.msg,
    //       type: 'error',
    //     });
    //   }
    // }).fail((err) => {
    //   this.setState({
    //     isLoading: false
    //   });
    //   Notification({
    //     title: '登录失败',
    //     message: '内部服务器错误 ' + err.status || '0',
    //     type: 'error',
    //   });
    // })
  };
  loginSuccess = (userInfo) => {
    this.props.login(userInfo);
    tools.setUserData(userInfo);
    localStorage.setItem('zishengCMS_lastOperation', new Date().getTime());

    this.setState({
      isLoading: false
    });
    Notification({
      title: '登录成功',
      message: `欢迎您，${userInfo.nickname}`,
      type: 'success'
    });

    const params = tools.getParams();
    // 未登录会重定向到登录页面，携带当前url
    const callback = params.callback;
    if (callback) {
      window.location.href = decodeURIComponent(callback);
    } else {
      this.props.history.push('./');
    }
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
  // 获取短信验证码
  getMessageCode = () => {
    const {needImageCode, form} = this.state;
    if (form.username.length < 1) {
      Message.warning('请输入正确的账号！');
      return false;
    }
    if (needImageCode && form.image_code.length < 1) {
      Message.warning('请输入验证码！');
      return false;
    }
    const {default_time} = this.state;
    this.setState({
      is_cutDowning: true,      // 正在倒计时
      cutDown_time: default_time
    }, () => {
      this.getMessageCodeAjax();
      this.timer = setInterval(this.cutDown, 1000);
    });
  };
  // 获取验证码
  getMessageCodeAjax = () => {
    const {form = {}, default_time} = this.state;
    const {username = '', image_code = ''} = form;
    httpRequest({
      url: API.sendMes,
      type: 'POST',
      dataType: 'json',
      data: {
        login_name: username,
        picCode: image_code.toUpperCase(),
      }
    }).done((resp) => {
      if (resp.code === 200) {
        let message = '短信验证码发送成功';
        if (resp.data) {
          message = `已向 ${resp.data} 发送验证码`
        }
        Message({
          message: message,
          type: 'success',
          duration: 8000,
          showClose: true,
        });
        // this.getRandom();
      } else {

        // let needImageCode = false;
        let {needImageCode} = this.state;
        if (resp.code === -2) { // 需要图形验证码

          if (!needImageCode) {  // 第一次出现验证码提示输入验证码 不是提示发送失败
            Message.warning('请先输入图形验证码！');
          } else {
            Notification({
              title: '验证码发送失败',
              message: resp.msg,
              type: 'error',
            });
          }
          this.getRandom();
          needImageCode = true;
        } else {
          needImageCode = false;
          Notification({
            title: '验证码发送失败',
            message: resp.msg,
            type: 'error',
          });
        }


        clearInterval(this.timer);
        this.setState({
          is_cutDowning: false,
          cutDown_time: default_time,
          needImageCode,
        })
      }
    }).fail((err) => {
      const {default_time} = this.state;
      Notification({
        title: '验证码发送失败',
        message: '内部服务器错误' + err.status,
        type: 'error',
      });
      clearInterval(this.timer);
      this.setState({
        is_cutDowning: false,
        cutDown_time: default_time
      })
    })
  };
  // 倒计时
  cutDown = () => {
    let {cutDown_time, default_time} = this.state;
    if (cutDown_time > 0) {
      cutDown_time = cutDown_time - 1;
    } else {
      clearInterval(this.timer);
      cutDown_time = default_time;
      this.setState({
        is_cutDowning: false
      })
    }
    this.setState({
      cutDown_time: cutDown_time
    })
  };
  _change_visibility = () => {
    this.setState({
      visibility: !this.state.visibility
    })
  };

  render() {
    const {appName, appName_en, isLoading, show_360tips, form, visibility} = this.state;
    // const image_code = API.verifyCode + '?id=' + randomNum;
    return (
      <div className="login">
        <div className="login_left">
          <div className="app_name">
            <p className="title">{appName}</p>
            <p className="sub_title">{appName_en}</p>

          </div>
          <div className="app_time" onClick={this._change_visibility}>
            <span style={{visibility: visibility ? 'visible' : 'hidden'}}>CMS打包时间：{ReleaseTime}</span>
          </div>
        </div>
        <div className="login_right">
          {/*非谷歌浏览器提示*/}
          {show_360tips ? <div className="tips_360">
            tips: <a href="https://jingyan.baidu.com/article/4f7d5712ffb6ce1a201927c4.html"
                     rel="nofollow me noopener noreferrer"
                     target="_blank">360浏览器设置 <span style={{color: 'red'}}>极速模式</span> 教程</a>
          </div> : ''}

          <div className="login_box">
            <div className="formWrapper">
              <h3>{appName}</h3>
              <Form ref="form"
                    model={form}
                    rules={this.state.rules}
                    labelWidth="100">
                <Form.Item label="账号" prop="username">
                  <Input value={form.username}
                         onKeyUp={this.keyUp}
                         onChange={this.onChange.bind(this, 'username')}/>
                </Form.Item>
                {/*<Form.Item label="手机号" prop="phone_num">*/}
                {/*<Input value={this.state.form.phone_num}*/}
                {/*type="number"*/}
                {/*onKeyUp={this.keyUp}*/}
                {/*onChange={this.onChange.bind(this, 'phone_num')}/>*/}
                {/*</Form.Item>*/}
                <Form.Item label="密码" prop="password">
                  <Input type="password"
                         value={form.password}
                         onKeyUp={this.keyUp}
                         onChange={this.onChange.bind(this, 'password')}
                         autoComplete="off"/>
                </Form.Item>

                {/* {needImageCode ? <Form.Item label="图形验证码" prop="image_code">
                 <Input value={form.image_code}
                 className="tiny_input"
                 onChange={this.onChange.bind(this, 'image_code')}
                 autoComplete="off"/>
                 <div className="image-code" onClick={this.getRandom}>{<img src={image_code} alt=""/>}</div>
                 </Form.Item> : ""}

                 <Form.Item label="验证码" prop="message_code">
                 <Input value={form.message_code}
                 className="tiny_input"
                 onKeyUp={this.keyUp}
                 onChange={this.onChange.bind(this, 'message_code')}
                 autoComplete="off"/>
                 <Button type='info'
                 size='small'
                 className="code_btn"
                 disabled={is_cutDowning}
                 onClick={ this.getMessageCode }>{is_cutDowning ? `重新获取(${cutDown_time}s)` : '获取验证码'}</Button>
                 </Form.Item> */}

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
    )
  }
}