import { css } from '../../styled-system/css';

const COLOR_BLUE = 'rgb(95 174 208)';
const COLOR_PURPLE = 'rgb(129 88 186)';

export function LeverIcon() {
  return (
    <div
      className={css({
        width: '100%',
        aspectRatio: '1',
        containerType: 'size',
        display: 'grid',
        gridTemplateRows: 'auto 1fr 1fr',
      })}
    >
      <div
        className={css({
          borderRadius: '50%',
          border: `8cqw solid ${COLOR_BLUE}`,
          width: '24cqw',
          marginInline: 'auto',
          aspectRatio: '1',
        })}
      />
      <div
        className={css({
          width: '10cqw',
          backgroundColor: `${COLOR_BLUE}`,
          marginInline: 'auto',
        })}
      />
      <div
        className={css({
          width: '70cqw',
          borderTop: `10cqw solid ${COLOR_BLUE}`,
          borderLeft: `10cqw solid ${COLOR_BLUE}`,
          borderRight: `10cqw solid ${COLOR_BLUE}`,
          borderRadius: '9999px 9999px 0 0',
          margin: '0 auto',
          padding: '10cqw 10cqw 0',
          _after: {
            content: '""',
            display: 'block',
            width: '100%',
            height: '100%',
            paddingBottom: '30cqw',
            borderRadius: '9999px 9999px 0 0',
            backgroundColor: `${COLOR_PURPLE}`,
          },
        })}
      />
    </div>
  );
}
