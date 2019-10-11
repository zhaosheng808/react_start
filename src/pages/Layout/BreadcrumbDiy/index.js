/**
 * Created by DELL on 2018/10/13.
 */
import React, {Component} from 'react';

import {
  Link,
  withRouter,
} from 'react-router-dom'

import {Breadcrumb} from 'antd';

import menus from '@/config/menus';

/*自定义面包屑*/

export default
@withRouter
class BreadcrumbDiy extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const breadcrumbNameMap = {
      // '/apps': 'Application List',
      // '/apps/1': 'Application1',
      // '/apps/2': 'Application2',
      // '/apps/1/detail': 'Detail',
      // '/apps/2/detail': 'Detail',
    };
    menus.forEach((item, index) => {
      breadcrumbNameMap[item.webRoute] = item.node_name;
      if (item.children) {
        item.children.forEach((childItem, childIndex) => {
          breadcrumbNameMap[childItem.webRoute] = childItem.node_name
        })
      }
    });
    const {location} = this.props;
    const pathSnippets = location.pathname.split('/').filter(i => i);

    const extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      // 一级路由和当前页面路由不可点击 TODO: 没做一级路由页面
      // 如果是动态路由，上级页面页不可点击
      let dynamicRoute = false; // 是否为动态路由父级别
      if (index === pathSnippets.length - 2) { // 动态路由倒数第二级也不需要点击
        const dynamic_url = `/${pathSnippets.slice(0, index + 2).join('/')}`;
        if (!breadcrumbNameMap[dynamic_url]) { // 动态路由不存在 则上级路由不可点击
          dynamicRoute = true;
        }
      }
      ;
      if (index < 1 || index === pathSnippets.length - 1 || dynamicRoute) {
        return (<Breadcrumb.Item key={url}>
          {breadcrumbNameMap[url]}
        </Breadcrumb.Item>)
      } else {
        return <Breadcrumb.Item key={url}>
          <Link to={url}>
            {breadcrumbNameMap[url]}
          </Link>
        </Breadcrumb.Item>
      }
    });
    return (
      <div className="breadcrumbDiy">
        <Breadcrumb separator=">">
          {extraBreadcrumbItems}
        </Breadcrumb>
      </div>
    )
  }
}