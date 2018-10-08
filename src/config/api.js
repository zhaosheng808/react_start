/**
 * Created by DELL on 2018/10/8.
 */
/*
 * 测试api: http://cms-live.foundao.com/bjnews_cms/
 * 正式：   http://uuadmcms.chanjet.com/
 * */

const root = 'http://cms-happy.foundao.com/bjnews_cms/';

/*
 * package 配置代理
 * "proxy": "http://cms-live.foundao.com/"
 * */

export default {
  // =============所有api在此处管理============

  // 系统管理
  login: root + 'login/login',  // 用户登录
}