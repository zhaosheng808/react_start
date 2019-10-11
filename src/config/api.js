/**
 * Created by DELL on 2018/10/8.
 */
import {API_HOST} from './baseConfig';

const host = API_HOST + '?service=';
// const upload_host = API_HOST_upload
/*
 * package 配置代理
 * "proxy": "http://cms-live.foundao.com/"
 * */
// micro-cms/   
export default {
  // =============所有api在此处管理============
 login: host + 'App.Login.In'
}