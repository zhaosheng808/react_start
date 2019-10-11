/**
 * Created by DELL on 2018/10/9.
 */
import React, {Component} from 'react';

import {Tree, Form, Input, Button, Notification, Table, Message, Loading, Dialog, Select, Radio} from 'element-react';
import httpRequest from '@/utils/httpRequest';
import tools from '@/utils/tools';
import api from '@/config/api';
import PowerButton from '@/components/PowerButton';

import './index.scss';

/*系统路由管理*/
export default
class RouteManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogVisible: false, // 新增路由弹框
      showActionTable: false,  // actionTable
      editAction: false,       // 编辑action  父节点id不能被编辑
      form: {              // 编辑路由form
        nodeName: '',
        webRoute: '',
      },
      form_route: {      // 新增路由form
        nodeName: '',
        webRoute: '',
        nodePath: '',
        nodeParentId: '',
        nodeLevel: '',
        nodeMenu: '',
        nodeOrder: '',
        webButton: '',
      },
      rules: {
        nodeName: {required: true, message: '节点名称不能为空', trigger: 'blur'},
        webRoute: {required: true, message: '前端路由不能为空', trigger: 'blur'},
        nodeParentId: {required: true, message: '上级节点ID不能为空', trigger: 'blur'},
        nodeLevel: {required: true, message: '节点层级不能为空', trigger: 'blur'},
      },
      parentNodes: [],    // 所有一级父节点
      data: [],
      filter_data: [],   // 过滤的数据
      showTypes: [       // 菜单路由需要显示
        {name: '是', value: 1},
        {name: '否', value: 0}
      ],
      options: {
        children: 'childList',
        label: 'name'
      },
      columns: [
        {
          label: "id",
          prop: "id",
          width: 100
        },
        {
          label: "功能名称",
          prop: "name"
        },
        {
          label: "前端按钮",
          prop: "button"
        },
        {
          label: "后端路径",
          prop: "path"
        },
        {
          label: "操作",
          render: (row) => {
            return (
              <span>
               <Button webButton="edit"
                            type="info"
                            size="small"
                            onClick={this.editAction.bind(this, row)}>编辑</Button>
                {/*<Button type="danger" size="small" onClick={this.handle_del.bind(this, row)}>删除</Button>*/}
              </span>
            )
          }
        }
      ],
      tableData: []
    }
  }

  componentWillMount() {
    this.getList();
  }

  getList = () => {
    this.setState({
      is_loading: true
    });
    httpRequest({
      url: api.systemNode_list,
      type: 'POST',
      data: {}
    }).done(resp => {
      if (resp.code === 200) {
        this.filterParents(resp.data);
        const filter_data = this.filterData(resp.data);
        this.setState({
          data: resp.data,
          filter_data,
          is_loading: false
        })
      } else {
        Message.error(resp.msg);
        this.setState({
          is_loading: false
        });
      }
    }).fail(err => {
      this.setState({
        is_loading: false
      });
      Notification.error({
        title: '接口请求失败',
        message: '内部服务器错误' + err.status
      });
    })
  };

  add_route = () => {
    this.handleReset();
    const {form} = this.state;
    let parentId = form.nodeParentId;
    if (parentId / 1 === 0) {
      parentId = form.id + '';
    }
    const form_route = {      // 新增路由form
      nodeName: '',
      webRoute: '',
      nodePath: '',
      nodeParentId: parentId || '0',
      nodeLevel: '1',
      nodeMenu: 1,
      nodeOrder: 50,
      webButton: ''
    };
    this.setState({
      form_route,
      dialogVisible: true,
      editAction: false
    });
  };

  // 编辑操作
  editAction = (row) => {
    this.handleReset();
    const form_route = {      // 新增路由form
      id: row.id,
      nodeName: row.name,
      webRoute: row.route,
      nodePath: row.path,
      nodeParentId: row.parentId + '',
      nodeLevel: row.level + '',
      nodeMenu: 0,
      nodeOrder: row.weight,
      webButton: row.button
    };
    this.setState({
      form_route,
      dialogVisible: true,
      editAction: true
    });
  };
  // 新增操作
  addAction = () => {
    const {form} = this.state;
    const form_route = {      // 新增路由form
      nodeName: '',
      webRoute: '',
      nodePath: '',
      nodeParentId: form.id,
      nodeLevel: '3',
      nodeMenu: 0,
      nodeOrder: 50,
      webButton: ''
    };
    this.handleReset();
    this.setState({
      form_route,
      dialogVisible: true,
      editAction: true
    });
  };

  // 编辑路由表格
  onChange = (key, value) => {
    this.setState({
      form: Object.assign({}, this.state.form, {[key]: value})
    });
  };

  // 新增路由form
  _onChange = (key, value) => {
    this.setState({
      form_route: Object.assign({}, this.state.form_route, {[key]: value})
    });
  };
  // 验证表单是否填写完毕
  validate_form = (formRef, success) => {
    this.refs[formRef].validate((valid) => {
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
  // 重置表单
  handleReset() {
    this.refs.ruleForm.resetFields();
  }

  // 编辑路由 确定
  handel_edit_route = () => {
    const {form} = this.state;
    this.validate_form('ruleForm1', this.nodeAjax.bind(this, form));

  };
  // 新增路由 确定
  handleSubmit_addRoute = () => {
    const {form_route} = this.state;
    this.validate_form('ruleForm', this.nodeAjax.bind(this, form_route));
  };
  // 新增修改的ajax
  nodeAjax = (form = {}) => {
    if (form.nodeLevel / 1 === 3 && form.id) {  // 页面按钮
      const {data} = this.state;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.id / 1 === form.id / 1) {
          data[i].nodeName = form.nodeName;
          data[i].nodePath = form.nodePath;
          data[i].webButton = form.webButton;
          this.setState({
            data
          });
          break;
        }
      }
    }
    httpRequest({
      url: api.systemNode_edit,
      type: 'post',
      data: {
        id: form.id || 0,
        parentId: form.nodeParentId,
        name: form.nodeName,
        level: form.nodeLevel,
        path: form.nodePath || '',
        weight: form.nodeOrder,
        menu: form.nodeMenu,
        route: form.webRoute,
        button: form.webButton,
      },
    }).done(resp => {
      if (resp.code === 200) {
        this.setState({
          dialogVisible: false
        });
        Message.success('操作成功');
        this.getList();
      } else {
        Message.error(resp.msg);
        this.setState({
          is_loading: false
        });
      }
    }).fail(err => {
      this.setState({
        is_loading: false
      });
      Notification.error({
        title: '接口请求失败',
        message: '内部服务器错误' + err.status
      });
    })
  };
  // 过滤一级节点
  filterParents = (data = []) => {
    const parentNodes = [{
      nodeName: '根目录',
      id: '0'
    }];
    data.forEach(item => {
      parentNodes.push({
        nodeName: item.name,
        id: item.id + ''
      });
    });
    this.setState({
      parentNodes
    })
  };
  onNodeClicked = (nodeModel) => {
    const form = {
      nodeName: nodeModel.name,
      webRoute: nodeModel.route,
      nodePath: nodeModel.path,
      id: nodeModel.id,
      nodeParentId: nodeModel.parentId + '',
      nodeLevel: nodeModel.level + '',
      nodeMenu: nodeModel.menu,
      nodeOrder: nodeModel.weight,
      webButton: nodeModel.button,
    };
    let has_action = false;
    let tableData = [];
    if (nodeModel.level === 2) {
      tableData = nodeModel.actions || [];
      has_action = true;
    }
    this.setState({
      tableData: tableData,
      form: form,
      showActionTable: has_action
    })
  };

  close_dialog = () => {
    this.setState({
      dialogVisible: false
    })
  };

  getNodeName = (id) => {
    const {data} = this.state;
    let nodeItem = {};
    data.forEach(item => {
      if (item.childList) {
        item.childList.forEach(childItem => {
          if (childItem.id / 1 === id / 1) {
            nodeItem = childItem;
          }
        })
      }
    });
    return nodeItem.name || '未知节点';
  };
  // 过滤三级路由
  filterData = (data = []) => {
    const dataJson = tools.deepClone(data);
    dataJson.forEach(item => {
      if (item.childList) {
        item.childList.forEach(childItem => {
          if (childItem.childList) {
            childItem.actions = childItem.childList;
            childItem.childList = null;
          }
        })
      }
    });
    return dataJson;
  };


  render() {
    const {
      filter_data, options, form, showActionTable,
      is_loading,
      dialogVisible,
      form_route,
      parentNodes,
      editAction,
      showTypes
    } = this.state;
// console.log(parentNodes,form_route)
    return (
      <div className="content_wrapper">
        <p className="notice"><i>仅供开发者使用，不对外开放</i></p>
        <p className="notice">注: 此页面为开发人员动态录入系统模块界面，并非左侧菜单名称修改，非开发人员请勿操作 <i>（修改后可能导致部分模块不可访问）</i></p>
        <Loading loading={is_loading} text="拼命加载中">
          <div className="menu_center clearBoth">
            <div className="menu_block system_menu">
              <p className="block_title">路由列表</p>
              <div className="tree_box">
                <Tree
                  ref={e => this.tree = e}
                  className="filter-tree"
                  data={filter_data}
                  options={options}
                  nodeKey="id"
                  defaultExpandAll={true}
                  highlightCurrent={true}
                  onNodeClicked={this.onNodeClicked}
                />
              </div>
            </div>
            <div className="menu_block menu_detail">
              <p className="block_title">路由详情
                <Button webButton="edit"
                             type="primary"
                             size="small"
                             onClick={this.add_route}
                             style={{float: 'right'}}>新增路由</Button>
              </p>
              <div className="form_wrapper">
                <Form model={form}
                      ref="ruleForm1"
                      rules={this.state.rules}
                      labelWidth="90">
                  <Form.Item label="功能名称" prop="nodeName">
                    <Input value={form.nodeName}
                           onChange={this.onChange.bind(this, 'nodeName')}
                           autoComplete="off"/>
                  </Form.Item>
                  <Form.Item label="前端路由" prop="webRoute">
                    <Input value={form.webRoute}
                           onChange={this.onChange.bind(this, 'webRoute')}
                           autoComplete="off"/>
                  </Form.Item>
                  <Form.Item label="后端路径" prop="nodePath">
                    <Input value={form.nodePath}
                           onChange={this.onChange.bind(this, 'nodePath')}
                           autoComplete="off"/>
                  </Form.Item>

                  <Form.Item label="是否菜单" prop="nodeMenu">
                    <Radio.Group value={form.nodeMenu} onChange={this.onChange.bind(this, 'nodeMenu')}>
                      {showTypes.map((item, index) => {
                        return <Radio key={index}
                                      value={item.value}>{item.name}</Radio>
                      })}
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item label="id" prop="id">
                    <Input value={form.id}
                           disabled
                           autoComplete="off"/>
                  </Form.Item>
                  {/*<Form.Item label="上级目录" prop="nodeParentId">*/}
                    {/*<Input value={form.nodeParentId}*/}
                           {/*// disabled*/}
                           {/*onChange={this.onChange.bind(this, 'nodeParentId')}*/}
                           {/*autoComplete="off"/>*/}
                  {/*</Form.Item>*/}
                  <Form.Item label="上级目录" prop="nodeParentId">
                    <Select value={form.nodeParentId}
                            placeholder='上级目录'
                            onChange={this.onChange.bind(this, 'nodeParentId')}>
                      {
                        parentNodes.map(el => {
                          return <Select.Option key={el.id}
                                                label={el.name}
                                                value={el.id}/>
                        })
                      }
                    </Select>
                  </Form.Item>

                  <Form.Item label="节点层级" prop="nodeLevel">
                    <Input value={form.nodeLevel}
                           onChange={this.onChange.bind(this, 'nodeLevel')}
                           autoComplete="off"/>
                  </Form.Item>

                  <Form.Item label="节点排序" prop="nodeOrder">
                    <Input value={form.nodeOrder}
                           onChange={this.onChange.bind(this, 'nodeOrder')}
                           autoComplete="off"/>
                  </Form.Item>

                </Form>
                <div className="table_toolbar">
                  <Button webButton="edit"
                               disabled={!form.id}
                               type="primary"
                               onClick={this.handel_edit_route}
                               style={{float: 'right'}}>确认修改</Button>
                </div>
              </div>
            </div>
          </div>
          {/*操作action*/}
          {showActionTable ?
            <div className="action_table clearBoth">
              <p className="block_title">页面操作按钮
                <Button webButton="edit"
                             type="primary"
                             size="small"
                             onClick={this.addAction}
                             style={{float: 'right', marginRight: '10px'}}>新增操作</Button>
              </p>
              <Table
                maxHeight={500}
                columns={this.state.columns}
                data={this.state.tableData}
                border={true}
                stripe={true}
              />
            </div>
            : ''}
        </Loading>

        {/*新增*/}
        <Dialog
          title='新增'
          visible={ dialogVisible }
          closeOnClickModal={false}
          onCancel={ this.close_dialog }
        >
          <Dialog.Body>
            <Form model={form_route}
                  ref="ruleForm"
                  rules={this.state.rules}
                  labelWidth="120">
              <Form.Item label="功能名称" prop="nodeName">
                <Input value={form_route.nodeName}
                       onChange={this._onChange.bind(this, 'nodeName')}
                       autoComplete="off"/>
              </Form.Item>
              <Form.Item label="前端路由" prop={!editAction ? 'webRoute' : ''}>
                <Input value={form_route.webRoute}
                       onChange={this._onChange.bind(this, 'webRoute')}
                       autoComplete="off"/>
              </Form.Item>
              <Form.Item label="后端路径" prop="nodePath">
                <Input value={form_route.nodePath}
                       onChange={this._onChange.bind(this, 'nodePath')}
                       autoComplete="off"/>
              </Form.Item>


              {/*编辑action时 父节点不能被编辑*/}
              <Form.Item label="上级目录" prop={!editAction ? 'nodeParentId' : ''}>

                {!editAction ? (
                  <Select value={form_route.nodeParentId}
                          placeholder='上级目录'
                          onChange={this._onChange.bind(this, 'nodeParentId')}>
                    {
                      parentNodes.map(el => {
                        return <Select.Option key={el.id}
                                              label={el.nodeName}
                                              value={el.id}/>
                      })
                    }
                  </Select>) : (
                  <Input value={this.getNodeName(form_route.nodeParentId)}
                         disabled
                         autoComplete="off"/>
                )}

              </Form.Item>

              <Form.Item label="是否菜单" prop="nodeMenu">
                <Radio.Group value={form_route.nodeMenu} onChange={this._onChange.bind(this, 'nodeMenu')}>
                  {showTypes.map((item, index) => {
                    return <Radio key={index}
                                  value={item.value}>{item.name}</Radio>
                  })}
                </Radio.Group>
              </Form.Item>

              <Form.Item label="节点层级" prop="nodeLevel">
                <Input value={form_route.nodeLevel}
                       onChange={this._onChange.bind(this, 'nodeLevel')}
                       autoComplete="off"/>
                <div className="label_tips">一级路由:1; 二级路由:2; 页面按钮:3;</div>
              </Form.Item>

              <Form.Item label="节点排序" prop="nodeOrder">
                <Input value={form_route.nodeOrder}
                       onChange={this._onChange.bind(this, 'nodeOrder')}
                       autoComplete="off"/>
              </Form.Item>
              <Form.Item label="按钮标志" prop="webButton">
                <Input value={form_route.webButton}
                       onChange={this._onChange.bind(this, 'webButton')}
                       autoComplete="off"/>
              </Form.Item>
            </Form>
          </Dialog.Body>
          <Dialog.Footer className="dialog-footer">
            <Button onClick={ this.close_dialog }>取 消</Button>
            <Button type="primary"
                    onClick={ this.handleSubmit_addRoute}>确 定</Button>
          </Dialog.Footer>
        </Dialog>
      </div>
    )
  }
}