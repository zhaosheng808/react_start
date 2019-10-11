/**
 * Created by DELL on 2018/10/8.
 */
import {h5_base} from './baseConfig';

// 所有版面  --》// 如需更新名字 推送版面需要更新
export const pageTypes = [
  {name: '国际', value: 1},
  {name: '财经', value: 2},
  {name: '军情', value: 3},
  {name: '汽车', value: 4},
  {name: '健康', value: 5},
  {name: '教育', value: 6},
  {name: '科技', value: 7},
  {name: '数聚', value: 8},
  // {name: 'TOP10', value: 9},
  // {name: '政务', value: 12},
  {name: '知视', value: 13},
  {name: '听闻', value: 14},
  {name: '资讯', value: 15},
  {name: '直播', value: 16},
  {name: '视频', value: 17},
  // {name: '论坛', value: 18},
  // {name: '新华号', value: 19},
  {name: '学习进行时', value: 20},
  // {name: '直播预告', value: 25},
  {name: '中转站', value: 28},
  {name: "大公司头条", value: 31}
];

// 专题类型
export const specialTypes = [
  {name: '标准专题', value: 1},
  {name: '两会专题', value: 0}
];
// 稿件类型
export const manuscriptTypes = [
  {name: '全部', value: 0},
  {name: '图文', value: 1},
  {name: '视频', value: 2},
  {name: '直播', value: 3},
  {name: '回放', value: 4},
  {name: '音频', value: 5},
  {name: '新华号', value: 7},
  {name: '政务', value: 8},
  {name: '预告', value: 9},
  {name: '专题', value: 10},
  {name: 'banner组', value: 21},
  {name: '专区', value: 22},
];

// 稿件类型
export const specialModules = [
  {name: '大图轮播', value: 1},
  {name: '左文右图', value: 2},
  {name: '日程发布', value: 3},
  {name: '一图多跨', value: 4},
  {name: '问答模块', value: 5},
  {name: '数聚模块', value: 6},
  {name: '多图轮播', value: 7},
  {name: '评论模块', value: 8},

  {name: '广告模块', value: 10},
  {name: '外链模块', value: 11},
  // {name: '大视频模块', value: 12},
];

// h5预览页配置
const h5_host = h5_base;

// h5预览地址配置
export const h5_url = {
  article: h5_host + 'article.html',     // 图文
  video: h5_host + 'video.html',         // 视频
  // datacount: h5_host + 'datacount.html', // 数聚
  live: h5_host + 'live.html',           // 直播
  index: h5_host + 'index.html',           // 咨询预览
  // xxjxs: h5_host + 'xxjxs/index.html',           // 学习进行时
  // govsituation: h5_host + 'govsituation.html',   // 政情
  energyStar: h5_host + 'energyStar/index.html',    // 正能量传播官 - 主页
  star: h5_host + 'energyStar/star.html',           // 正能量传播官 - 明星页
  special: h5_host + 'specialTopic/index.html',           // 专题 -> 两会
  specialNormal: h5_host + 'specialNormal/index.html',           // 专题 -> 普通专题
};
// 获取预览地址
export function getPreview(row, type,sourceType) {
  let jump_url = '';

  if(sourceType === 'count'){ //来自于统计
    jump_url = h5_url.article + '?articleId=' + row.articleUuid + '&preview=1'; //英文版目前分享出来全是图文形式
  } else {
    jump_url = h5_url.article + '?articleId=' + row.uuid + '&preview=1'; //英文版目前分享出来全是图文形式
  }
  return jump_url;
}