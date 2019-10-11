/**
 * Created by DELL on 2019/1/2.
 */
import React, {Component} from 'react';

import './index.scss';
import tools from '@/utils/tools';
import View from '@/components/View';
import classnames from 'classnames';
import $ from 'jquery';

/*图片预览*/
export default
class ImgPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      imgList: [],
      activeImgIndex: 0
    };
    this.modal = null;
  }

  componentWillMount = () => {
  };

  componentDidMount() {
    this.bindEvent();
  };

  bindEvent = () => {
    $("body").delegate(".can_preview", "click", function () {
      const imgArr = [];
      const img = $(this).find('img');
      if (img && img.attr('src')) {
        imgArr.push(img.attr('src'));
        window.showImgPreview(imgArr, 0)
      }
    })
    window.showImgPreview = (imgArr = [], index = 0) => {
      this.setState({
        imgList: imgArr,
        activeImgIndex: index,
        visible: true
      });
      tools.addEventHandler(document.body, 'keyup', this.keyUp);
      const app_header = document.querySelector('.app_header');
      if (app_header) {
        app_header.style.zIndex = 0;
      }
    };
  };

  componentDidUpdate() {
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {
    this.dialogBeforeClose();
  };

  dialogBeforeClose = () => {
    tools.removeEventHandler(document.body, 'keyup', this.keyUp);
    document.querySelector('.app_header').style.zIndex = '';
  };

  closeDialog = () => {
    this.dialogBeforeClose();
    this.setState({
      visible: false
    })
  };
  // 按键抬起
  keyUp = (e) => {
    if (e.keyCode === 27) { // Esc
      this.closeDialog();
    }
    e.preventDefault();
    e.stopPropagation();
  };

  // 上一个
  prev = () => {
    let {activeImgIndex} = this.state;
    if (activeImgIndex > 0) {
      activeImgIndex = activeImgIndex - 1;
      this.updateImg(activeImgIndex);
    }
  };
  // 下一个
  next = () => {
    const {imgList} = this.state;
    let {activeImgIndex} = this.state;
    if (activeImgIndex < imgList.length - 1) {
      activeImgIndex = activeImgIndex + 1;
      this.updateImg(activeImgIndex);
    }
  };

  // 更新image的展示方式
  updateImg = (activeImgIndex) => {
    this.setState({
      activeImgIndex: activeImgIndex
    })
  };


  willOpen = (prevProps, nextProps) => {
    return (!prevProps.visible && nextProps.visible);
  };

  willClose = (prevProps, nextProps) => {
    return (prevProps.visible && !nextProps.visible);
  };

  imageLoad = () => {
    // const image = document.querySelector('#preview_image');
  };

  imgMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  img_wrp_click = (e) => {
    e.stopPropagation();
  };

  render() {
    const {imgList, activeImgIndex} = this.state;
    const {visible} = this.state;
    const imgSrc = imgList[activeImgIndex];
    return <div>
      <View show={visible}>
        <div className="preview_container"
             onClick={this.closeDialog}>
          <div className="img_container">
            <div className="img_wrp"
                 onClick={this.img_wrp_click}
                 onMouseDown={this.imgMouseDown}>
              <img src={imgSrc}
                   id="preview_image"
                   onLoad={this.imageLoad} alt=""/>

              <div className="img_preview_close"
                   onClick={this.closeDialog}/>
            </div>
          </div>
          {/*工具栏*/}
          {imgList.length > 1 ? <div className="img_opr_container" onClick={(e) => {
            e.stopPropagation();
            e.preventDefault()
          }}>
            <ul className="img_opr_list">
              <li className={classnames('img_opr_item', {disabled: activeImgIndex === 0})}
                  onClick={this.prev}>
                <i className="arrow_left" title="查看上一个"/>
              </li>
              {/*<li className="img_opr_item">*/}
              {/*<i className="icon_download" title="下载图片"/>*/}
              {/*</li>*/}
              {/*<li className="img_opr_item">*/}
              {/*<i className="icon_rotate" title="旋转图片"/>*/}
              {/*</li>*/}
              <li className={classnames('img_opr_item', {disabled: activeImgIndex >= imgList.length - 1})}
                  onClick={this.next}>
                <i className="arrow_right" title="查看下一个"/>
              </li>
            </ul>
          </div> : ''}

        </div>
      </View>
    </div>
  }
}