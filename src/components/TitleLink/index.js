import React, {Component} from 'react'

import PropTypes from 'prop-types'
import {getPreview} from '@/config';

export default
class TitleLink extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  aLink_click = (previewUrl, e) => {
    e.preventDefault();
    const x = parseInt((window.innerWidth - 380) / 2, 10);
    const y = 120;
    // const time = new Date().getTime();
    window.open(previewUrl, previewUrl, `width=380,height=550,left=${x},top=${y}`);
  };

  render() {
    /*type
     '图文':1
     '视频': 2
     '直播': 3
     '回放': 4
     '音频': 5
     '新华号: 7
     '数聚': 8*/
    const {row, 
      sourceType,
       style = {}} = this.props;
    const previewUrl = getPreview(row, row.type,sourceType);
    return (
      <div className="title-link">
        {previewUrl ? <a href={previewUrl}
                         style={{...style}}
                         onClick={this.aLink_click.bind(this, previewUrl)}
                         target="_black">{row.title}</a> : row.title}
      </div>
    )
  }
}

TitleLink.propTypes = {
  row: PropTypes.object.isRequired,
};