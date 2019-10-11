/**
 * Created by DELL on 2018/10/9.
 */
import React, {Component} from 'react';
import {
  Table,
  Button,
  Dialog,
  Form,
  Input,
  Select,
  DatePicker,
  DateRangePicker,
  Message,
  Loading,
  MessageBox,
  Radio,
  Pagination,
  Notification
} from 'element-react';
import httpRequest from '@/utils/httpRequest';
import api from '@/config/api';
import moment from 'moment';
import sha512 from 'js-sha512';
import PowerButton from '@/components/PowerButton';

const _date = new Date();
const next_year = _date.setTime(_date.getTime() + 3600 * 1000 * 24 * 365);
const pre_expire_time = moment(next_year)._d; // 初步预计1年过期

const validator = (rule, value, callback) => {
  if (value) {
    callback();
  } else {
    callback(new Error('过期时间不能为空'));
  }
};

const password_validator = (rule, value, callback) => {
  if (value.length >= 6) {
    callback();
  } else {
    callback(new Error('密码长度不能小于6位'));
  }
};
/*人员管理*/
export default
class UserManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false, // 弹框是否显示
      isAdd: false,    // 新增
      page_size: 10,
      current_page: 1,
      total: 0,
      form: {
        uid: '',
        status_freeze: '',
        username: '',
        name: '',
        phone: '',
        password: '',
        role_id: '',
        expiration_time: pre_expire_time,
        description: ''
      },
      searchForm: {              // 搜索框
        keyword: '',             // 关键字
        timeRange: [],           // 时间范围
        roleId: 0,               // 角色筛选
        statusFreeze: 2             // 0正常 -1冻结 2全部
      },
      freezeTypes: [           // 状态
        {name: '正常', value: 0},
        {name: '冻结', value: -1},
        {name: '全部', value:2}
      ],
      roleList: [],  // 角色列表
      rules: {
        username: {required: true, message: '登录名不能为空', trigger: 'blur'},
        name: {required: true, message: '姓名不能为空', trigger: 'blur'},
        phone: {required: true, message: '电话号码不能为空', trigger: 'blur'},
        password: [
          {required: true, message: '密码不能为空', trigger: 'blur'},
          {validator: password_validator, trigger: 'blur'},
        ],
        expiration_time: [
          {validator: validator, required: true, message: '过期时间不能为空', trigger: 'blur'},
        ],
        role_id: {type: 'number', required: true, message: '角色不能为空', trigger: 'change'},
        status_freeze: {type: 'number', required: true, message: '状态不能为空', trigger: 'change'},
      },
      columns: [
        {
          label: "ID",
          prop: "uid",
          width: 60
        },
        {
          label: "账号",
          prop: "username"
        },
        {
          label: "姓名",
          prop: "nickname",
          width: 100
        },
        {
          label: "电话",
          prop: "mobile",
        },
        {
          label: "角色",
          render: (row) => {
            return <span>{this.get_roleName(row.roleId)}</span>
          }
        },
        {
          label: "最近登录时间",
          prop: "lastLoginTime"
        },
        // {
        //   label: "开通时间",
        //   prop: "addTime "
        // },
        {
          label: "到期时间",
          prop: "expirationTime"
        },
        {
          label: "状态",
          prop: "statusFreeze",
          width: 70,
          render: (row) => {
            return <span>{this.getStatus(row.statusFreeze)}</span>
          }
        },
        {
          label: "操作",
          render: (row) => {
            return (
              <span>
                  <PowerButton webButton="editor"
                               type="info"
                               size="small"
                               onClick={this.editRole.bind(this, row)}>编辑</PowerButton>

                {/*超级管理员不能被冻结*/}
                {row.id !== 1 ? <span>
                   {row.statusFreeze === 0 ?
                     <PowerButton webButton="freeze"
                                  type="warning"
                                  size="small"
                                  onClick={this.freezeRole.bind(this, row)}>冻结</PowerButton> :
                     <PowerButton webButton="unfreeze"
                                  type="success"
                                  size="small"
                                  onClick={this.relieve.bind(this, row)}>解除冻结</PowerButton>}
                </span> : ''}

                {/*超级管理员不能被删除*/}
                {/* {row.id !== 1 ? <span>
                     <PowerButton webButton="freeze"
                                  type="danger"
                                  size="small"
                                  onClick={this.delRole.bind(this, row)}>删除</PowerButton>
                </span> : ''} */}
            </span>
            )
          }
        }
      ],
      data: []
    }
  }

  componentWillMount() {
    this.getRoleList();
  };

  // 获取所有角色
  getRoleList = () => {
    this.setState({
      is_loading: true
    });
    httpRequest({
      url: api.sysUser_listAllRole,
      type: 'post',
      data: {   //获取角色下拉框数据，由于角色接口已做筛选，所以状态传全部，num为10000条
        // page: 1,
        // num: 10000,  
        // keyword: '',
        // roleStatus: 2,
        // addTime : '',
        // endDate: '',
        status:1,
      }
    }).done((resp) => {
      if (resp.code === 200) {
        this.setState({
          roleList: resp.data || [],
        }, () => {
          this.getList();
        })
      } else {
        Message.error(resp.msg);
      }
    }).fail(jqXHR => {
      Notification.error({
        title: '接口请求失败',
        message: '内部服务器错误' + jqXHR.status
      });
    })
  };
  // 获取列表
  getList = () => {
    this.setState({
      is_loading: true
    });

    const {current_page, page_size, searchForm} = this.state;
    let addTime  = '';
    let endDate = '';
    if (searchForm.timeRange.length > 0) {
      addTime  = moment(searchForm.timeRange[0]).format('YYYY-MM-DD');
      endDate = moment(searchForm.timeRange[1]).format('YYYY-MM-DD');
    }
    // 去除搜索字符串前后
    if (searchForm.keyword) {
      searchForm.keyword = searchForm.keyword.trim()
    }
    httpRequest({
      url: api.sysUser_list,
      type: 'post',
      data: {
        page: current_page,
        num: page_size,
        keyword: searchForm.keyword,
        statusFreeze: searchForm.statusFreeze,
        roleId: searchForm.roleId,
        addTime : addTime ,
        endDate: endDate,
      }
    }).done((resp) => {
      if (resp.code === 200) {
        this.setState({
          data: resp.data.list || [],
          total: resp.data.total,
          is_loading: false
        })
      } else {
        Message.error(resp.msg);
      }
    }).fail(jqXHR => {
      Notification.error({
        title: '接口请求失败',
        message: '内部服务器错误' + jqXHR.status
      });
    })
  };

  // 搜索
  handleSearchClick = () => {
    this.setState({
      current_page: 1,
    }, () => {
      this.getList();
    })
  };
// 重置表单
  handleReset() {
    this.refs.ruleForm.resetFields();
  }

  // 搜索条件表单
  onSearchForm_change = (key, reload, value) => {
    this.setState({
      searchForm: Object.assign({}, this.state.searchForm, {[key]: value})
    }, () => {
      if (reload) {
        this.setState({
          current_page: 1,
          data: []
        }, () => {
          this.getList();
        })
      }
    });
  };
  // 获取人员状态
  getStatus = (statusID) => {
    const {freezeTypes} = this.state;
    const freezeItem = freezeTypes.find(item => {
        return item.value === statusID
      }) || {};
    return freezeItem.name || '未知';
  };
  // 获取角色名称
  get_roleName = (roleId) => {
    const {roleList} = this.state;
    const roleItem = roleList.find(item => {
        return item.id === roleId
      }) || {};
    return roleItem.name || '未知';
  };
  // 新增人员
  addRole = () => {
    this.handleReset();
    const {form} = this.state;
    const newForm = {...form, expiration_time: pre_expire_time, uid: '', status_freeze: 0, password: ''};
    this.setState({
      dialogVisible: true,
      form: newForm,
      is_add: true,
    })
  };
  // 编辑人员
  editRole = (row) => {
    this.handleReset();
    let expiration_time = pre_expire_time;
    if (row.expirationTime) {
      expiration_time = moment(row.expirationTime)._d;
    }
    const newForm = {
      uid: row.uid,
      username: row.username,
      name: row.nickname,
      phone: row.mobile,
      status_freeze: row.statusFreeze,
      password: '',
      role_id: row.roleId,
      expiration_time: expiration_time,
      description: row.description
    };
    this.setState({
      dialogVisible: true,
      form: newForm,
      is_add: false,
    })
  };
  // 删除
  delRole = (row) => {
    const warning_title = `确认是否删除人员 ${row.nickname} ？`;
    this.sure_again(warning_title, this.freeze_ajax.bind(this, row.uid, -2))
  };
  // 冻结人员
  freezeRole = (row) => {
    const warning_title = `确认是否冻结人员 ${row.nickname} ？`;
    this.sure_again(warning_title, this.freeze_ajax.bind(this, row.uid, -1))
  };
  freeze_ajax = (uid, status) => {
    httpRequest({
      url: status / 1 === -1 ? api.sysUser_freeze : api.sysUser_unfreeze,
      type: 'post',
      data: {
        uid: uid,
        // statusFreeze: status,
      }
    }).done(resp => {
      if (resp.code === 200) {
        Message.success('操作成功');
        this.getList()
      } else {
        Message.error('操作失败：' + resp.msg);
      }
    })
  };

  // 解除冻结
  relieve = (row) => {
    this.freeze_ajax(row.uid, 0)
  };
  // 分页
  currentChange = (current_page) => {
    this.setState({
      current_page: current_page
    }, () => {
      this.getList()
    });
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
  // 关闭弹窗
  close_dialog = () => {
    this.setState({
      dialogVisible: false
    })
  };
  // 确定按钮
  handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.refs.ruleForm.validate((valid) => {
      if (valid) {
        // 编辑用户
        const {form} = this.state;
        const expiration_time = moment(form.expiration_time).format('YYYY-MM-DD');
        let password = sha512(form.password);
        if (form.uid) { // 编辑用户 密码可为空
          if (form.password.length === 0) {
            password = '';
          } else if (form.password.length < 8) {
            Message.error('密码长度不能小于8位');
            return false;
          }
        }
        httpRequest({
          url: api.sysUser_edit,
          type: 'post',
          data: {
            username: form.username,
            password: password,
            nickname: form.name,
            mobile: form.phone,
            expirationTime: expiration_time,
            roleId: form.role_id,
            statusFreeze: form.status_freeze || 0,
            description: form.description,
            uid: form.uid,
          }
        }).done(resp => {
          if (resp.code === 200) {
            this.setState({
              dialogVisible: false,
            });
            Message.success('操作成功');
            this.getList();
          } else {
            Message.error(resp.msg);
          }
        }).fail(err => {
          Notification.error({
            title: '接口请求失败',
            message: '内部服务器错误' + err.status
          });
        })
      } else {
        console.log('error submit!!');
        return false;
      }
    });
  };

  onChange = (key, value) => {
    this.setState({
      form: Object.assign({}, this.state.form, {[key]: value})
    });
  };
  // 生成随机密码
  createRandomPassword = (size) => {
    const seed = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'Q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      '2', '3', '4', '5', '6', '7', '8', '9'
    ];//数组
    const seedlength = seed.length;//数组长度
    let createPassword = '';
    for (let i = 0; i < size; i++) {
      const j = Math.floor(Math.random() * seedlength);
      createPassword += seed[j];
    }
    return createPassword;
  };
  getRandomPass = () => {
    const randomPassword = this.createRandomPassword(8);
    const {form = {}} = this.state;
    const {username = ''} = form;
    const copyText = `账号：${username} 密码：${randomPassword}`;
    this.copyText(copyText);
    this.setState({
      form: {...form, password: randomPassword}
    })
  };
  // 拷贝
  copyText = (text) => {
    const input = document.querySelector('#copy-input');
    if (input) {
      input.value = text;
      if (document.execCommand('copy')) {
        input.select();
        document.execCommand('copy');
        input.blur();
        Message.success('账号密码已复制到粘贴板');
      }
    }
  };
  timePickerChange = (date) => {
    const {searchForm} = this.state;
    this.setState({
      searchForm: {...searchForm, timeRange: date || []}
    })
  };

  render() {
    const {
      dialogVisible, form, is_loading, isAdd, searchForm, freezeTypes, roleList,
      page_size, current_page, total,
    } = this.state;
    const searchRoleList = [{id: 0, name: '全部'}].concat(roleList);
    return (
      <div className="content_wrapper">
        <div className="clearBoth">
          <PowerButton webButton="editor"
                       type="info"
                       onClick={this.addRole}
                       style={{float: 'right'}}>新增人员</PowerButton>
        </div>


        {/*搜索框*/}
        <div className="table_toolbar clearBoth">
          <Form model={searchForm} inline={true}>
            <Form.Item label="状态">
              <Select defaultValue={searchForm.statusFreeze}
                      value={searchForm.statusFreeze}
                      placeholder='用户状态'
                      className="mini_input"
                      onChange={this.onSearchForm_change.bind(this, 'statusFreeze', true)}>
                {
                  freezeTypes.map(el => {
                    
                    return <Select.Option key={el.value}
                                          label={el.name}
                                          value={el.value}/>
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item label="角色">
              <Select defaultValue={searchForm.roleId}
                      value={searchForm.roleId}
                      placeholder='用户角色'
                      className="mini_input"
                      onChange={this.onSearchForm_change.bind(this, 'roleId', true)}>
                {
                  searchRoleList.map(el => {
                    return <Select.Option key={el.id}
                                          label={el.name}
                                          value={el.id}/>
                  })
                }
              </Select>
            </Form.Item>
            <div style={{float: 'right'}}>
              <Form.Item label="">
              <DateRangePicker
              value={searchForm.timeRange}
              placeholder="选择日期范围"
              onChange={this.timePickerChange}
              />
              </Form.Item>

              <Form.Item label="">
                <Input
                  value={searchForm.keyword}
                  className="mini_input"
                  placeholder="姓名关键字"
                  onChange={this.onSearchForm_change.bind(this, 'keyword', false)}
                />
              </Form.Item>

              <Button type="info" onClick={this.handleSearchClick}>搜索</Button>
            </div>

          </Form>


        </div>
        <Loading loading={is_loading} text="拼命加载中">
          <Table
            columns={this.state.columns}
            data={this.state.data}
            border={true}
            stripe={true}
          />
          <div className="pagination_wrapper">
            <Pagination layout="total, prev, pager, next, jumper"
                        pageSize={page_size}
                        currentPage={current_page}
                        total={total}
                        onCurrentChange={this.currentChange}
            />
          </div>
        </Loading>
        <Dialog
          title={isAdd ? '新建人员' : '编辑人员'}
          visible={ dialogVisible }
          closeOnClickModal={false}
          onCancel={ this.close_dialog }
        >
          <Dialog.Body>
            <Form model={form}
                  ref="ruleForm"
                  rules={this.state.rules}
                  labelWidth="80">
              <Form.Item label="账号" prop="username">
                <Input value={form.username}
                       onChange={this.onChange.bind(this, 'username')}
                       autoComplete="off"/>
                <span className="label_tips">(建议账号使用英文)</span>
              </Form.Item>
              <Form.Item label="人员姓名" prop="name">
                <Input value={form.name}
                       onChange={this.onChange.bind(this, 'name')}
                       autoComplete="off"/>
              </Form.Item>
              <Form.Item label="手机号" prop="phone">
                <Input type='number'
                       value={form.phone}
                       onChange={this.onChange.bind(this, 'phone')}
                       autoComplete="off"/>
              </Form.Item>
              {/*新增必须填密码，修改可不填*/}
              <Form.Item label="密码" prop={form.uid ? '' : 'password'}>
                {form.uid ? <div className="label_tips">为空则不修改密码</div> : ''}
                <Input type='password'
                       value={form.password}
                       onChange={this.onChange.bind(this, 'password')}
                       autoComplete="off"/> <Button type='success'
                                                    onClick={this.getRandomPass}
                                                    size='small'>随机密码</Button>
              </Form.Item>

              <Form.Item label="角色" prop="role_id">
                <Select defaultValue={form.role_id}
                        value={form.role_id}
                        placeholder='用户角色'
                        className="mini_input"
                        onChange={this.onChange.bind(this, 'role_id')}>
                  {
                    roleList.map(el => {
                      return <Select.Option key={el.id}
                                            label={el.name}
                                            disabled={el.id === 1}
                                            value={el.id}/>
                    })
                  }
                </Select>
              </Form.Item>
              <Form.Item label="到期时间" prop="expiration_time">
                <DatePicker
                  value={form.expiration_time}
                  placeholder="选择日期"
                  onChange={this.onChange.bind(this, 'expiration_time')}
                />
              </Form.Item>
              <Form.Item label="用户状态" prop="status_freeze">
                <Radio.Group value={form.status_freeze} onChange={this.onChange.bind(this, 'status_freeze')}>
                  {freezeTypes.map((item, index) =>{
                    // if(item.value !== 2){
                    //   return <Radio key={index}
                    //                 value={item.value}>{item.name}</Radio>
                    // }

                    return (item.value !== 2?<Radio key={index}
                                    value={item.value}>{item.name}</Radio>:'')
                    
                  })}
                </Radio.Group>
              </Form.Item>
              <Form.Item label="描述" prop="description">
                <Input value={form.description}
                       onChange={this.onChange.bind(this, 'description')}
                       autoComplete="off"/>
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