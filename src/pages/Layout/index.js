/**
 * Created by DELL on 2018/10/8.
 */
import React, {Component} from 'react';

import {
  Switch,
  Route,
  withRouter,
  Redirect
} from 'react-router-dom'

import {Loading} from 'element-react';
import menus from '@/config/menus';

import Dashboard from  '../Dashboard';
import AppMenu from  './AppMenu';
import AppHeader from './AppHeader';
import BreadcrumbDiy from './BreadcrumbDiy';
import ImgPreview from '@/components/ImgPreview';

import './layout.scss';

/*登录后的页面整体布局*/
export default
@withRouter
class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pic_art_column: [],
      video_art_column: [],

    }
  }

  componentWillMount() {

  }

  componentDidMount() {
  }

  // 筛选出所以的路由
  filterMenus = () => {
    const menusSecond = [];
    menus.forEach((item) => {
      if (item.children) {
        item.children.forEach((childItem) => {
          menusSecond.push(childItem)
        })
      }
    });
    return menusSecond;
  };

  render() {
    const menuFilter = this.filterMenus();
    const copyStyle = {
      position: 'absolute',
      top: '-1000px',
      zIndex: '-10'
    };
    return (
      <div className="app_main">
        <AppHeader/>
        <div className="app_body">
          <AppMenu/>
          <div className="app_content_wrapper">
            <div className="app_content">

              {/*拷贝输入框*/}
              <input style={copyStyle} type="text" id="copy-input"/>
              {/*面包屑*/}
              <BreadcrumbDiy/>
              <Switch>
                <Route exact path="/" component={Dashboard}/>
                <Route path="/dashboard" component={Dashboard}/>

                {/*自定义路由*/}
                {menuFilter.map((item, index) => {
                  return <Route key={index}
                                path={item.webRoute}
                                exact={item.exact}
                                component={item.component}/>
                })
                }

                <Redirect path="*" to="/404"/>
              </Switch>
            </div>
            {/*图片查看器*/}
            {/*图片预览*/}
            <ImgPreview/>
            {/*全局loading*/}
            <div className="content_loading">
              <Loading loading={true} text="拼命加载中"/>
            </div>
          </div>

        </div>
      </div>
    )
  }
}