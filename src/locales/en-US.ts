import component from './en-US/component';
import editor from './en-US/editor';
import guide from './en-US/guide';
import login from './en-US/login';
import manage from './en-US/manage';
import menu from './en-US/menu';
import messages from './en-US/messages';
import posts from './en-US/posts';
import result from './en-US/result';
import setting from './en-US/setting';
import timezones from './en-US/timezones';

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
