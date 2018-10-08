/**
 * Created by DELL on 2017/11/13.
 */
import React, {Component} from 'react';
import img_404 from '@/assets/images/404_images/404.png';
import img_404_cloud from '@/assets/images/404_images/404_cloud.png';
// import {Link} from 'react-router-dom'
import './index.scss';
export default class NotFound extends Component {

  componentDidMount () {
  };
  render() {
    const message = '特朗普说这个页面你不能进......';
    return (<div className="notFound">
      <div className="wscn-http404">
        <div className="pic-404">
          <img className="pic-404__parent" src={img_404} alt="404"/>
          <img className="pic-404__child left" src={img_404_cloud} alt="404"/>
          <img className="pic-404__child mid" src={img_404_cloud} alt="404"/>
          <img className="pic-404__child right" src={img_404_cloud} alt="404"/>
        </div>
        <div className="bullshit">
          <div className="bullshit__oops">OOPS!</div>
          <div className="bullshit__info">
            {/*版权所有<a className='link-type' href='https://wallstreetcn.com' target='_blank'>华尔街见闻</a>*/}
          </div>
          <div className="bullshit__headline">{message}</div>
          <div className="bullshit__info">请检查您输入的网址是否正确，请点击以下按钮返回主页</div>
          <a href="/" className="bullshit__return-home">返回首页</a>
        </div>
      </div>
    </div>)
  }
}
