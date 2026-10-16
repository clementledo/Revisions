import { Alert, Image, Text, View } from 'react-native';

import { UpdateBanner } from '@/components/UpdateBanner';
import { Group, Icon, Press, Row, Screen, Section, Segmented } from '@/components/ui';
import { clearAll, read, useStored, write } from '@/lib/store';
import { DARK_THEMES, LIGHT_THEMES, THEMES, makeStyles, radius, shadow, space, type, useTheme, type ThemeId, type ThemeMode } from '@/lib/theme';
import { currentVersion } from '@/lib/update';

const SIZES = [
  { id: 0.9, label: 'Petit' },
  { id: 1, label: 'Normal' },
  { id: 1.12, label: 'Grand' },
  { id: 1.25, label: 'Très grand' },
];

const MODES: { id: ThemeMode; label: string; icon: 'white-balance-sunny' | 'weather-night' | 'theme-light-dark' }[] = [
  { id: 'light', label: 'Clair', icon: 'white-balance-sunny' },
  { id: 'dark', label: 'Sombre', icon: 'weather-night' },
  { id: 'auto', label: 'Auto', icon: 'theme-light-dark' },
];

export default function Settings() {
  const { p, mode, lightId, darkId, setTheme, setMode } = useTheme();
  const s = useStyles();
  const [fontScale, setFontScale] = useStored('fontScale', 1);

  return (
    <Screen>
      <UpdateBanner />

      <Section title="Apparence">
        <Segmented options={MODES} value={mode} onChange={setMode} />
        {mode === 'auto' && <Text style={s.hint}>Suit le réglage clair ou sombre du téléphone.</Text>}
      </Section>

      <Section title="Thèmes clairs">
        <Swatches ids={LIGHT_THEMES} selected={lightId} on={mode !== 'dark'} />
      </Section>

      <Section title="Thèmes sombres">
        <Swatches ids={DARK_THEMES} selected={darkId} on={mode !== 'light'} />
      </Section>

      <Section title="Taille du texte des cours">
        <Segmented options={SIZES} value={fontScale} onChange={setFontScale} />
      </Section>

      <Section title="Données">
        <Group>
          <Row
            icon="cellphone-check"
            color={p.good}
            title="Enregistré sur le téléphone"
            sub="Cartes, QCM et chapitres lus. Les slides importées restent aussi sur ton Drive."
          />
          <Row
            icon="restore"
            color={p.bad}
            title="Remettre la progression à zéro"
            onPress={() =>
              Alert.alert('Tout remettre à zéro ?', 'Cartes, QCM, chapitres lus et série seront effacés. Les documents importés et le thème restent.', [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Effacer',
                  style: 'destructive',
                  onPress: () => {
                    const keep = ['docs', 'theme', 'themeDark', 'themeMode', 'fontScale'];
                    const saved = keep.map((k) => [k, read<unknown>(k, null)] as const);
                    clearAll();
                    saved.forEach(([k, v]) => v != null && write(k, v));
                  },
                },
              ])
            }
          />
        </Group>
      </Section>

      <View style={s.about}>
        <Image source={require('@/assets/images/splash-icon.png')} style={s.logo} />
        <Text style={s.aboutTitle}>Révisions</Text>
        <Text style={s.hint}>Version {currentVersion()} · faite pour l’ETS</Text>
      </View>
    </Screen>
  );

  function Swatches({ ids, selected, on }: { ids: ThemeId[]; selected: ThemeId; on: boolean }) {
    return (
      <View style={s.grid}>
        {ids.map((t) => {
          const th = THEMES[t].palette;
          const sel = t === selected;
          return (
            <Press
              key={t}
              onPress={() => setTheme(t)}
              style={[s.theme, shadow(p), { borderColor: sel ? (on ? p.accent : p.muted) : p.dark ? p.line : 'transparent' }]}>
              <View style={[s.preview, { backgroundColor: th.bg }]}>
                <View style={[s.previewHero, { backgroundColor: th.hero[0] }]}>
                  <View style={[s.previewDot, { backgroundColor: 'rgba(255,255,255,0.85)' }]} />
                  <View style={[s.previewLine, { backgroundColor: 'rgba(255,255,255,0.55)', width: '60%' }]} />
                </View>
                <View style={[s.previewCard, { backgroundColor: th.surface, borderColor: th.line }]}>
                  <View style={[s.previewDot, { backgroundColor: th.accent }]} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={[s.previewLine, { backgroundColor: th.text, opacity: 0.75, width: '80%' }]} />
                    <View style={[s.previewLine, { backgroundColor: th.muted, opacity: 0.5, width: '55%' }]} />
                  </View>
                </View>
              </View>
              <View style={s.themeFoot}>
                <Text style={[s.themeName, sel && { color: p.text }]} numberOfLines={1}>
                  {THEMES[t].name}
                </Text>
                {sel && <Icon name="check-circle" size={16} color={on ? p.accent : p.muted} />}
              </View>
            </Press>
          );
        })}
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  hint: { ...type.caption, color: p.muted, paddingHorizontal: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  theme: {
    width: '31.3%',
    backgroundColor: p.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: 5,
    gap: 6,
  },
  preview: { borderRadius: radius.md - 2, padding: 6, gap: 5, overflow: 'hidden' },
  previewHero: { borderRadius: 7, height: 26, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewCard: { borderRadius: 7, borderWidth: 1, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewDot: { width: 10, height: 10, borderRadius: 5 },
  previewLine: { height: 4, borderRadius: 2 },
  themeFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingBottom: 3, gap: 4 },
  themeName: { fontFamily: 'Inter', fontSize: 13, fontWeight: '700', color: p.text2, flexShrink: 1 },
  about: { alignItems: 'center', gap: 6, marginTop: space.lg },
  logo: { width: 52, height: 52 },
  aboutTitle: { ...type.headline, color: p.text },
}));
