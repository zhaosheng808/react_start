/**
 * Created by DELL on 2017/11/14.
 */
import { combineReducers } from 'redux';


import admin from './models/admin';


// reducer 就是一个纯函数，接收旧的 state 和 action，返回新的 state。

/*
reducer首先用action中传入的type属性来判断我们要做的是哪种操作，
然后再根据传入的其他属性当做参数做你想要的改变，最后返回一个{key : value}的对象，
然后所有类似的对象通过combineReducers合并为一个总状态对象暴露给组件访问。
*/

/*
* combineReducers() 所做的只是生成一个函数，这个函数来调用你的一系列 reducer，
* 每个 reducer 根据它们的 key 来筛选出 state 中的一部分数据并处理，
* 然后这个生成的函数再将所有 reducer 的结果合并成一个大的对象。
* */
const reducers = combineReducers({
    admin,
  // more state
});

export default reducers;