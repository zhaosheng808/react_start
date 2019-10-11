import React, {Component} from 'react';
import {connect} from 'react-redux';

import {Dropdown, Dialog, Form, Input, Button, Message, Notification} from 'element-react';
import {signOut, login} from '@/redux/models/admin';
import './header.scss';
import defaultImg from '@/assets/images/default.png';
import httpRequest from '@/utils/httpRequest';
import API from '@/config/api';
import sha512 from 'js-sha512';
import logoImg from '@/assets/images/logo.png';
import tools from '@/utils/tools';
import moment from 'moment';
@connect(state => ({
  admin: state.admin
}), {login, signOut})

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false,
      needChangePass: false, // 是否需要强制更改密码
      expressDate: 0,  // 多久之内需要修改密码
      default_time: 60,
      cutDown_time: 0,
      is_cutDowning: false,
      form: {
        account: '',
        old_password: '',
        new_password: '',
        new_passwordAgain: '',
        phone_num: '',
        code: ''
      },
      rules: {
        old_password: {required: true, message: '请输入旧密码', trigger: 'change'},
        new_password: [
          {required: true, message: '密码不能为空', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              var rC = {
                lW: '[a-z]',
                uW: '[A-Z]',
                nW: '[0-9]',
                sW: '[_]'
              };

              function Reg(str, rStr) {
                let reg = new RegExp(rStr);
                if (reg.test(str)) {
                  return true;
                } else {
                  return false;
                }
              }

              var tR = {
                l: Reg(value, rC.lW),
                u: Reg(value, rC.uW),
                n: Reg(value, rC.nW),
                s: Reg(value, rC.sW)
              };
              if (value === '') {
                return false;
              }
              if (value.length < 8) {
                callback(new Error('密码不能少于8位'));
              } else {
                if ((tR.l && tR.u && tR.n) || (tR.l && tR.u && tR.s) || (tR.s && tR.u && tR.n) || (tR.s && tR.l && tR.n)) {
                  if (this.state.form.new_passwordAgain !== '') {
                    this.refs.ruleForm.validateField('new_passwordAgain');
                  }
                  callback();
                } else {
                  callback(new Error("密码必须含有'小写字母'、'大写字母'、'数字'、'下划线'中的任意三种"));
                }
              }
            },
          }],
        new_passwordAgain: [
          {required: false, message: '请再次输入密码', trigger: 'blur'},
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error('请再次输入密码'));
              } else if (value !== this.state.form.new_password) {
                callback(new Error('两次输入密码不一致!'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          },

        ],
        code: {required: true, message: '请输入验证码', trigger: 'change'},
      },
    };
    this.timer = null; // 验证码倒计时
  }

  componentDidMount() {
    // 判断用户是否修改过密码
    // 如果没有修改密码需要强制修改密码
    const {admin} = this.props;
    if (!admin.lastUpdatePasswordTime) { // 没有修改过密码
      this.show_password_dialog();
      // this.setState({
      //   needChangePass: true,
      // })
    }
  }

  // 获取需要多少天后密码过期
  getLastExpressTime = () => {
    const userInfo = tools.getUserData();
    // 检查上次修改密码时间
    const expressDate = new Date(userInfo.lastUpdatePasswordTime).getTime() + 3600 * 1000 * 24 * 60;
    const diffDay = moment(expressDate).diff(moment(), 'days'); // 距离过期还有多少天
    return diffDay;
  };

  componentWillUnmount() {
    // 清除定时器
    clearInterval(this.timer);
  };

  quit = () => {
    httpRequest({
      url: API.logout,
      type: 'POST',
      dataType: 'json',
      data: {}
    }).done(() => {
      this.clearData();
    }).fail(() => {
      this.clearData();
    })
  };
  clearData = () => {
    tools.removeUserData();
    this.props.signOut();
  };
  // 确认弹框关闭
  close_dialog = () => {
    const {needChangePass} = this.state;
    if (needChangePass) {
      Message.warning('请先修改一次密码再进行其他操作!');
    } else {
      this.setState({
        dialogVisible: false,
      })
    }
  };
  // 修改密码
  show_password_dialog = () => {
    this.handleReset();
    const {admin} = this.props;
    const form = {
      account: admin.userLoginName,
      old_password: '',
      new_password: '',
      new_passwordAgain: '',
      phone_num: admin.mobile,
      code: ''
    };
    this.setState({
      dialogVisible: true,
      form: form
    })
  };
  // 重置表单
  handleReset() {
    this.refs.ruleForm.resetFields();
  }

  onChange = (key, value) => {
    this.setState({
      form: Object.assign({}, this.state.form, {[key]: value})
    });
  };
  // 获取验证码
  getCode = () => {
    const {form} = this.state;
    if (!form.phone_num) {
      Message.error('手机号码不存在，请先联系管理员更改手机号!');
    } else {
      const {default_time} = this.state;
      this.setState({
        is_cutDowning: true,      // 正在倒计时
        cutDown_time: default_time
      }, () => {
        this.getCodeAjax();
        this.timer = setInterval(this.cutDown, 1000);
      });
    }
  };
  // 获取验证码
  getCodeAjax = () => {
    httpRequest({
      url: API.getCode,
      type: 'POST',
      dataType: 'json',
      data: {
        mobile: this.state.form.phone_num
      }
    }).done((resp) => {
      if (resp.code === 200) {
        Message.success('验证码发送成功！请注意查收');
      } else {
        Message.error(resp.msg);
      }
    }).fail((err) => {
      Notification({
        title: '操作失败',
        message: '内部服务器错误 ' + err.status,
        type: 'error',
      });
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
  // 验证表单是否填写完毕
  validate_form = (success) => {
    this.refs.ruleForm.validate((valid) => {
      if (valid) {
        if (typeof success === 'function') {
          success();
        }
      } else {
        console.log('error submit!!');
        return false;
      }
    });
  };
  // 确定按钮
  handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    const {form} = this.state;
    this.validate_form(() => {
      httpRequest({
        url: API.revisePassword,
        type: 'POST',
        dataType: 'json',
        data: {
          oldPassword: sha512(form.old_password),
          newPassword: sha512(form.new_password),
          confirmPassword: sha512(form.new_passwordAgain),
          mobile: form.phone_num,
          // code: form.code,
        }
      }).done((resp) => {

        if (resp.code === 200) {
          Message.success('操作成功');
          // const lastUpdatePasswordTime = resp.data || moment().format('YYYY-MM-DD HH:mm:ss');
          this.setState({
            dialogVisible: false
          });
          // this.changeUserInfo({lastUpdatePasswordTime});
        } else {
          Message.error(resp.msg);
        }
      }).fail((err) => {
        Notification({
          title: '操作失败',
          message: '内部服务器错误 ' + err.status,
          type: 'error',
        });
      })
    })
  };
  // 修改用户信息
  changeUserInfo = (info = {}) => {
    const userInfo = tools.getUserData();
    const newUserInfo = {...userInfo, ...info};

    this.props.login(newUserInfo);
    const userInfo_string = JSON.stringify(newUserInfo);
    const userInfo_string_escape = window.encodeURIComponent(userInfo_string);
    localStorage.setItem('WeClip_userInfo', userInfo_string_escape);
  };

  render() {
    const {admin} = this.props;
    const {dialogVisible, form, cutDown_time, is_cutDowning} = this.state;
    // const expressDiff = this.getLastExpressTime();
    // const formatExpressDate = Math.max(0, expressDiff);
    return (
      <div className="app_header">
        <div className="appIcon">
          <div className="applogo"><img src={logoImg} alt=""/></div>
          WeClip<span>客户端运营平台</span></div>
        <div className="user_info">
          <Dropdown trigger="click" menu={(
            <Dropdown.Menu>
              <Dropdown.Item>
                <div onClick={this.show_password_dialog}>修改密码</div>
              </Dropdown.Item>

              <Dropdown.Item divided>
                <div onClick={this.quit}>退出</div>
              </Dropdown.Item>
            </Dropdown.Menu>
          )}
          >
      <span className="el-dropdown-link">
        <div className="img_head">
          <img src={admin.head_image || defaultImg} alt="" className="head_img"/>
        </div>
        {admin.nickname || '默认昵称'}<i className="el-icon-setting el-icon--right"/>
      </span>
          </Dropdown>
        </div>
        {/*一周内提示修改密码*/}
        {/*<div className="other_tips">*/}
          {/*{(formatExpressDate && formatExpressDate < 8) ? <div className="express_tips">*/}
            {/*请在 <span>{formatExpressDate}</span> 天之内修改密码*/}
          {/*</div> : ''}*/}


        {/*</div>*/}

        {/* 修改密码弹框*/}
        <Dialog
          title='修改密码'
          visible={ dialogVisible }
          closeOnClickModal={false}
          onCancel={ this.close_dialog }
        >
          <Dialog.Body style={{paddingTop: '0'}}>

            <Form model={form}
                  ref="ruleForm"
                  rules={this.state.rules}
                  labelWidth="80">
              <Form.Item label="" style={{marginBottom: 0}}>
                <p>上次修改密码时间：{admin.lastUpdatePasswordTime ? admin.lastUpdatePasswordTime :
                  <span style={{color: 'red'}}>未修改过密码</span>}</p>
                {/*<p style={{color: 'red'}}>为了您的账号安全，请定期修改密码（连续两个月未修改密码将不能正常登录）</p>*/}

              </Form.Item>

              <Form.Item label="账号">
                <div>{form.account}</div>
              </Form.Item>
              <Form.Item label="旧密码" prop="old_password">
                <Input value={form.old_password}
                       onChange={this.onChange.bind(this, 'old_password')}
                       type="password"
                       autoComplete="off"/>
              </Form.Item>
              <Form.Item label="新密码" prop="new_password">
                <Input value={form.new_password}
                       type="password"
                       onChange={this.onChange.bind(this, 'new_password')}
                       autoComplete="off"/>
              </Form.Item>
              <Form.Item label="确认密码" prop="new_passwordAgain">
                <Input value={form.new_passwordAgain}
                       type="password"
                       onChange={this.onChange.bind(this, 'new_passwordAgain')}
                       autoComplete="off"/>
              </Form.Item>
              <Form.Item label="手机号" prop="phone_num">
                <Input value={form.phone_num}
                       // className="mini_input"
                       disabled={true}
                       onChange={this.onChange.bind(this, 'phone_num')}
                       autoComplete="off"/>
                {/*<Button type='info'*/}
                        {/*size='small'*/}
                        {/*className="code_btn"*/}
                        {/*disabled={is_cutDowning}*/}
                        {/*onClick={ this.getCode }>{is_cutDowning ? `重新获取(${cutDown_time}s)` : '获取验证码'}</Button>*/}
                <p style={{color: '#666666', fontSize: '12px'}}>(如需修改绑定手机号，请联系管理员)</p>
              </Form.Item>
              {/*<Form.Item label="验证码" prop="code">*/}
                {/*<Input value={form.code}*/}
                       {/*onChange={this.onChange.bind(this, 'code')}*/}
                       {/*autoComplete="off"/>*/}
              {/*</Form.Item>*/}
            </Form>
          </Dialog.Body>

          <Dialog.Footer className="dialog-footer">
            <Button onClick={ this.close_dialog }>取 消</Button>
            <Button type="primary"
                    onClick={ this.handleSubmit }>确 定</Button>
          </Dialog.Footer>
        </Dialog>
      </div>
    )
  }
}
export default Header