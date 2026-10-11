import { Alert, Pressable, Text, View } from 'react-native';

import { UpdateBanner } from '@/components/UpdateBanner';
import { Button, Card, Chip, H2, Icon, Muted, Screen } from '@/components/ui';
import { clearAll, read, useStored, write } from '@/lib/store';
import { THEMES, makeStyles, radius, space, useTheme, type ThemeId } from '@/lib/theme';
import { currentVersion } from '@/lib/update';

const SIZES = [
  { v: 0.9, l: 'Petit' },
  { v: 1, l: 'Normal' },
  { v: 1.12, l: 'Grand' },
  { v: 1.25, l: 'Très grand' },
];

export default function Settings() {
  const { id, p, set } = useTheme();
  const s = useStyles();
  const [fontScale, setFontScale] = useStored('fontScale', 1);

  return (
    <Screen>
      <UpdateBanner />
      <H2>Thème</H2>
      <View style={s.themes}>
        {(Object.keys(THEMES) as ThemeId[]).map((t) => {
          const th = THEMES[t].palette;
          return (
            <Pressable key={t} onPress={() => set(t)} style={[s.theme, { backgroundColor: th.bg, borderColor: id === t ? p.accent : p.line }]}>
              <View style={[s.swatchCard, { backgroundColor: th.surface, borderColor: th.line }]}>
                <View style={[s.swatchLine, { backgroundColor: th.accent, width: '55%' }]} />
                <View style={[s.swatchLine, { backgroundColor: th.muted, opacity: 0.5 }]} />
                <View style={[s.swatchLine, { backgroundColor: th.muted, opacity: 0.3, width: '70%' }]} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[s.themeName, { color: th.text }]}>{THEMES[t].name}</Text>
                {id === t && <Icon name="check-circle" size={15} color={th.accent} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <H2>Taille du texte des cours</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {SIZES.map((x) => (
          <Chip key={x.v} label={x.l} active={fontScale === x.v} onPress={() => setFontScale(x.v)} />
        ))}
      </View>

      <H2>Données</H2>
      <Card>
        <Muted>Ta progression (cartes, QCM, chapitres lus) est enregistrée sur le téléphone. Les slides importées restent aussi sur ton Drive.</Muted>
        <Button
          kind="ghost"
          color={p.bad}
          icon="restore"
          label="Remettre la progression à zéro"
          onPress={() =>
            Alert.alert('Tout remettre à zéro ?', 'Cartes, QCM, chapitres lus et série seront effacés. Les documents importés restent.', [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Effacer',
                style: 'destructive',
                onPress: () => {
                  const keep = ['docs', 'theme', 'fontScale'];
                  const saved = keep.map((k) => [k, read<unknown>(k, null)] as const);
                  clearAll();
                  saved.forEach(([k, v]) => v != null && write(k, v));
                },
              },
            ])
          }
        />
      </Card>

      <Muted style={{ textAlign: 'center', marginTop: space.lg }}>Révisions v{currentVersion()} · fait pour l’ETS</Muted>
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  themes: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  theme: { width: '31.5%', borderWidth: 2, borderRadius: radius.lg, padding: 10, gap: 8 },
  swatchCard: { borderRadius: 8, borderWidth: 1, padding: 8, gap: 5 },
  swatchLine: { height: 5, borderRadius: 3, width: '100%' },
  themeName: { fontFamily: 'Inter', fontSize: 13, fontWeight: '700' },
}));
