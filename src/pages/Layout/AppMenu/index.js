import React, {Component} from 'react';
import './side.scss';
import {NavLink} from 'react-router-dom';
import {Menu} from 'element-react'
import {connect} from "react-redux";

@connect(state => ({
    admin: state.admin
  }),{}
)

export default
class AppMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testNodes: [
        {node_name: '系统管理', children: [
          {'node_name': '页面1', node_front_route: '/page1'},
          {'node_name': '工作台', node_front_route: '/dashboard'},
          {'node_name': '登录', node_front_route: '/login'},
          {'node_name': '404', node_front_route: '/404'},
          ]
        },
        {node_name: '内容管理', children: [
          {'node_name': '页面1', node_front_route: '/page1'},
          {'node_name': '工作台', node_front_route: '/dashboard'},
          {'node_name': '登录', node_front_route: '/login'},
          {'node_name': '404', node_front_route: '/404'},
        ]
        },
      ]
    }
  }

  componentDidMount(){
    // this.getUserPermissions()
  }

  // //获取用户权限
  // getUserPermissions =()=>{
  //   httpRequest({
  //     url : API.user_permissions,
  //     type : 'GET',
  //     data : {}
  //   }).done((res)=>{
  //     if(res.code===0){
  //       this.setState({
  //         menus : res.data
  //       })
  //     }else {
  //       Message(res.msg)
  //     }
  //   }).fail(()=>{
  //     Message('内部服务器错误')
  //   })
  // }

  onOpen() {

  }

  onClose() {

  }

  render() {
    const menus = this.props.admin.nodes||this.state.testNodes;
    return (
      <div className="app_menu">
        <div className="app_menu_inner">
          <Menu
            defaultActive="0-0"
            className="el-menu-vertical-demo"
            theme="light"
            defaultOpeneds={[1]}
            onOpen={this.onOpen.bind(this)}
            onClose={this.onClose.bind(this)}
            uniqueOpened={false}
          >
            {menus.map((item, index) => {
              return <Menu.SubMenu index={`${index}`}
                                   key={index}
                                   title={<div>
                                     {/*<i className="el-icon-menu" />*/}
                                     {item.node_name}</div>}
                                   >
                  {item.children.map((childItem, childIndex) => {
                    return <Menu.Item index={`${index}-${childIndex}`}
                                      key={`${index}-${childIndex}`}>
                      <NavLink to={childItem.node_front_route}
                               activeClassName="active">{childItem.node_name}</NavLink>
                    </Menu.Item>
                  })}
              </Menu.SubMenu>
            })}
          </Menu>
        </div>
      </div>
    )
  }
}