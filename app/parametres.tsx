import { Alert, Image, Text, View } from 'react-native';

import { UpdateBanner } from '@/components/UpdateBanner';
import { Group, Icon, Press, Row, Screen, Section, Segmented } from '@/components/ui';
import { clearAll, read, useStored, write } from '@/lib/store';
import { THEME_CHOICES, THEMES, makeStyles, space, type, useTheme } from '@/lib/theme';
import { currentVersion } from '@/lib/update';

const SIZES = [
  { id: 0.9, label: 'Petit' },
  { id: 1, label: 'Normal' },
  { id: 1.12, label: 'Grand' },
  { id: 1.25, label: 'Très grand' },
];

export default function Settings() {
  const { p, choice, setChoice } = useTheme();
  const s = useStyles();
  const [fontScale, setFontScale] = useStored('fontScale', 1);

  return (
    <Screen>
      <UpdateBanner />

      <Section title="Thème">
        <Group inset={60}>
          {THEME_CHOICES.map((t) => {
            const th = t === 'auto' ? null : THEMES[t].palette;
            return (
              <Row
                key={t}
                title={t === 'auto' ? 'Automatique' : THEMES[t].name}
                sub={t === 'auto' ? 'Blanc ou Sombre, selon le téléphone' : undefined}
                onPress={() => setChoice(t)}
                leading={
                  <View style={[s.swatch, { backgroundColor: th?.bg ?? p.bg, borderColor: p.line }]}>
                    {th ? <View style={[s.swatchDot, { backgroundColor: th.accent }]} /> : <Icon name="theme-light-dark" size={18} color={p.accent} />}
                  </View>
                }
                right={choice === t ? <Icon name="check" size={22} color={p.accent} /> : <View style={{ width: 22 }} />}
              />
            );
          })}
        </Group>
      </Section>

      <Section title="Taille du texte des cours">
        <Segmented options={SIZES} value={fontScale} onChange={setFontScale} />
      </Section>

      <Section title="Données">
        <Group>
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
                    const keep = ['docs', 'appTheme', 'fontScale'];
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
        <Text style={s.hint}>Version {currentVersion()}</Text>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  hint: { ...type.caption, color: p.muted, paddingHorizontal: 2 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swatchDot: { width: 12, height: 12, borderRadius: 6 },
  about: { alignItems: 'center', gap: 6, marginTop: space.lg },
  logo: { width: 52, height: 52 },
  aboutTitle: { ...type.headline, color: p.text },
}));
