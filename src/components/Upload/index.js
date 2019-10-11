import React, {Component} from 'react'
import $ from "jquery";
import api from '@/config/api'
import {Message, Loading, Button} from "element-react";
import tools from '@/utils/tools';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './upload.scss'

export default class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileUrl: '',  // 上传文件返回的地址
      isUpload: false,
      percent: 0,
      count:0, // 多选时计数
    };
  }

  componentWillReceiveProps(nextProps) {
    const {cover} = this.props;
    const nextCover = nextProps.cover;
    if (cover !== nextCover) {  // 重置url
      this.setState({
        fileUrl: '',  // 上传文件返回的地址
        isUpload: false,
        percent: 0
      })
    }
  };

  // 上传进度监听
  progressHandlingFunction = (event) => {
    if (event.lengthComputable) {
      // const value = (event.loaded / event.total * 100 | 0);
      // console.log(value, 'value');
    }
  };
  // 小文件上传接口
  upLoadSingle = (fileData) => {
    let token = '';
    // let token = 'beb78ae4ef6c9e025b7d837a032e321dde596f88d2d3f1c9285adde0d12cd2a4';
    // let user_uuid = '';
    const userInfo = tools.getUserData();
    if (userInfo['auth-token']) {
      token = userInfo['auth-token'];
      // user_uuid = userInfo.user_uuid;
    }
    const {uploadTypeName = 'resource'} = this.props; // 默认上传图片
    let upload_url;
    if(uploadTypeName === 'resource' || uploadTypeName === 'logos' || uploadTypeName === 'fonts' || uploadTypeName === 'music'){
      upload_url= api.upload_image; //资源封面图:resource  音乐:music  徽标:logos 滤镜:visualeffects 字体:fonts
    } else if(uploadTypeName === 'apk'){
      upload_url = api.upload_single;
    } 
    else {// video:默认视频,image1:1X1画幅,image9:9X16画幅,music:模板音乐 sticker: 字体glsl : glsl文件
      upload_url = api.upload_send;
    }
    $.ajax({
      url: upload_url,
      type: 'POST',
      headers: {
        'Authorization': token,
        // 'userUuid': user_uuid,
      },
      async: true,         //异步
      processData: false,  // processData用于对data参数进行序列化处理，默认值是true。默认情况下发送的数据将被转换为对象，如果不希望把File转换，需要设置为false
      contentType: false,  //很重要，指定为false才能形成正确的Content-Type
      dataType: 'json',
      type1:'logs',
      data: fileData,
      // xhr: () => {          // 这里我们先拿到jQuery产生的 XMLHttpRequest对象，为其增加 progress 事件绑定，然后再返回交给ajax使用
      //   const myXhr = $.ajaxSettings.xhr();
      //   if (myXhr.upload) {
      //     myXhr.upload.addEventListener('progress', this.progressHandlingFunction, false)// progress事件会在浏览器接收新数据期间周期性地触发。而onprogress事件处理程序会接收到一个event对象，其target属性是XHR对象，但包含着三个额外的属性：lengthComputable、loaded和total。其中，lengthComputable是一个表示进度信息是否可用的布尔值，loaded表示已经接收的字节数，loaded表示根据Content-Length响应头部确定的预期字节数。
      //   }
      // },
    }).done((res) => {
      if (res.code === 0 || res.code === 200) {
        let num = this.state.count
        num -= 1
        this.setState({
          count:num
        })
        if(num <= 0){
          this.setState({
            fileUrl: res.data,
            percent: 100,
            isUpload: false
          });
        }
        
        Message.success('文件上传成功');
        this.props.successCallBack(res.data,res.filename)

      } else {
        Message.error(res.msg);
        this.setState({
          isUpload: false
        });
        if (this.props.errorCallBack) {
          this.props.errorCallBack(res.msg)
        }
      }
    }).fail((err) => {
      Message.error('文件上传失败');
      this.setState({
        isUpload: false
      });
      if (this.props.errorCallBack) {
        this.props.errorCallBack('文件上传失败');
      }
    })
  };

  // 上传点击事件
  upLoad = (e) => {
    let fileList = e.target.files
    this.setState({
      count : fileList.length !== 0 ? fileList.length : 0
    })
    for (const key in fileList) {
      if (fileList.hasOwnProperty(key)) {
        const element = fileList[key];
        const fileobj = element;
        if (!fileobj) {
          Message.error('文件格式不正确，请重新选择文件！');
          return
        }
        const fileName = fileobj.name;
        let suffix = ''; // 后缀
        if (fileName) {
          const fileNameArr = fileName.split('.');
          suffix = fileNameArr.pop();
        }
        const {uploadType = 'image'} = this.props;
        if (uploadType === 'image') {
          // let imageMaxSize = maxSize || 3;  //默认图片最多3M
          // if (fileobj.size / 1024 > imageMaxSize * 1024) {
          //   Message.warning(`文件大小不能超过 ${imageMaxSize} M`);
          //   return false
          // }
        } else if (uploadType === 'apk') {
          if (suffix !== 'apk') {
            Message.error('请上传apk格式文件');
            return false
          }
        } else {
          // let fileMaxSize = maxSize || 100;  //默认100M
          // if (fileobj.size / 1024 > fileMaxSize * 1024) {
          //   Message.warning(`文件大小不能超过 ${fileMaxSize} M`);
          //   return false
          // }
        }
        this.setState({
          isUpload: true,
          percent: 0
        });
        const formData = new FormData();
        
        // const token = '063d112b838b6f9ddc2d146d5f79858302a28e009fe698ddcc0af3aa72635276';
        formData.append('file', fileobj);
        formData.append('type', this.props.uploadTypeName);
        formData.append('file_path', this.props.file_path?this.props.file_path:'');
        formData.append('deleteFile', this.props.deleteFile?this.props.deleteFile:'');
        // formData.append('token', token);
        this.upLoadSingle(formData);
      }
    }
  };

  imageErr = () => {
    Message.error('图片加载失败');
  };
  uploadClick = () => {
    const {isUpload} = this.state;
    const {disabled} = this.props;
    if (!isUpload && (!disabled)) {
      // 重置input框 否则选择相同的文件不会触发change 事件
      this.refs.input.value = '';
      this.refs.input.click()
    }
  };

  render() {
    const {isUpload, fileUrl} = this.state;
    const {accept, uploadType, showButton, disabled} = this.props;
    const {style} = this.props;
    const box_style = {
      width: '100px',
      height: '100px',
      ...style
    };
    const fileAccept = accept || '*/*'; // 默认只能上传图片
    const imageCover =  this.props.cover;  //fileUrl || file ||
    return (
      <div className={classnames('upload-box', {disabled: disabled})}
           onClick={this.uploadClick}>
        <input type="file"
               ref="input"
               style={{display: "none"}}
               accept={fileAccept}
               multiple={true}
               onChange={this.upLoad.bind(this)}/>
        {fileUrl && showButton ? <a href={fileUrl} target="_blank">{fileUrl}</a> : ''}
        {!showButton ? <Loading loading={isUpload} text={"文件上传中"}>
          <div className="upload-box-inner"
               style={box_style}>        
            {uploadType === 'image' ? (imageCover? <img  src={imageCover} alt=""/> :    //onError={this.imageErr} 
              <i className="el-icon-plus uploader-icon"/>)
              : <i className="el-icon-plus uploader-icon"/>
            }
          </div>
        </Loading> : (
          <div>
            <Button size='small'
                    loading={isUpload}
                    type='info'>{isUpload ? '上传中...' : '上传文件'}</Button>
          </div>
        )}

      </div>
    )
  }
}
Upload.propTypes = {
  successCallBack: PropTypes.func.isRequired,
  errorCallBack: PropTypes.func,
  // showButton: PropTypes.boolean,     // 是否显示按钮默认为false
  // disabled: PropTypes.boolean,     // 是否不能点击按钮默认为false
  accept: PropTypes.string,     // 接受文件限制后缀
  uploadType: PropTypes.string, // 上传文件类型 image / audio / video
  maxSize: PropTypes.number, // 上传文件大小 M
};