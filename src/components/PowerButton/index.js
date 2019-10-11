/**
 * Created by DELL on 2018/11/3.
 */
import React, {Component} from 'react';
import {
  withRouter
} from 'react-router-dom'
import {Button} from 'element-react';
import PropTypes from 'prop-types'
import tools from '@/utils/tools';


/*带权限的按钮*/
export default
@withRouter
class PowerButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasPower: false
    }
  }

  componentWillMount() {
    const {webButton} = this.props;
    const hasPower = tools.validatePower(webButton, this);
    this.setState({
      hasPower
    })
  };

  _onclick = () => {
    const {onClick} = this.props;
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  };

  render() {
    const {
      type,
      size,
      children,
      plain,
      loading,
      disabled,
      icon,
      nativeType,
      className,
      style = {}
    } = this.props;
    const {hasPower} = this.state;
    return (
      <span>
        {
          hasPower ? <Button type={type}
                             className={className}
                             size={size}
                             plain={plain}
                             loading={loading}
                             disabled={disabled}
                             icon={icon}
                             nativeType={nativeType}
                             style={{...style}}
                             onClick={this._onclick}
          > {children} </Button> : ''
        }
      </span>
    )
  }
}
PowerButton.propTypes = {
  webButton: PropTypes.string, // 按钮名称
  onClick: PropTypes.func, // 按钮名称
};