import { MatrixIcon } from '../../Icon/index';
import { Tooltip } from 'antd';

const feedbackLink = 'https://forms.gle/1HAZ8puQ9vhBSqMGA';

export default () => {
  return (
    <div
      onClick={() => {
        window.open(feedbackLink, '_blank');
      }}
    >
      <Tooltip placement="right" title="Feedback">
        <MatrixIcon />
      </Tooltip>
    </div>
  );
};
