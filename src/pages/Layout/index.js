/**
 * Created by DELL on 2018/10/8.
 */
import React, {Component} from 'react';

import {
  Switch,
  Route,
  // Link,
  Redirect
} from 'react-router-dom'

import AppMenu from  './AppMenu';
import AppHeader from './AppHeader';

import Dashboard from '@/pages/Dashboard';
import Page1 from '@/pages/Page1';



import './layout.scss';

/*登录后的页面整体布局*/
export default
class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentWillMount() {

  }

  componentDidMount() {

  }
  render() {
    return (
      <div className="app_main">
        <AppHeader/>
        <div className="app_body">
          <AppMenu/>
          <div className="app_content">
            <Switch>
              <Route exact path="/" component={Dashboard}/>
              <Route path="/dashboard" component={Dashboard}/>
              <Route path="/page1" component={Page1}/>
              <Redirect path="*" to="/404"/>
            </Switch>
          </div>
        </div>
      </div>
    )
  }
}