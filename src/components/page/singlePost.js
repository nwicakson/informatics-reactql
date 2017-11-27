import React, { Component } from 'react';
import { map } from 'lodash';
import hljs from 'highlightjs';
import Shortcodes from './shortcodes';
import css from './singlePost.scss';

export default class SinglePost extends Component {
  componentDidMount() {
    // render embed shortcodes
    const shortcodes = document.getElementsByClassName('post__shortcode');
    map(shortcodes, shortcode => Shortcodes.renderEmbed(shortcode));

    // syntax highlight for code and pre elements
    const code = document.getElementsByTagName('pre');
    for (let i = 0; i < code.length; i++) {
      hljs.highlightBlock(code[i]);
    }
  }

  parseContent() {
    const { content } = this.props;
    const trimmed = content.trim();
    const splitContent = trimmed.split('\n');
    const voidTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'code', 'pre', 'div'];
    const shortcodes = ['caption', 'embed', 'gist'];

    map(splitContent, (line, index) => {
      let newline = line;
      // check if line is a shortcode
      if (newline[0] === '[') {
        const shortcode = line.match(/([[])\w+/g).toString().substr(1);
        if (shortcodes.indexOf(shortcode) >= 0) {
          newline = Shortcodes[shortcode](line);
        }
      } else {
        // wrap lines without voidTags in paragraph tags
        let tag = line.match(/^<\w+/g);
        tag = tag ? tag[0].slice(1) : '';
        if (voidTags.indexOf(tag) === -1 && line.length > 1) {
          newline = `<p>${line}</p>`;
        }
      }

      splitContent[index] = newline;
    });

    return {
      __html: splitContent.join(''),
    };
  }

  render() {
    return <div className={css.singlePost} dangerouslySetInnerHTML={this.parseContent()} />;
  }
}
