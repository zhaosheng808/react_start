/**
 * Created by DELL on 2018/12/3.
 */

import React, {Component} from 'react';

import {
  Button,
  Form,
  Select,
  Message,
  Notification,
  MessageBox,
  Dialog,
  // Loading,
} from 'element-react';

import httpRequest from '@/utils/httpRequest';
import api from '@/config/api';
import PowerButton from '@/components/PowerButton'

/*CMS  cms更新*/
export default
class CmsUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false, // 弹框是否显示
      is_loading: false,    // 数据请求中
      form: {               // 一键下线form
        platform: 'test'
      },
      currentStatus: {     // 当前部署状态
        jobId: '',
        message: '',
      },
      platformAll: [
        {name: 'CMS前端', value: 'cms'},
        {name: 'CMS接口', value: 'cms_api'},
        {name: '客户端API', value: 'api'},
        {name: 'h5', value: 'h5'},
        {name: '测试', value: 'test'},
      ],
      rules: {
        platform: {required: true, message: '部署平台不能为空', trigger: 'blur'},
      }
    };
    this.timer = null;
  }

  componentWillMount() {

  };

  componentWillUnmount() {
    clearTimeout(this.timer);
  };

  // 获取平台
  getPlatform = (platformID) => {
    const {platformAll} = this.state;
    const platformItem = platformAll.find(item => {
        return item.value === platformID
      }) || {};
    return platformItem.name || '未知';
  };
  // 确认弹框
  handleSubmit = () => {
    this.validate_form('ruleForm', () => {
      const {form} = this.state;
      const {platform = 'test'} = form;
      const platformName = this.getPlatform(platform);
      const warning_title = `确认是否部署平台 【 ${platformName} 】 ？`;
      this.sure_again(warning_title, () => {
        httpRequest({
          url: api.codeRelease_index,
          type: 'POST',
          data: {
            platform: platform,
          }
        }).done(resp => {
          if (resp.code === 0) {
            Message.success('任务提交成功');
            // 清除定时器
            clearTimeout(this.timer);
            this.setState({
              currentStatus: {jobId: resp.data},
              dialogVisible: false
            }, () => {
              this.getJobStatus();
            });
          } else {
            Message.error('任务提交失败：' + resp.msg);
          }
        }).fail(err => {
          Notification.error({
            title: '任务提交失败',
            message: '内部服务器错误' + err.status
          });
        })
      })
    });
  };
  // 获取部署状态
  getJobStatus = () => {
    const {currentStatus = {}} = this.state;
    const {jobId} = currentStatus;
    if (jobId) {
      httpRequest({
        url: api.codeRelease_result,
        type: 'POST',
        data: {
          uuid: jobId,
        }
      }).done(resp => {
        if (resp.code === 0) {
          this.setState({
            currentStatus: {...currentStatus, message: resp.data}
          });
          this.timer = setTimeout(() => {
            this.getJobStatus()
          }, 2000)
        } else {
          Message.error('状态查询失败：' + resp.msg);
        }
      }).fail(err => {
        Notification.error({
          title: '状态查询失败',
          message: '内部服务器错误' + err.status
        });
      })
    }
  };
  // 二次确认
  sure_again = (title, callback) => {
    MessageBox.confirm(title, '提示', {
      type: 'warning'
    }).then(() => {
      callback();
    }).catch(() => {
    });
  };
  // 验证表单是否填写完毕
  validate_form = (formName, success) => {
    const form_ref = formName || 'ruleForm';
    this.refs[form_ref].validate((valid) => {
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


  _onChange = (key, value) => {
    this.setState({
      form: Object.assign({}, this.state.form, {[key]: value})
    });
  };
  // 重置表单
  handleReset(formName) {
    const form_ref = formName || 'ruleForm';
    this.refs[form_ref].resetFields();
  }

  updateClick = () => {
    this.setState({
      dialogVisible: true
    })
  };
  // 关闭弹窗
  close_dialog = () => {
    this.setState({
      dialogVisible: false
    })
  };

  render() {
    const {dialogVisible, form, platformAll, currentStatus} = this.state;
    return (
      <div className="content_wrapper">
        <p className="notice"><i>仅供开发者使用，不对外开放</i></p>
        <PowerButton webButton='update'
                     type='info'
                     onClick={this.updateClick}>一键部署</PowerButton>
        {currentStatus.jobId ? (<div className="terminal_panel">
          <span>当前部署工程JOB_ID: <i>{currentStatus.jobId}</i></span>
          <p>执行结果</p>
          <pre>
          <code dangerouslySetInnerHTML={{__html: currentStatus.message}}/>
        </pre>
        </div>) : ''}
        {/*新增路由*/}
        <Dialog
          title='一键部署'
          visible={ dialogVisible }
          closeOnClickModal={false}
          onCancel={ this.close_dialog }
        >
          <Dialog.Body>
            <Form model={form}
                  ref="ruleForm"
                  rules={this.state.rules}
                  labelWidth="80">
              <Form.Item label="部署平台" prop="platform">
                <Select value={form.platform}
                        placeholder='选择平台'
                        onChange={this._onChange.bind(this, 'platform')}>
                  {
                    platformAll.map((el, index) => {
                      return <Select.Option key={index}
                                            label={el.name}
                                            value={el.value}
                                            disabled={el.disabled}/>
                    })
                  }
                </Select>
              </Form.Item>
            </Form>
          </Dialog.Body>
          <Dialog.Footer className="dialog-footer">
            <Button onClick={ this.close_dialog }>取 消</Button>
            <Button type="primary"
                    onClick={ this.handleSubmit}>确 定</Button>
          </Dialog.Footer>
        </Dialog>
      </div>
    )
  }
}