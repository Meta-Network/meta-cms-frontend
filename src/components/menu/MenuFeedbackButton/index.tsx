import { MatrixIcon } from '../../Icon/index';
import { useIntl } from 'umi';

export default () => {
  const intl = useIntl();

  return (
    <div
      onClick={() => {
        window.open(META_FEEDBACK, '_blank');
      }}
    >
      <MatrixIcon />
      <span className={'only-in-tooltip'}>
        {intl.formatMessage({
          id: 'menu.feedback.feedback',
        })}
      </span>
    </div>
  );
};
