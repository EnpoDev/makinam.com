import { useEffect } from 'react';

export function useDocumentTitle(title: string, prevailOnUnmount: boolean = false) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title}` : 'makinam.com - Türkiye\'nin Makine Pazarı';

    return () => {
      if (!prevailOnUnmount) {
        document.title = prevTitle;
      }
    };
  }, [title, prevailOnUnmount]);
}
