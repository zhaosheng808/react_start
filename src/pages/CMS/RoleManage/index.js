/**
 * Created by DELL on 2018/10/9.
 */
import React, {Component} from 'react';

import {Table, Button, Dialog, Form, Input, Message, Notification, Loading, MessageBox, Radio,
        Select,
        Pagination,
        // DatePicker,
        DateRangePicker,
        } from 'element-react';
import httpRequest from '@/utils/httpRequest';
import {Link} from 'react-router-dom';
import moment from 'moment';
import api from '@/config/api';

import PowerButton from '@/components/PowerButton';

/*系统角色管理*/
export default
class RoleManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false, // 弹框是否显示
      is_loading: true,    // 表格加载中
      page_size: 10,
      current_page: 1,
      total: 0,
      form: {
        role_name: '',
        role_status: '',
      },
      statusList: [
        {name: '正常', value: '1'},
        {name: '冻结', value: '0'},
        // {name: '删除', value: '-1'},
      ],

      searchForm: {              // 搜索框
        keyword: '',             // 关键字
        timeRange: [],           // 时间范围
        id: 0,               // 角色筛选
        statusFreeze: 2           // 0正常 1冻结  2全部
      },

      freezeTypes: [           // 状态
        {name: '正常', value: 1},
        {name: '冻结', value: 0},
        {name: '全部', value: 2},
      ],
      rules: {
        role_name: {required: true, message: '角色名称不能为空', trigger: 'blur'},
        role_status: {required: true, message: '角色状态不能为空', trigger: 'blur'},
      },
      columns: [
        {
          label: "id",
          prop: "id"
        },
        {
          label: "名称",
          prop: "name"
        },
        {
          label:'已开人数',
          prop:'sum',
          render:(row) => {
            return <span>{row.userCount}</span>
          }
        },
        {
          label: "状态",
          render: (row) => {
            return (
              <span>
                {this.translateStatus(row.status)}
            </span>
            )
          }
        },
        {
          label:'新增时间',
          prop:'addTime',
          render:(row) => {
            return <span>{row.addTime}</span>
          }
        },
        {
          label: "操作",
          render: (row) => {
            return (
              <span>
                <PowerButton webButton="save"
                             type="info"
                             size="small"
                             onClick={this.editRole.bind(this, row)}>编辑</PowerButton>

                <PowerButton webButton="del"
                             type="danger"
                             size="small"
                             onClick={this.handle_del.bind(this, row)}>删除</PowerButton>
                <Link to={`/cms/powerManage?roleId=${row.id}`}>
                <PowerButton webButton="power"
                             type="success"
                             size="small">授权</PowerButton>
                </Link>
            </span>
            )
          }
        }
      ],
      data: []
    }
  }

  componentWillMount() {
    this.getList();
  };

  // 获取列表
  getList = () => {
    this.setState({
      is_loading: true
    });

    const {
      current_page, page_size, 
      searchForm} = this.state;
    let start_time = '';
    let end_time = '';
    if (searchForm.timeRange.length > 0) {
      start_time = moment(searchForm.timeRange[0]).format('YYYY-MM-DD');
      end_time = moment(searchForm.timeRange[1]).format('YYYY-MM-DD');
    }
    // 去除搜索字符串前后
    if (searchForm.keyword) {
      searchForm.keyword = searchForm.keyword.trim()
    }
    httpRequest({
      url: api.role_list,
      type: 'post',
      data: {
        page: current_page,
        num: page_size,
        keyword: searchForm.keyword,
        status: searchForm.statusFreeze,
        start_time: start_time,
        end_time: end_time,
      }
    }).done((resp) => {
      if (resp.code === 200) {
        this.setState({
          data: resp.data.list || [],
          total:resp.data.total,
          is_loading: false
        })
      } else {
        Message.error(resp.msg);
        this.setState({
          is_loading: false
        });
      }
    }).fail(jqXHR => {
      this.setState({
        is_loading: false
      });
      Notification.error({
        title: '接口请求失败',
        message: '内部服务器错误' + jqXHR.status
      });
    })
  };
  // 获取状态
  translateStatus = (status) => {
    const {statusList} = this.state;
    const statusItem = statusList.find(item => {
        return item.value === (status + '')
      }) || {};
    return statusItem.name || '未知';
  };

  // 重置表单
  handleReset() {
    this.refs.ruleForm.resetFields();
  }

  // 新增角色
  addRole = () => {
    this.handleReset();
    const newForm = {
      id: '',
      role_name: '',
      role_status: '0'
    };
    this.setState({
      dialogVisible: true,
      isAdd: true,
      form: newForm,
    })
  };
  // 编辑角色
  editRole = (row) => {
    this.handleReset();
    const newForm = {
      id: row.id,
      role_name: row.name,
      role_status: row.status + ''
    };
    this.setState({
      dialogVisible: true,
      isAdd: false,
      form: newForm
    })
  };
  // 删除
  handle_del = (row) => {
    MessageBox.confirm('确定是否删除此角色? ', '提示', {
      type: 'warning'
    }).then(() => {
      httpRequest({
        url: api.role_del,
        type: 'POST',
        data: {
          id: row.id
        }
      }).done(resp => {
        if (resp.code === 200) {
          Message.success('操作成功');
          this.getList();
        } else {
          Message.error(resp.msg);
        }
      }).fail(jqXHR => {
        Notification.error({
          title: '操作失败',
          message: '内部服务器错误' + jqXHR.status
        });
      })
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
    const {form} = this.state;
    this.validate_form(() => {
      httpRequest({
        url: api.role_save,
        type: 'POST',
        data: {
          id: form.id,
          name: form.role_name,
          status: form.role_status,
        }
      }).done(resp => {
        if (resp.code === 200) {
          this.setState({
            dialogVisible: false,
          });
          Message.success('操作成功');
          this.getList();
        } else {
          Message.error('操作失败：' + resp.msg);
        }
      }).fail(jqXHR => {
        Notification.error({
          title: '操作失败',
          message: '内部服务器错误' + jqXHR.status
        });
      });
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
  onChange = (key, value) => {
    this.setState({
      form: Object.assign({}, this.state.form, {[key]: value})
    });
  };
  radioChange = (key, value) => {
    this.setState({
      form: Object.assign({}, this.state.form, {[key]: value})
    });
  };

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

  //选择日期范围
  timePickerChange = (date) => {
    const {searchForm} = this.state;
    this.setState({
      searchForm: {...searchForm, timeRange: date || []}
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

  // 分页
  currentChange = (current_page) => {
    this.setState({
      current_page: current_page
    }, () => {
      this.getList()
    });
  };

  render() {
    const {dialogVisible, form, isAdd, is_loading, statusList,searchForm,freezeTypes,
          page_size,current_page,total,
    } = this.state;
    return (
      <div className="content_wrapper">

        <div className="table_toolbar clearBoth">
          <PowerButton webButton="save"
                       type="info"
                       onClick={this.addRole}
                       style={{float: 'right'}}>新增角色</PowerButton>
        </div>

        {/*搜索框*/}
        <div className="table_toolbar clearBoth">
          <Form model={searchForm} inline={true}>
            <Form.Item label="状态">
              <Select 
              // defaultValue={searchForm.statusFreeze}
                      value={searchForm.statusFreeze}
                      // placeholder='用户状态'
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
          title={isAdd ? '新建角色' : '编辑角色'}
          visible={ dialogVisible }
          closeOnClickModal={false}
          onCancel={ this.close_dialog }
        >
          <Dialog.Body>
            <Form model={form}
                  ref="ruleForm"
                  rules={this.state.rules}
                  labelWidth="80">
              <Form.Item label="角色名称" prop="role_name">
                <Input value={form.role_name}
                       onChange={this.onChange.bind(this, 'role_name')}
                       autoComplete="off"/>
              </Form.Item>
              {/* <Form.Item label="角色状态" prop="role_status">
                <Radio.Group value={form.role_status} onChange={this.radioChange.bind(this, 'role_status')}>
                  {statusList.map((item, index) => {
                    return <Radio key={index}
                                  value={item.value}>{item.name}</Radio>
                  })}
                </Radio.Group>
              </Form.Item> */}
              <Form.Item label="角色状态" prop="role_status">
                <Radio.Group value={form.role_status} onChange={this.radioChange.bind(this, 'role_status')}>
                  {statusList.map((item, index) => {
                    return <Radio key={index}
                                  value={item.value}>{item.name}</Radio>
                  })}
                </Radio.Group>
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