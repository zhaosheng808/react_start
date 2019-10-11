/**
 * Created by DELL on 2017/11/16.
 */
const LOGIN = 'LOGIN';
const SIGN_OUT = 'SIGN_OUT';
const GET_NODES = 'GET_NODES';

const defaultState = {
  // department_id: 1,
  // head_image: "",
  // is_super: 1,
  // login_name: "dxp",
  // mobile: "18224454519",
  // reporter_id: 0,
  // role_id: 1,
  // role_status: 1,
  // token: "AmJV4QxrXpwlVwoZtiYcvMfSuIhSoNyIuL9cGlmrYqbpqeGj2A63d/fHgTvyZ5VJypRj/hV4DNJg4joR7BfrD2I5dy737EIazcWhgCF5XgKRl1TT8b+gAsOuOwA3oZVo5kx+RG+VEEJfTSRw+zAeIrOhH6h6v7zaFG0XZFdwzMecE2Ywu/fHYRmofs2h+4bUvCIjV6bh26BmSGGByGxQB4Ibz6fI3b4IXN/HT9uWzbo=",
  // user_id: 2,
  // user_name: "董兴平",
};

export default function reduce(state = defaultState, action = {}) {
  switch (action.type) {
    case 'LOGIN' :
      return {...action.data};
    case 'GET_NODES' :
      return {...state,nodes : action.data.nodes};
    case 'SIGN_OUT' :
      return {};
    default :
      return state
  }
}

// 登录
export const login = (userInfo) => {
  return {
    type: LOGIN,
    data: userInfo
  }
};

// 改变节点
export const updateUserInfo = (userInfo) => {
  return {
    type: GET_NODES,
    data: userInfo
  }
};

// 退出
export const signOut = () => {
  return {
    type: SIGN_OUT
  }
};