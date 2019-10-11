import React, {Component} from 'react';
import './side.scss';
import {NavLink} from 'react-router-dom';
import {Menu} from 'element-react'
import {connect} from "react-redux";
import menus from '@/config/menus';

export default
@connect(state => ({
    admin: state.admin
  }), {}
)
class AppMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {

  }

  onOpen() {

  }

  onClose() {

  }

  renderMenus = () => {
    // const menusArr = menus || [];
    // // 筛选用户拥有的菜单
    // let userNode = [];
    //
    // if (this.props.admin && this.props.admin.userNodeList) {
    //   userNode = this.props.admin.userNodeList;
    // }
    // const userPath = [];   // 用户拥有的所以path
    // userNode.forEach(item => {
    //   userPath.push(item.route);
    //   if (item.childList) {
    //     item.childList.forEach(secondItem => {
    //       userPath.push(secondItem.route);
    //     })
    //   }
    // });
    // const userMenu = [];
    // menusArr.forEach(item => {
    //   // 筛选存在用户权限的路由
    //   if (userPath.includes(item.webRoute)) {
    //     const firstMenuItem = {
    //       node_name: item.node_name,
    //       webRoute: item.webRoute,
    //       hidden: item.hidden
    //     };
    //     const firstMenuChild = [];
    //     if (item.children) {
    //       item.children.forEach(childItem => {
    //         if (userPath.includes(childItem.webRoute)) {
    //           const secondMenuItem = {
    //             node_name: childItem.node_name,
    //             webRoute: childItem.webRoute,
    //             hidden: childItem.hidden,
    //           };
    //           firstMenuChild.push(secondMenuItem);
    //         }
    //       })
    //     }
    //     firstMenuItem.children = firstMenuChild;
    //     userMenu.push(firstMenuItem);
    //   }
    // });
    const menuNode = menus.map((item, index) => {
    // const menuNode = userMenu.map((item, index) => {
      return <Menu.SubMenu index={`${index}`}
                           key={index}
                           title={<div>
                             {/*<i className="el-icon-menu" />*/}
                             {item.node_name}</div>}
      >
        {item.children.map((childItem, childIndex) => {
          const is_hidden = childItem.hidden;  // 1 为菜单 0 不是菜单二级页面
          if (!is_hidden) {
            return (<Menu.Item index={`${index}-${childIndex}`}
                               key={`${index}-${childIndex}`}>
              <NavLink to={childItem.webRoute}
                       activeClassName="active">{childItem.node_name}</NavLink>
            </Menu.Item>)
          } else {
            return '';
          }
        })}
      </Menu.SubMenu>
    });
    return menuNode;
  };

  render() {
    // const menus = this.props.admin.nodes || this.state.menus;

    return (
      <div className="app_menu">
        <div className="app_menu_inner">
          <Menu
            // defaultActive="0-0"
            className="el-menu-vertical-demo"
            theme="light"
            defaultOpeneds={[1]}
            onOpen={this.onOpen.bind(this)}
            onClose={this.onClose.bind(this)}
            uniqueOpened={false}
          >
            {this.renderMenus()}
          </Menu>
        </div>
      </div>
    )
  }
}