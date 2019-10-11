/**
 * Created by DELL on 2018/11/15.
 */

/*cms打包时间 打包时node脚本自动获取*/
/*eslint-disable no-undef */
const ReleaseTime = _RELEASE_TIME || '';

// const app_name = 'zishengCMS';

/*基础配置， 主要配置cms api地址 和h5预览页地址*/
const _hostname = window.location.hostname;
const _protocol = window.location.protocol;

let _environment = 'test'; // 环境变量 offline/pre/test -> 正式/预上线/测试

const test_config = {  // 测试环境配置
  API_HOST: _protocol + '//zs-cms.enjoycut.cn/',
};

const online_config = {  // 线上环境配置
  API_HOST: _protocol + '//zs-cms.enjoycut.cn/',
};

let _config = test_config;  // 默认测试环境
// let _config = online_config;  // 线上环境

if (_hostname === 'cdn-live.foundao.com') { // 线上环境
  _config = online_config;
  _environment = 'online';
}

const API_HOST = _config.API_HOST; //  cms api
const h5_base = _config.h5_base;   //  h5 地址
const API_HOST_upload = _config.API_HOST_upload //cms上传地
export {API_HOST, h5_base, _environment, ReleaseTime,API_HOST_upload}