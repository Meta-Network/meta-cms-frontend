import component from './zh-CN/component';
import editor from './zh-CN/editor';
import guide from './zh-CN/guide';
import login from './zh-CN/login';
import manage from './zh-CN/manage';
import menu from './zh-CN/menu';
import messages from './zh-CN/messages';
import posts from './zh-CN/posts';
import result from './zh-CN/result';
import setting from './zh-CN/setting';
import timezones from './zh-CN/timezones';

export default {
  ...menu,
  ...guide,
  ...posts,
  ...editor,
  ...setting,
  ...messages,
  ...component,
  ...timezones,
  ...login,
  ...manage,
  ...result,
};
