import { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Empty } from '@/components/ui';
import { PAGE_AFTER, pagePrelude, useAssetUri, type PageOptions } from '@/lib/pages';
import { useStored } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export type PageMessage =
  | { type: 'ready' }
  | { type: 'end' }
  | { type: 'scroll'; ratio: number }
  | { type: 'nav'; chapter: string; anchor: string }
  | { type: 'examples'; count: number };

/** Page de révision d'origine, affichée chapitre par chapitre aux couleurs de l'app. */
export function PageView({
  page,
  options,
  onMessage,
}: {
  page: number;
  options: PageOptions;
  onMessage?: (m: PageMessage) => void;
}) {
  const { p } = useTheme();
  const [fontScale] = useStored('fontScale', 1);
  const { uri, error } = useAssetUri(page);
  const ref = useRef<WebView>(null);

  if (error) return <Empty icon="alert-circle-outline" title="Page introuvable" sub={error} />;
  if (!uri)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: p.bg }}>
        <ActivityIndicator color={p.accent} />
      </View>
    );

  const handle = (e: WebViewMessageEvent) => {
    try {
      onMessage?.(JSON.parse(e.nativeEvent.data));
    } catch {}
  };

  return (
    <WebView
      ref={ref}
      key={`${p.bg}-${fontScale}-${options.chapter}-${options.mode}-${options.anchor}-${options.find}`}
      source={{ uri }}
      originWhitelist={['*']}
      allowFileAccess
      allowFileAccessFromFileURLs
      allowingReadAccessToURL={uri}
      injectedJavaScriptBeforeContentLoaded={pagePrelude(p, { ...options, fontScale })}
      injectedJavaScript={PAGE_AFTER}
      onMessage={handle}
      style={{ flex: 1, backgroundColor: p.bg }}
      containerStyle={{ backgroundColor: p.bg }}
      setSupportMultipleWindows={false}
      textZoom={100}
      overScrollMode="never"
    />
  );
}
