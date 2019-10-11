/**
 * Created by DELL on 2017/11/16.
 */
const DETAIL = 'DETAIL';

const defaultState = {

};

export default function reduce(state = defaultState, action = {}) {
  switch (action.type) {
    case 'DETAIL' :
      return {...action.data};
    default :
      return state
  }
}

// 点击详情
export const detail = (detailInfo) => {
  return {
    type: DETAIL,
    data: detailInfo
  }
};
