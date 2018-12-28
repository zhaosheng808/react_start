import React,{Component} from 'react';
import {connect} from 'react-redux';

import {Dropdown} from 'element-react';
import {signOut} from '@/redux/models/admin';
import './header.scss';

@connect(state => ({
  admin: state.admin
}), {signOut})

class Header extends Component {
  constructor(props){
    super(props);
    this.state={}
  }
  quit = () => {
    sessionStorage.removeItem('userInfo');
    this.props.signOut();
  };

  render(){
    const {admin} = this.props;
    return(
      <div className="app_header">
        <div className="appIcon">XX网</div>
        <div className="user_info">
          <div className="img_head">
            <img src={admin.head_image} alt="" className="head_img"/>
          </div>
          <Dropdown trigger="click" menu={(
            <Dropdown.Menu>
              <Dropdown.Item>操作1</Dropdown.Item>

              <Dropdown.Item divided><div onClick={this.quit}>退出</div></Dropdown.Item>
            </Dropdown.Menu>
          )}
          >
      <span className="el-dropdown-link">
        {admin.user_name}<i className="icon-right" />
      </span>
          </Dropdown>
        </div>
      </div>
    )
  }
}
export default Header