import { MatrixIcon } from '../../Icon/index';

const feedbackLink = 'https://forms.gle/1HAZ8puQ9vhBSqMGA';

export default () => {
  return (
    <div
      onClick={() => {
        window.open(feedbackLink, '_blank');
      }}
    >
      <MatrixIcon />
      <span className={'only-in-tooltip'}>Feedback</span>
    </div>
  );
};
