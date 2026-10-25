import { useRef } from 'react';
import { css } from '../../styled-system/css';
import { headerTextButtonClass } from './headerTextButtonClass';
import { Modal } from './Modal';

const linkClass = css({ color: 'accent', textDecoration: 'underline' });

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
          <ul className={css({ listStyle: 'none', fontSize: 'sm' })}>
            <li>
              本家サイト:{' '}
              <a
                href="https://cybozu.co.jp/not-shirokuro/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                白黒つけない会議
              </a>
            </li>
            <li>
              本家YouTubeチャンネル:{' '}
              <a
                href="https://youtube.com/@not_shirokuro"
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                @not_shirokuro
              </a>
            </li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
