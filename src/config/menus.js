/**
 * Created by DELL on 2018/10/23.
 */

import loadable from '@/utils/loadable'

// 内容管理
const Task = loadable(() => import('@/pages/Content/Task'));

//
// 销售统计
// const SalesDetail = loadable(() => import('@/pages/SalesStatistics/SalesDetail'));

//
/*
 * @node_name:路由名称
 * @webRoute:路由路径
 * @component:路由组件
 * @exact:路径是否需要完全匹配 如果有三级路时 二级路由需要设置为true
 * @hidden: 是否在左侧菜单栏隐藏
 *
 * */
/*系统菜单目录*/
const menus = [
  {
    node_name: '内容管理', webRoute: '/content', children: [
    {'node_name': '任务管理', webRoute: '/content/task', component: Task},
  ]
  },
  {
    node_name: '产品统计', webRoute: '/productStatistics', children: [
    {'node_name': '视频制作', webRoute: '/productStatistics/makeVideo', component: Task},
  ]
  },
];

export default menus;