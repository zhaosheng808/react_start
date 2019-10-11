/**
 * Created by DELL on 2018/10/8.
 */
import React, {Component} from 'react';
/*工作台*/
export default
class Dashboard extends Component {
  constructor(props){
    super(props);
    this.state={}
  }

  render(){
    const style = {
      textAlign: 'center',
      marginTop: '150px'
    };
    return(
      <h1 className="wel" style={style}>欢迎使用 吱声 运营管理平台</h1>
    )
  }
}