/**
 * Created by DELL on 2018/10/9.
 */
import React, {Component} from 'react';

import {Form, Radio, Table, Checkbox, Message, Loading, Notification} from 'element-react';

import httpRequest from '@/utils/httpRequest';
import api from '@/config/api';
import tools from '@/utils/tools';
import PowerButton from '@/components/PowerButton';

/*权限管理*/
export default
class PowerManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_loading: true,
      role_list: [],
      node_ids: [], //当前角色的权限
      form: {
        roleId: 0
      },


      // 二级扩展菜单
      columns: [
        {
          type: 'expand',
          expandPannel: (row) => {    // 二级扩展菜单
            // return <Table
            //   style={{width: '100%'}}
            //   columns={this.state.columns_expand2}
            //   data={row.child}
            //   border={true}
            //   showHeader={false}
            //   type="expand"
            // />
            return (<div>
              {/*二级页面*/}
              {row.childList.map((item, index) => {
                return (<div className="checkboxRow clearBoth" key={index}>
                  <div className="checkboxRow_left">
                    <Checkbox checked={this.isChecked(item)}
                              onChange={this.checkPermissions.bind(this, item)}
                              value={item.id}
                              label={item.name}>{item.name}</Checkbox>
                  </div>
                  <div className="checkboxRow_right">
                    {item.childList ? (this.renderCheckBoxs(item.childList)) : ''}
                  </div>
                </div>)
              })}
            </div>)
          }
        },
        {
          label: "功能名称",
          prop: "name",
          width: '250'
        },
        {
          label: "是否拥有权限",
          render: (row) => {
            return <Checkbox
              checked={this.isChecked(row)}
              onChange={this.checkPermissions.bind(this, row)}/>
          }
        }
      ],
      // 二级表格
      columns_expand2: [
        {
          type: 'expand',
          expandPannel: (row) => {     // 三级折叠菜单
            const nodes = this.renderCheckBoxs(row.childList);
            return nodes;
          }
        },
        {
          label: "功能名称",
          prop: "nodeName",
          width: '200'
        },
        {
          label: "是否拥有权限",
          render: (row) => {
            return <Checkbox
              checked={this.isChecked(row)}
              onChange={this.checkPermissions.bind(this, row)}/>
          }
        }
      ],

      table_data: []  // 所有节点
    }
  }

  componentWillMount() {
    const search = this.props.location.search;
    const params = tools.getParams(search) || {};
    const roleId = params.roleId;
    this.setState({
      form: {
        roleId: roleId ? roleId / 1 : 1
      }
    });
    this.get_role();
    this.get_nodes();
  }

  // 渲染三级列表权限checkbox
  renderCheckBoxs = (data = []) => {
    const {node_ids} = this.state;
    const checkboxGroup = (
      <Checkbox.Group value={node_ids}>
        {data.map((item, index) => {
          return <Checkbox key={index}
                           value={item.id}
                           label={item.name}>{item.name}</Checkbox>
        })
        }
      </Checkbox.Group>
    );
    return checkboxGroup;
  };
  roleChange = (value) => {
    const {form} = this.state;
    this.setState({
      form: {...form, roleId: value}
    }, () => {
      this.getPermissions();
    });

  };

  // 获取所有角色
  get_role = () => {
    httpRequest({
      url: api.sysUser_listAllRole,
      type: 'post',
      data: {   //获取角色下拉框数据，由于角色接口已做筛选，所以状态传全部，num为10000条
        // page: 1,
        // num: 10000,  
        // content: '',
        // roleStatus: 2,
        // start_time: '',
        // end_time: '',
      }
    }).done((resp) => {
      if (resp.code === 200) {
        const role_list = resp.data || [];
        this.setState({
          role_list: role_list.reverse(),
        });
        if (role_list && role_list.length > 0) {
          this.getPermissions();
        }
      } else {
        Message.error(resp.msg);
      }
    }).fail(err => {
      Notification.error({
        title: '接口请求失败',
        message: '内部服务器错误 ' + err.status
      });
    })
  };
  // 获取所有权限节点
  get_nodes = () => {
    httpRequest({
      url: api.systemNode_list,
      type: 'post',
      data: {}
    }).done((resp) => {
      if (resp.code === 200) {
        this.setState({
          table_data: resp.data || [],
        });
      } else {
        Message.error(resp.msg);
      }
    }).fail(err => {
      Notification.error({
        title: '接口请求失败',
        message: '内部服务器错误 ' + err.status
      });
    })
  };

  //获取角色权限
  getPermissions = () => {
    const {form} = this.state;
    const {roleId} = form;
    this.setState({
      is_loading: true
    });
    httpRequest({
      url: api.role_permissions,
      type: 'POST',
      data: {
        roleId: roleId || 1
      }
    }).done((res) => {
      if (res.code === 200) {
        this.setState({
          node_ids: res.data,
          is_loading: false
        })
      } else {
        Message(res.msg)
      }
    }).fail((err) => {
      Notification.error({
        title: '接口请求失败',
        message: '内部服务器错误 ' + err.status
      });
    })
  };


  //是否选中
  isChecked = (row) => {
    const {node_ids} = this.state;
    const nodeIndex = node_ids.indexOf(row.id);
    if (nodeIndex !== -1) {
      return true
    } else {
      return false
    }
  };

  //勾选权限
  checkPermissions = (data) => {
    const {node_ids} = this.state;
    const oneIndex = node_ids.indexOf(data.id);
    if (oneIndex !== -1) { // 有权限
      node_ids.splice(oneIndex, 1);
      if (data.childList) {
        data.childList.forEach((item, index) => {
          const secondIndex = node_ids.indexOf(item.id); // 二级权限
          if (secondIndex !== -1) {
            node_ids.splice(secondIndex, 1);
            if (item.childList) {
              item.childList.forEach((childItem, childIndex) => {
                const thirdIndex = node_ids.indexOf(childItem.id)
                if (thirdIndex !== -1) {
                  node_ids.splice(thirdIndex, 1)
                }
              })
            }
          }
        })
      }
    } else {    // 没有权限
      node_ids.push(data.id);
      if (data.childList) {
        data.childList.forEach((item, index) => {
          const secondIndex = node_ids.indexOf(item.id)
          if (secondIndex === -1) {
            node_ids.push(item.id)
            if (item.childList) {
              item.childList.forEach((childItem, childIndex) => {
                const thirdIndex = node_ids.indexOf(childItem.id)
                if (thirdIndex === -1) {
                  node_ids.push(childItem.id)
                }
              })
            }
          }
        })
      }

    }
    this.setState({node_ids})
  }

  // 更新角色权限
  update_permissions = () => {
    const {node_ids, form} = this.state;
    const roleId = form.roleId;
    if (!roleId) {
      Message.warning('请先选择角色类型');
    } else {
      this.setState({
        is_updating: true
      });
      httpRequest({
        url: api.update_role_permissions,
        type: 'POST',
        data: {
          roleId: roleId,
          nodeIds: node_ids.join(','),
        }
      }).done(resp => {
        if (resp.code === 200) {
          Message.success('角色权限更新成功');
        } else {
          Message.error(resp.msg);
        }
        this.setState({
          is_updating: false
        })
      }).fail(err => {
        this.setState({
          is_updating: false
        });
        Notification.error({
          title: '接口请求失败',
          message: '内部服务器错误 ' + err.status
        });
      })
    }
  };

  render() {
    const {form, role_list, is_loading, is_updating} = this.state;
    return (
      <div className="content_wrapper">

        <Loading loading={is_loading} text="拼命加载中">
          <div className="table_toolbar clearBoth">
            <PowerButton webButton="updateNode"
                         style={{float: 'right'}}
                         type='info'
                         loading={is_updating}
                         onClick={this.update_permissions}>{is_updating ? '更新中' : '保存权限'}</PowerButton>
          </div>
          <Form model={form}
                labelPosition="top"
                ref="ruleForm"
                labelWidth="80">
            <Form.Item label="角色名称">
              <Radio.Group value={form.roleId} onChange={this.roleChange.bind(this)}>
                {role_list.map((item, index) => {
                  return <Radio key={index}
                                value={item.id}>{item.name}</Radio>
                })}
              </Radio.Group>
            </Form.Item>
            <Form.Item label="权限名称">
              <Table
                style={{width: '100%'}}
                columns={this.state.columns}
                data={this.state.table_data}
                border={true}
                type="expand"/>
            </Form.Item>
          </Form>
        </Loading>
      </div>
    )
  }
}