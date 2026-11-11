import { Alert } from 'antd';
import { useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { useBootstrapStore } from '../../store/bootstrapStore';
import { ThemeContext } from '../AppComponent/AppComponent';
import { type TurnstileApi, loadTurnstile } from './turnstile';
import './Captcha.css';

export interface CaptchaHandle {
  /** Ask for a new token: one works for a single request */
  reset: () => void;
}

interface CaptchaProps {
  /** The token to send with the request; null while there is none (loading, expired) */
  onToken: (token: string | null) => void;
  ref?: Ref<CaptchaHandle>;
}

/**
 * The captcha widget of the provider the backend names in /bootstrap (`captcha`).
 * Renders nothing when the captcha is off. Most forms use `useCaptcha` instead.
 */
const Captcha = ({ onToken, ref }: CaptchaProps) => {
  const { t, i18n } = useTranslation();
  const { themeName } = useContext(ThemeContext);
  const siteKey = useBootstrapStore((state) => state.config?.captcha?.site_key ?? null);
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api: TurnstileApi; id: string } | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const [failed, setFailed] = useState(false);
  const language = i18n.language;

  useImperativeHandle(ref, () => ({
    reset: () => widget.current?.api.reset(widget.current.id),
  }));

  useEffect(() => {
    if (!siteKey) return;
    let active = true;
    setFailed(false);
    loadTurnstile().then(
      (api) => {
        if (!active || !container.current) return;
        const id = api.render(container.current, {
          sitekey: siteKey,
          language,
          theme: themeName,
          size: 'flexible',
          callback: (token) => {
            setFailed(false);
            onTokenRef.current(token);
          },
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => {
            onTokenRef.current(null);
            setFailed(true);
          },
        });
        widget.current = { api, id };
      },
      () => active && setFailed(true),
    );
    return () => {
      active = false;
      onTokenRef.current(null);
      widget.current?.api.remove(widget.current.id);
      widget.current = null;
    };
  }, [siteKey, language, themeName]);

  if (!siteKey) return null;
  return (
    <div className="captcha">
      <div ref={container} />
      {failed && <Alert type="warning" showIcon message={t('captcha.failed')} />}
    </div>
  );
};

/**
 * Captcha for a form: put `widget` above the submit button, disable the button until
 * `ready`, send `token` with the request and call `reset` after every attempt.
 * With the captcha off the widget is null and `ready` is always true.
 */
export function useCaptcha(): {
  widget: ReactNode;
  token: string | null;
  ready: boolean;
  reset: () => void;
} {
  const required = useBootstrapStore((state) => Boolean(state.config?.captcha));
  const [token, setToken] = useState<string | null>(null);
  const handle = useRef<CaptchaHandle>(null);
  return {
    widget: required ? <Captcha ref={handle} onToken={setToken} /> : null,
    token: required ? token : null,
    ready: !required || token !== null,
    reset: () => {
      setToken(null);
      handle.current?.reset();
    },
  };
}

export default Captcha;
