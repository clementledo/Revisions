import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Empty } from '@/components/ui';
import { allDocs } from '@/lib/docs';
import { useAssetUri } from '@/lib/pages';
import { read, write } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const VIEWER = require('@/assets/viewer/pdf.html');

/** Visionneuse de slides (pdf.js) ou d'image, qui reprend à la dernière page lue. */
export default function PdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const doc = allDocs().find((d) => d.id === id);
  const { p } = useTheme();
  const { uri: viewer } = useAssetUri(VIEWER);
  const posKey = `pdfpos:${id}`;
  const [page, setPage] = useState(() => read<number>(posKey, 1));
  const [pages, setPages] = useState(0);

  if (!doc) return <Empty icon="file-remove-outline" title="Fichier introuvable" />;

  const isImage = doc.mime.startsWith('image/');
  const header = (
    <Stack.Screen
      options={{
        title: doc.name,
        headerRight: () => (pages ? <Text style={{ fontFamily: 'Inter', color: p.muted, fontWeight: '600' }}>{page} / {pages}</Text> : null),
      }}
    />
  );

  if (isImage) {
    return (
      <View style={{ flex: 1, backgroundColor: p.bg }}>
        {header}
        <WebView
          source={{ html: `<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=6"><body style="margin:0;background:${p.bg}"><img src="${doc.uri}" style="width:100%;display:block"></body>`, baseUrl: doc.uri }}
          originWhitelist={['*']}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          style={{ flex: 1, backgroundColor: p.bg }}
        />
      </View>
    );
  }

  if (!viewer) return <ActivityIndicator style={{ flex: 1, backgroundColor: p.bg }} color={p.accent} />;

  const config = `window.__PDF=${JSON.stringify({ uri: doc.uri, page: read<number>(posKey, 1), bg: p.dark ? p.bg : p.surface2, muted: p.muted })};true;`;
  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      {header}
      <WebView
        source={{ uri: viewer }}
        originWhitelist={['*']}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        injectedJavaScriptBeforeContentLoaded={config}
        onMessage={(e) => {
          try {
            const m = JSON.parse(e.nativeEvent.data);
            if (m.type === 'loaded') setPages(m.pages);
            if (m.type === 'page') {
              setPage(m.page);
              write(posKey, m.page);
            }
          } catch {}
        }}
        style={{ flex: 1, backgroundColor: p.bg }}
        setBuiltInZoomControls
        setDisplayZoomControls={false}
      />
    </View>
  );
}
