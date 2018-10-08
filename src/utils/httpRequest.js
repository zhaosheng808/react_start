/**
 * Created by DELL on 2017/12/27.
 */
import $ from 'jquery';
/*
* params: object
*
* object.url:   api地址 String， 不能为空
* object.type:  请求方式 String， 默认get
* object.async: 是否异步 Boolean，默认true
* object.data:  请求数据 object， 默认{}
* */
export default function httpRequest(obj) {
  let async = true; // 异步
  if (typeof(obj.async) === 'undefined') {
    async = true;
  } else {
    async = Boolean(obj.async);
  }
  // const time = Date.parse(new Date()) / 1000;

  let token = '';
  const xinhua_userInfo = sessionStorage.xinhua_userInfo;
  if (xinhua_userInfo) {
    const userInfo = JSON.parse(xinhua_userInfo);
    token = userInfo.token;
  }

  return $.ajax({
    url: obj.url,
    type: obj.type || 'GET',
    headers: {
      'auth-token': token
    },
    async: async,
    dataType: 'json',
    data: obj.data || {},
  });
};