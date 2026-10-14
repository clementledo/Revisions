import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Button, Empty, Group, Muted, Row, Screen, Segmented } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { DOCS_KEY, formatSize, importDocs, removeDoc, type Doc } from '@/lib/docs';
import { useAssetUri } from '@/lib/pages';
import { useStored } from '@/lib/store';
import { space, useTheme } from '@/lib/theme';

export default function CheatSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = courseById(id)!;
  const router = useRouter();
  const { p } = useTheme();
  const [tab, setTab] = useState<'claude' | 'mine'>(course.antiseche ? 'claude' : 'mine');
  const { uri } = useAssetUri(course.antiseche);
  const [busy, setBusy] = useState(false);
  const [docs] = useStored<Doc[]>(DOCS_KEY, []);
  const mine = docs.filter((d) => d.course === id && d.kind === 'antiseche');

  const exportPdf = async (share: boolean) => {
    if (!uri) return;
    setBusy(true);
    try {
      const html = await new File(uri).text();
      if (share) {
        const { uri: pdf } = await Print.printToFileAsync({ html, width: 595, height: 842 });
        const named = new File(pdf);
        const dest = new File(named.parentDirectory, `Antiseche-${course.code}.pdf`);
        if (dest.exists) dest.delete();
        named.moveSync(dest);
        await Sharing.shareAsync(dest.uri, { mimeType: 'application/pdf', dialogTitle: `Antisèche ${course.code}` });
      } else {
        await Print.printAsync({ html });
      }
    } catch (e) {
      Alert.alert('Export impossible', String((e as Error)?.message ?? e));
    }
    setBusy(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <View style={{ paddingHorizontal: 18, paddingTop: space.md, paddingBottom: space.sm }}>
        <Segmented
          options={[
            ...(course.antiseche != null ? [{ id: 'claude' as const, label: 'Version Claude', icon: 'auto-fix' as const }] : []),
            { id: 'mine' as const, label: `La mienne${mine.length ? ` (${mine.length})` : ''}`, icon: 'account-edit-outline' as const },
          ]}
          value={tab}
          onChange={setTab}
        />
      </View>

      {tab === 'claude' ? (
        <>
          {uri ? (
            <WebView
              source={{ uri }}
              originWhitelist={['*']}
              allowFileAccess
              allowFileAccessFromFileURLs
              style={{ flex: 1, backgroundColor: p.bg }}
              setBuiltInZoomControls
              setDisplayZoomControls={false}
              scalesPageToFit
            />
          ) : (
            <ActivityIndicator style={{ flex: 1 }} color={p.accent} />
          )}
          <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: 18, paddingTop: space.md, paddingBottom: space.lg, borderTopWidth: 1, borderTopColor: p.line, backgroundColor: p.surface }}>
            <Button style={{ flex: 1 }} kind="soft" color={course.color} icon="printer-outline" label="Imprimer" disabled={busy} onPress={() => exportPdf(false)} />
            <Button style={{ flex: 1 }} icon="share-variant" label="Partager en PDF" color={course.color} disabled={busy} onPress={() => exportPdf(true)} />
          </View>
        </>
      ) : (
        <Screen>
          {mine.length ? (
            <Group>
              {mine.map((d) => (
                <Row
                  key={d.id}
                  icon={d.mime.startsWith('image/') ? 'image-outline' : 'file-pdf-box'}
                  color={course.color}
                  title={d.name}
                  sub={formatSize(d.size)}
                  onPress={() => router.push(`/pdf?id=${d.id}`)}
                  right={
                    <Button
                      kind="ghost"
                      color={p.muted}
                      label="Retirer"
                      onPress={() =>
                        Alert.alert('Retirer ce fichier ?', d.name, [
                          { text: 'Annuler', style: 'cancel' },
                          { text: 'Retirer', style: 'destructive', onPress: () => removeDoc(d.id) },
                        ])
                      }
                      style={{ paddingVertical: 6, paddingHorizontal: 10 }}
                    />
                  }
                />
              ))}
            </Group>
          ) : (
            <Empty icon="file-document-edit-outline" title="Ta propre antisèche" sub="Ajoute ta feuille en PDF ou en photo (recto et verso) depuis ton téléphone ou ton Drive." />
          )}
          <Button
            label="Ajouter mon antisèche"
            icon="plus"
            size="lg"
            color={course.color}
            onPress={() => importDocs({ course: id, kind: 'antiseche', images: true })}
          />
          <Muted style={{ textAlign: 'center' }}>Tu peux aussi me l’envoyer dans le fil : je l’intègre dans l’app.</Muted>
        </Screen>
      )}
    </View>
  );
}
