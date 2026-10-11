import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui';
import { makeStyles, radius, space, useTheme } from '@/lib/theme';
import { checkForUpdate, installUpdate, type Update } from '@/lib/update';

// Une seule vérification par lancement de l'app.
let pending: Promise<Update | null> | null = null;

/** Bandeau « Nouvelle version » : télécharge et installe l'APK d'un toucher. */
export function UpdateBanner() {
  const { p } = useTheme();
  const s = useStyles();
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    pending ??= checkForUpdate().catch(() => null);
    pending.then(setUpdate);
  }, []);

  if (!update || hidden) return null;

  const start = async () => {
    setProgress(0);
    await installUpdate(update, setProgress);
    setProgress(null);
  };

  return (
    <View style={s.banner}>
      <Icon name="download-circle" size={26} color={p.good} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.title}>Nouvelle version {update.version}</Text>
        <Text style={s.sub}>
          {progress === null ? `${Math.round(update.size / 1e6)} Mo, s'installe par-dessus` : `Téléchargement… ${Math.round(progress * 100)} %`}
        </Text>
      </View>
      {progress === null && (
        <>
          <Pressable onPress={() => setHidden(true)} hitSlop={8}>
            <Text style={s.later}>Plus tard</Text>
          </Pressable>
          <Pressable onPress={start} style={({ pressed }) => [s.button, pressed && { opacity: 0.7 }]}>
            <Text style={s.buttonText}>Installer</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const useStyles = makeStyles((p) => ({
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: 14, borderRadius: radius.lg, backgroundColor: p.goodSoft },
  title: { fontFamily: 'Inter', fontSize: 15, fontWeight: '700', color: p.good },
  sub: { fontFamily: 'Inter', fontSize: 13, color: p.muted },
  later: { fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: p.muted },
  button: { backgroundColor: p.good, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.sm },
  buttonText: { fontFamily: 'Inter', fontSize: 14, fontWeight: '700', color: p.onAccent },
}));
