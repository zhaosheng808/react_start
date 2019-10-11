import React, {Component} from 'react'

import PropTypes from 'prop-types'

/*打开一个新窗口 - 小窗*/
export default
class MiniWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  aLink_click = (previewUrl, e) => {
    e.preventDefault();
    const x = parseInt((window.innerWidth - 380) / 2, 10);
    const y = 120;
    window.open(previewUrl, previewUrl, `width=380,height=550,left=${x},top=${y}`);
  };

  render() {
    const {url, style = {}, title = ''} = this.props;
    let text = title || url;
    return (
      <span>
        {url ? <a href={url}
                  style={{...style}}
                  onClick={this.aLink_click.bind(this, url)}
                  target="_black">{text}</a> : text}
      </span>
    )
  }
}

MiniWindow.propTypes = {
  url: PropTypes.string.isRequired,
};