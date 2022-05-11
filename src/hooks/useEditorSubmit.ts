import type { ValidationError } from 'class-validator';
import {
  validateOrReject,
  Length,
  ArrayMaxSize,
  IsArray,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { message } from 'antd';
import { useIntl } from 'umi';
import { editorRules } from '../../config';

export class Post {
  // title 长度判断
  @Length(editorRules.title.min, editorRules.title.max, {
    message: 'messages.editor.verify.title.length',
  })
  // 标题不能为空
  @IsNotEmpty({
    message: 'messages.editor.verify.title.empty',
  })
  title: string;

  // content 长度判断
  @Length(editorRules.content.min, editorRules.content.max, {
    message: 'messages.editor.verify.content.length',
  })
  // 内容不能为空
  @IsNotEmpty({
    message: 'messages.editor.verify.content.empty',
  })
  content: string;

  // 过滤后的内容不能为空
  @IsNotEmpty({
    message: 'messages.editor.verify.content.filterEmpty',
  })
  contentXssFilter: string;

  // summary 长度判断
  @Length(editorRules.summary.min, editorRules.summary.max, {
    message: 'messages.editor.verify.summary.length',
  })
  summary: string;

  // 封面长度判断
  @Length(editorRules.cover.min, editorRules.cover.max, {
    message: 'messages.editor.verify.cover.length',
  })
  cover: string;

  // tag 单个个数长度判断
  @MaxLength(editorRules.tags.singleLength, {
    each: true,
    message: 'messages.editor.verify.tag.singleLength',
  })
  // tags 长度 个数 判断
  @ArrayMaxSize(editorRules.tags.maxNumber, {
    message: 'messages.editor.verify.tag.number',
  })
  @IsArray()
  tags: string[];

  // tags 总长度判断（可以考虑删掉，暂时保持一致）
  @Length(editorRules.tags.min, editorRules.tags.max, {
    message: 'messages.editor.verify.tag.length',
  })
  tagsStr: string;

  // license 长度判断
  @Length(editorRules.license.min, editorRules.license.max, {
    message: 'messages.editor.verify.license.length',
  })
  license: string;

  // categories 长度判断
  // 暂无
}

export default function useEditorSubmit() {
  const intl = useIntl();

  const validateFn = async ({
    title,
    content,
    contentXssFilter,
    summary,
    cover,
    tags,
    tagsStr,
    license,
  }: Post): Promise<boolean> => {
    const post = new Post();
    post.title = title;
    post.content = content;
    post.contentXssFilter = contentXssFilter;
    post.summary = summary;
    post.cover = cover;
    post.tags = tags;
    post.tagsStr = tagsStr;
    post.license = license;

    // message intl
    const messagesIntl = {
      'messages.editor.verify.title.length': intl.formatMessage(
        {
          id: 'messages.editor.verify.title.length',
        },
        {
          min: editorRules.title.min,
          max: editorRules.title.max,
        },
      ),
      'messages.editor.verify.title.empty': intl.formatMessage({
        id: 'messages.editor.verify.title.empty',
      }),

      'messages.editor.verify.content.empty': intl.formatMessage({
        id: 'messages.editor.verify.content.empty',
      }),
      'messages.editor.verify.content.length': intl.formatMessage(
        {
          id: 'messages.editor.verify.content.length',
        },
        {
          min: editorRules.content.min,
          max: editorRules.content.max,
        },
      ),
      'messages.editor.verify.content.filterEmpty': intl.formatMessage({
        id: 'messages.editor.verify.content.filterEmpty',
      }),
      'messages.editor.verify.summary.length': intl.formatMessage(
        {
          id: 'messages.editor.verify.summary.length',
        },
        {
          min: editorRules.summary.min,
          max: editorRules.summary.max,
        },
      ),
      'messages.editor.verify.cover.length': intl.formatMessage(
        {
          id: 'messages.editor.verify.cover.length',
        },
        {
          min: editorRules.cover.min,
          max: editorRules.cover.max,
        },
      ),
      'messages.editor.verify.tag.number': intl.formatMessage(
        {
          id: 'messages.editor.verify.tag.number',
        },
        {
          maxNumber: editorRules.tags.maxNumber,
        },
      ),
      'messages.editor.verify.tag.singleLength': intl.formatMessage(
        {
          id: 'messages.editor.verify.tag.singleLength',
        },
        {
          max: editorRules.tags.singleLength,
        },
      ),
      'messages.editor.verify.tag.length': intl.formatMessage(
        {
          id: 'messages.editor.verify.tag.length',
        },
        {
          min: editorRules.tags.min,
          max: editorRules.tags.max,
        },
      ),
      'messages.editor.verify.license.length': intl.formatMessage(
        {
          id: 'messages.editor.verify.license.length',
        },
        {
          min: editorRules.license.min,
          max: editorRules.license.max,
        },
      ),
    };

    try {
      await validateOrReject(post);
      return true;
    } catch (err: unknown) {
      const errors = err as ValidationError[];
      // errors is an array of validation errors
      if (errors.length && errors[0].constraints) {
        console.log('validation failed. errors: ', errors);

        // get message content
        const _msgs = Object.values(errors[0].constraints);

        if (_msgs.length) {
          message.warning(messagesIntl[_msgs[0]]);
        } else {
          message.warning(intl.formatMessage({ id: 'messages.fail' }));
        }
        return false;
      } else {
        console.log('validation succeed');
        return true;
      }
    }
  };

  return {
    validate: validateFn,
  };
}
