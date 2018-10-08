/**
 * Created by DELL on 2017/12/7.
 */

export default {
  addEventHandler: (target, type, fn) => {
    if (target.addEventListener) {
      target.addEventListener(type, fn);
    } else {
      target.attachEvent('on' + type, fn);
    }
  },
  removeEventHandler: (target, type, fn) => {
    if (target.removeEventListener) {
      target.removeEventListener(type, fn);
    } else {
      target.detachEvent('on' + type, fn);
    }
  },
  // 获取页面中url参数
  getParams: function (url) {
    if (!url) {
      url = window.location.hash;
    }
    const theRequest = {};
    const start = url.indexOf("?");
    if (start !== -1) {
      const str = url.substr(start + 1);
      const strs = str.split("&");
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
      }
    }
    return theRequest;
  },
  deepClone: (obj) => {     // 对象中没有function
    return JSON.parse(JSON.stringify(obj));
  },
  //秒转化成 时分秒 00: 00: 00
  secondToDate: (seconds) => {
    let h = Math.floor(seconds / 3600).toString();
    let m = Math.floor((seconds / 60 % 60)).toString();
    let s = Math.floor((seconds % 60)).toString();
    if (h.length < 2) {
      h = '0' + h;
    }
    ;
    if (m.length < 2) {
      m = '0' + m;
    }
    ;
    if (s.length < 2) {
      s = '0' + s;
    }
    ;
    return h + ':' + m + ':' + s;
  },
  // 毫秒转化成帧
  /*
   * second: 秒数
   * frame： 1s -> 对应多少帧
   * */
  secondToFrame: (second, frame = 25) => {
    let h = Math.floor(second / 3600).toString();
    let m = Math.floor((second / 60 % 60)).toString();
    let s = Math.floor((second % 60)).toString();
    const millisecond = second.toFixed(2) - parseInt(second, 10);
    let f = parseInt(millisecond * frame, 10).toString();
    if (h.length < 2) {
      h = '0' + h;
    }
    ;
    if (m.length < 2) {
      m = '0' + m;
    }
    ;
    if (s.length < 2) {
      s = '0' + s;
    }
    ;
    if (f.length < 2) {
      f = '0' + f;
    }
    return h + ':' + m + ':' + s + ':' + f;
  },
  browser: () => {
    const userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    const isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera) {
      return "Opera"
    }
    //判断是否Opera浏览器
    if (userAgent.indexOf("Firefox") > -1) {
      return "FF";
    } //判断是否Firefox浏览器
    if (userAgent.indexOf("Chrome") > -1) {
      return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
      return "Safari";
    } //判断是否Safari浏览器
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
      return "IE";
    } //判断是否IE浏览器
  },
  sortBy: function (attr, rev) {
    /*
     * 数组里面的对象根据key值进行排序 attr : 比较的key值 rev 标识 升序 降序 默认升序排列
     * 使用方法 newArray.sort(sortBy('number',false))
     * //表示根据number属性降序排列; 若第二个参数不传递，默认表示升序排序
     *
     * */
    if (rev === undefined) {
      rev = 1;
    } else {
      rev = (rev) ? 1 : -1;
    }

    return function (a, b) {
      a = a[attr];
      b = b[attr];
      if (a < b) {
        return rev * -1;
      }
      if (a > b) {
        return rev * 1;
      }
      return 0;
    }
  },
  //设置cookie
  setCookie: (cname, cvalue, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  },
  //获取cookie
  getCookie: (cname) => {
    const name = cname + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(name) !== -1) return c.substring(name.length, c.length);
    }
    return "";
  },
  //清除cookie
  clearCookie: (name) => {
    // setCookie(name, "", -1);
  }
}