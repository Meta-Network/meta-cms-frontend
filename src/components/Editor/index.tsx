import React, { useEffect, useCallback } from 'react';
import Vditor from 'vditor';
import md from './index.md';

const e = React.createElement;

const Editor: React.FC = () => {
  const init = useCallback(() => {
    // const _width =
    //   window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const _height =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight ||
      800;

    const vditor = new Vditor('vditor', {
      height: _height - 60 - 100,
      cache: {
        enable: false,
      },
      after() {
        vditor.setValue(md);
      },
      // _lutePath: `http://192.168.0.107:9090/lute.min.js?${new Date().getTime()}`,
      // _lutePath: 'src/js/lute/lute.min.js',
      // cdn: 'http://localhost:9000',
      mode: 'ir',
      outline: {
        enable: false,
        position: 'left',
      },
      debugger: true,
      typewriterMode: true,
      placeholder: 'Hello, Vditor!',
      preview: {
        markdown: {
          toc: true,
          mark: true,
          footnotes: true,
          autoSpace: true,
        },
        math: {
          engine: 'KaTeX',
        },
      },
      toolbarConfig: {
        pin: true,
      },
      counter: {
        enable: true,
        type: 'text',
      },
      hint: {
        emojiPath: 'https://cdn.jsdelivr.net/npm/vditor@1.8.3/dist/images/emoji',
        emojiTail: '<a href="https://ld246.com/settings/function" target="_blank">设置常用表情</a>',
        emoji: {
          sd: '💔',
          j: 'https://unpkg.com/vditor@1.3.1/dist/images/emoji/j.png',
        },
        parse: false,
        extend: [
          {
            key: '@',
            hint: (key) => {
              console.log(key);
              if ('vanessa'.indexOf(key.toLocaleLowerCase()) > -1) {
                return [
                  {
                    value: '@Vanessa',
                    html: '<img src="https://avatars0.githubusercontent.com/u/970828?s=60&v=4"/> Vanessa',
                  },
                ];
              }
              return [];
            },
          },
          {
            key: '#',
            hint: (key) => {
              console.log(key);
              if ('vditor'.indexOf(key.toLocaleLowerCase()) > -1) {
                return [
                  {
                    value: '#Vditor',
                    html: '<span style="color: #999;">#Vditor</span> ♏ 一款浏览器端的 Markdown 编辑器，支持所见即所得（富文本）、即时渲染（类似 Typora）和分屏预览模式。',
                  },
                ];
              }
              return [];
            },
          },
        ],
      },
      tab: '\t',
      upload: {
        accept: 'image/*,.mp3, .wav, .rar',
        token: 'test',
        url: '/api/upload/editor',
        linkToImgUrl: '/api/upload/fetch',
        filename(name) {
          return name
            .replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '')
            .replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '')
            .replace('/\\s/g', '');
        },
      },
    });

    (window as any).vditor = vditor;
    return vditor;
  }, []);

  useEffect(() => {
    init();
    return () => {};
  }, [init]);

  return e('div', { id: 'vditor', className: 'vditor-edit' });
};

export default Editor;
