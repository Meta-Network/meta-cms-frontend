import { fetchTokenAPI } from '@/helpers';
import { StorageFleek } from '@/services/storage';
// import '~vditor/src/assets/scss/index';
import { message } from 'antd';
import React, { useEffect, createRef, useCallback } from 'react';
import Vditor from 'vditor';
import type { Storage } from '../../typings/Storage.d';
interface Props {
  asyncContentToDB: (val: string) => void;
  bindVditor?: (vditor: Vditor) => void;
}

interface UploadFormat {
  msg: string;
  code: number;
  data: {
    errFiles: string[];
    succMap: Record<string, string>;
  };
}

const e = React.createElement;
let _TOKEN = '';

const Editor: React.FC<Props> = React.memo(function Editor({ asyncContentToDB, bindVditor }) {
  const vditorRef = createRef<HTMLDivElement>();

  const fetchToken = useCallback(async () => {
    const result = await fetchTokenAPI();
    _TOKEN = result;
  }, []);

  const init = useCallback(() => {
    const vditor = new Vditor('vditor', {
      cache: {
        enable: false,
      },
      after() {
        // vditor.setValue('');
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
        // 'upload',
        {
          name: 'upload',
          tip: '上传图片',
        },
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
        setHeaders() {
          return {
            authorization: `Bearer ${_TOKEN}`,
          };
        },
        url: StorageFleek,
        filename(name) {
          return name
            .replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '')
            .replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '')
            .replace('/\\s/g', '');
        },
        format(files: File[], responseText: string): string {
          console.log('format');
          // console.log('files', files);
          // console.log('responseText', responseText);
          const {
            data,
            statusCode,
            message: msg,
          }: GLOBAL.GeneralResponse<Storage> = JSON.parse(responseText);

          if (statusCode == 201) {
            return JSON.stringify({
              msg: msg,
              code: statusCode,
              data: {
                errFiles: [],
                succMap: {
                  [data.key]: data.publicUrl,
                },
              },
            } as UploadFormat);
          } else {
            message.error('图片上传失败: ' + msg);
            return '';
          }
        },
        error(msg: string): void {
          console.log('error msg', msg);
          message.error(`error ${msg}`);
        },
      },
      input(val: string) {
        // console.log('val', val);
        asyncContentToDB(val);
      },
    });

    // TODO: need modify
    (window as any).vditor = vditor;

    if (!!bindVditor) {
      bindVditor(vditor);
    }
  }, [asyncContentToDB, bindVditor]);

  useEffect(() => {
    fetchToken();
    init();

    // TODO: 没有找到更好的办法获取 token 暂时 loop
    const timer = setInterval(fetchToken, 1000 * 60 * 3);
    return clearInterval(timer);
    // only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return e('div', { id: 'vditor', className: 'vditor-edit', ref: vditorRef });
});
export default Editor;
