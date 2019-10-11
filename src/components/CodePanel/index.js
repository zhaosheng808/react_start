import React, {Component} from 'react'

import './index.scss';

export default
class CodePanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      oriCode: '',
      jsonError: false  // json解析异常？
    };
  }

  componentWillReceiveProps(nextProps) {
    const {code} = this.props;
    const nextCode = nextProps.code;
    const {codeType} = nextProps;
    if (code !== nextCode) {
      if (nextCode) {
        if (codeType !== 'xml') { // 需要格式化
          this.jsonData(nextCode).then((data) => {
            const oriCode = this.syntaxHighlight(data);
            this.setState({
              oriCode: oriCode,
              jsonError: false
            })
          }).catch(err => {
            //  将HTML转义为实体
            const json = nextCode.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            this.setState({
              oriCode: json,
              jsonError: true
            })
          });
        } else {           // 解析xml
          const json = this.formatXml(nextCode);
          // const json = this.formatXml(nextCode.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
          this.setState({
            oriCode: json
          })
        }
      } else {
        this.setState({
          jsonError: false,
          oriCode: nextCode
        })
      }
    }
  }

  // josn 异常处理
  jsonData = (str) => {
    const p = new Promise(function (resolve, reject) {
      const cc = JSON.parse(str);
      resolve(cc);
    });
    return p;
  };


  // 格式化json数据 高亮显示
  syntaxHighlight = (json) => {
    if (!json) {
      return '';
    }
    if (typeof json !== 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    //  将HTML转义为实体
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // eslint-disable-next-line
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  };
  // 格式化xml 高亮显示
  formatXml = function (content) {
    let xml_doc = null;
    const formatContent = content.replace(/[\n\r]/g, "");
    try {
      xml_doc = (new DOMParser()).parseFromString(formatContent, 'text/xml');
    } catch (e) {
      return false;
    }

    function build_xml(list, element, level) {
      let t = [];

      /*level 节点层级。方便前面添加多少个空格缩进*/
      for (let i = 0; i < level; i++) {
        t.push('  ');
      }

      t = t.join("");

      list.push(t + '<<span class="code-key">' + element.nodeName + '</span>>\n');
      for (let i = 0; i < element.childNodes.length; i++) {
        const childLevel = level + 1;
        let childItem = element.childNodes[i];
        let nodeName = childItem.nodeName;
        if (nodeName === '#text') {
          continue;
        }

        if (childItem.childNodes.length <= 1) {
          let value = '';
          if (childItem.childNodes.length === 1) {
            value = childItem.childNodes[0].nodeValue;
          }

          value = value ? value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

          let value_color = !isNaN(Number(value)) ? 'code-number' : 'code-string';

          let value_txt = '<span class="' + value_color + '">' + value + '</span>';
          let item = t + '  <<span class="code-key">' + nodeName +
            '</span>>' + value_txt + '&lt;/<span class="code-key">' + nodeName + '</span>>\n';
          list.push(item);
        } else {
          build_xml(list, element.childNodes[i], childLevel);
        }
      }
      list.push(t + '&lt;/<span class="code-key">' + element.nodeName + '</span>>\n');
    }

    let list = [];
    build_xml(list, xml_doc.documentElement, 0);
    return list.join("");
  };

  render() {
    const {oriCode, jsonError} = this.state;
    return (
      <div className="codePanel">
        {jsonError ? <p style={{color: 'red', marginBottom: '20px'}}>数据格式化失败</p> : ''}
        {oriCode ? (
          <pre>
          <code dangerouslySetInnerHTML={{__html: oriCode}}/>
        </pre>
        ) : '无数据'}
      </div>
    )
  }
}