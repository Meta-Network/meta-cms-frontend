import { StorageFleek } from '@/services/storage';
import React, { useEffect, useCallback } from 'react';
import Vditor from 'vditor';

interface Props {
  readonly token: string;
  readonly md: string;
  synchronizeContent: (val: string) => void;
}

const e = React.createElement;

const Editor: React.FC<Props> = React.memo(function Editor({ synchronizeContent, token, md }) {
  const init = useCallback(() => {
    const vditor = new Vditor('vditor', {
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
      placeholder: '现在就开始编辑吧！',
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
      toolbar: [
        'headings',
        'bold',
        'italic',
        'strike',
        'link',
        '|',
        'list',
        'ordered-list',
        'check',
        'outdent',
        'indent',
        '|',
        'quote',
        'line',
        'code',
        'inline-code',
        'insert-before',
        'insert-after',
        'table',
        '|',
        'upload',
      ],
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
          robot: '🤖️',
          rocket: '🚀',
          grin: '😁',
          heart: '❤️',
        },
        parse: false,
        extend: [
          {
            key: '@',
            hint: (key) => {
              console.log(key);
              if ('meta'.indexOf(key.toLocaleLowerCase()) > -1) {
                return [
                  {
                    value: '@Meta',
                    html: '<img src="https://ipfs.fleek.co/ipfs/bafybeibqhio6jfywuthqbvtuit2dy2eq37usxmiq26oeiddkrwpsrqdaou"/> Meta',
                  },
                  {
                    value: '@MetaNetwork',
                    html: '<img src="https://ipfs.fleek.co/ipfs/bafybeibqhio6jfywuthqbvtuit2dy2eq37usxmiq26oeiddkrwpsrqdaou"/> MetaNetwork',
                  },
                  {
                    value: '@MetaCMS',
                    html: '<img src="https://ipfs.fleek.co/ipfs/bafybeibqhio6jfywuthqbvtuit2dy2eq37usxmiq26oeiddkrwpsrqdaou"/> MetaCMS',
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
              if ('meta'.indexOf(key.toLocaleLowerCase()) > -1) {
                return [
                  {
                    value: '#Meta',
                    html: '<span style="color: #999;">#Meta</span>',
                  },
                  {
                    value: '#MetaNetwork',
                    html: '<span style="color: #999;">#MetaNetwork</span>',
                  },
                  {
                    value: '#MetaCMS',
                    html: '<span style="color: #999;">#MetaCMS</span>',
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
        fieldName: 'file',
        accept: '.jpg,.jpeg,.png,.gif,.webp,.webm,.bmp',
        // token: token,
        headers: {
          authorization: `Bearer ${token}`,
        },
        url: StorageFleek,
        linkToImgUrl: StorageFleek,
        filename(name) {
          return name
            .replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '')
            .replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '')
            .replace('/\\s/g', '');
        },
        format(files: File[], responseText: string): any {
          // console.log('files', files);
          // console.log('responseText', responseText);
          // 字符串转换为对象
          const { data, statusCode, message } = JSON.parse(responseText);

          if (statusCode == 201) {
            return JSON.stringify({
              msg: message,
              code: statusCode,
              data: {
                errFiles: [],
                succMap: {
                  [data.key]: data.publicUrl,
                },
              },
            });
          } else {
            message.error('图片上传失败: ' + message);
            return;
          }
        },
        // success(editor: HTMLPreElement, msg: string): void {
        //   console.log('success editor', editor);
        //   console.log('success msg', msg);
        // },
        // error(msg: string): void {
        //   console.log('error msg', msg);
        // },
        // linkToImgFormat(responseText: string): string {
        //   console.log('responseText', responseText);
        //   return 'https://storageapi.fleek.co/casimir-crystal-team-bucket/metanetwork/users/metaio-storage/621fb1d2880811ebb6edd017c2d2eca2.png';
        // },
      },
      input(val: string) {
        // console.log('val', val);
        synchronizeContent(val);
      },
    });

    (window as any).vditor = vditor;
    return vditor;
  }, [synchronizeContent, token]);

  useEffect(() => {
    init();
    return () => {};
  }, [init]);

  return e('div', { id: 'vditor', className: 'vditor-edit' });
});
export default Editor;
