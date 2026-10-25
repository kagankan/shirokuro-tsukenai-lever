import { useRef } from 'react';
import { css } from '../../styled-system/css';
import { headerTextButtonClass } from './headerTextButtonClass';
import { Modal } from './Modal';

const linkClass = css({ color: 'accent', textDecoration: 'underline' });

const OFFICIAL_LINKS = [
  { label: '本家サイト', name: '白黒つけない会議', href: 'https://cybozu.co.jp/not-shirokuro/' },
  { label: '本家YouTube', name: '@not_shirokuro', href: 'https://youtube.com/@not_shirokuro' },
];

const officialLinkClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
  height: '100%',
  padding: '3',
  border: '1px solid token(colors.border)',
  borderRadius: '12px',
  background: 'bg',
  fontSize: 'sm',
  textDecoration: 'none',
  transition: 'border-color 0.15s ease',
  _hover: { borderColor: 'accent' },
});

/**
 * 「このアプリについて」ボタン。押すとアプリの説明をモーダルで表示する。
 */
export function AboutButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={headerTextButtonClass}
      >
        ⓘ このアプリについて
      </button>
      <Modal ref={dialogRef} title="白黒つけないレバー" onClose={close}>
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '3',
            color: 'textMuted',
          })}
        >
          <p>
            YouTubeチャンネル「白黒つけない会議」のファンによる非公式アプリです。
            <br />
            レバーを倒して、お題に対する自分の意見の度合いを表せます。
          </p>
          <ul
            className={css({
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2',
            })}
          >
            {OFFICIAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={officialLinkClass}
                >
                  <span className={css({ fontSize: 'xs', color: 'textMuted' })}>{link.label}</span>
                  <span className={css({ fontWeight: 600, color: 'text' })}>{link.name} ↗</span>
                </a>
              </li>
            ))}
          </ul>
          <p
            className={css({
              paddingTop: '3',
              borderTop: '1px solid token(colors.border)',
              fontSize: 'xs',
            })}
          >
            効果音:{' '}
            <a
              href="https://snd.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              SND
            </a>
            （SND03 "industrial" by INDUSTRIAL JP）
          </p>
        </div>
      </Modal>
    </>
  );
}
