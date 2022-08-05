import { useCallback, useState } from 'react';

export type CookieOptionsType = Partial<{
  expires: number;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  maxAge: number;
  sameSite: string;
}>;

export default function useCookie<T = any>(
  key: string,
  defaultValue?: any,
): [T, (value: T, options?: CookieOptionsType) => void, () => void] {
  const [value, setValue] = useState(() => {
    const match = document.cookie.match(`(^|;) ?${key}=([^;]*)(;|$)`);
    let _value = match ? match[2] : defaultValue;

    try {
      if (typeof _value === 'undefined') return undefined as unknown as T;
      _value = JSON.parse(_value);
    } catch (err) {
      console.error(err);
    }
    return _value as T;
  });

  const setCookie = useCallback(
    (data: any, options?: CookieOptionsType) => {
      let stringifyData = data;
      const cookieOptions = {
        expires: 0,
        domain: '',
        path: '',
        secure: false,
        httpOnly: false,
        maxAge: 0,
        sameSite: '',
        ...options,
      };

      if (
        Array.isArray(stringifyData) ||
        Object.prototype.toString.call(stringifyData) === '[object Object]'
      ) {
        stringifyData = JSON.stringify(data);
      }

      setValue(stringifyData);

      let cookie = `${key}=${stringifyData}`;

      if (cookieOptions.expires) {
        const date: Date = new Date();
        date.setTime(date.getTime() + 1000 * cookieOptions.expires);
        cookie = `${cookie}; Expires=${date.toUTCString()}`;
      }

      if (cookieOptions.path) {
        cookie = `${cookie}; Path=${cookieOptions.path}`;
      }

      if (cookieOptions.domain) {
        cookie = `${cookie}; Domain=${cookieOptions.domain}`;
      }

      if (cookieOptions.maxAge) {
        cookie = `${cookie}; Max-Age=${cookieOptions.maxAge}`;
      }

      if (cookieOptions.sameSite) {
        cookie = `${cookie}; SameSite=${cookieOptions.sameSite}`;
      }

      if (cookieOptions.secure) {
        cookie = `${cookie}; Secure`;
      }

      if (cookieOptions.httpOnly) {
        cookie = `${cookie}; HttpOnly`;
      }
      document.cookie = cookie;
    },
    [key],
  );

  const clearCookie = () => {
    setCookie('', { expires: -3600 });
    setValue(defaultValue);
  };

  return [value, setCookie, clearCookie];
}
