import React, { createRef, useCallback, useEffect } from 'react';
import Vditor from 'vditor';
import { fetchTokenAPI } from '@/helpers';
// 目前在 document 内导入
// import '~vditor/src/assets/scss/index';
// import '~vditor/dist/index.css';
import { useIntl } from 'umi';
import { message } from 'antd';
import { useMount } from 'ahooks';
interface Props {
  asyncContentToDB: (val: string) => void;
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

const Editor: React.FC<Props> = React.memo(function Editor({ asyncContentToDB }) {
  const intl = useIntl();
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
      placeholder: intl.formatMessage({
        id: 'editor.edit.placeholder',
      }),
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
        actions: [],
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
        'edit-mode',
        {
          name: 'upload',
          tip: intl.formatMessage({
            id: 'editor.edit.tool.upload',
          }),
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
        emojiTail: `<a href="https://ld246.com/settings/function" target="_blank">${intl.formatMessage(
          {
            id: 'editor.edit.tool.emoji.setEmoji',
          },
        )}</a>`,
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
              // console.log(key);
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
              // console.log(key);
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
        multiple: false,
        fieldName: 'file',
        accept: '.jpg,.jpeg,.png,.gif,.webp,.webm,.bmp',
        // token: token,
        setHeaders() {
          return {
            authorization: `Bearer ${_TOKEN}`,
          };
        },
        url: META_STORAGE_API,
        filename(name) {
          return name
            .replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '')
            .replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '')
            .replace('/\\s/g', '');
        },
        format(files: File[], responseText: string): string {
          // console.log('format');
          // console.log('files', files);
          // console.log('responseText', responseText);
          const {
            data,
            statusCode,
            message: msg,
          }: GLOBAL.GeneralResponse<Storage.Fleek> = JSON.parse(responseText);

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
            message.error(
              `${intl.formatMessage({
                id: 'messages.editor.edit.tool.upload.fail',
              })}: ${msg}`,
            );
            return '';
          }
        },
        error(msg: string): void {
          message.error(msg);
        },
      },
      input(val: string) {
        asyncContentToDB(val);
      },
    });

    // TODO: need modify
    (window as any).vditor = vditor;
  }, [asyncContentToDB, intl]);

  useMount(() => {
    init();
  });

  useEffect(() => {
    fetchToken();

    // TODO: 没有找到更好的办法获取 token (最好在上传前获取一次)， 暂时 loop
    const timer = setInterval(fetchToken, 1000 * 30);
    return () => clearInterval(timer);
  }, [fetchToken]);

  return e('div', { id: 'vditor', className: 'vditor-edit', ref: vditorRef });
});

export default Editor;
