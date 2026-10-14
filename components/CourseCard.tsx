import { Text, View } from 'react-native';

import { Bar, Card, Icon, Ring, RingLabel, type IconName } from '@/components/ui';
import { courseProgress } from '@/lib/study';
import { makeStyles, space, tone, toneSoft, type, useTheme } from '@/lib/theme';
import type { Course } from '@/lib/types';

/** Carte d'un cours sur l'accueil : icône, titre, lecture et maîtrise. */
export function CourseCard({ course, onPress, due }: { course: Course; onPress: () => void; due: number }) {
  const { p } = useTheme();
  const s = useStyles();
  const empty = !course.lessons.length;
  const prog = courseProgress(course);
  const c = tone(course.color, p);
  return (
    <Card onPress={onPress} style={{ gap: 14 }}>
      <View style={s.top}>
        <View style={[s.tile, { backgroundColor: toneSoft(course.color, p) }]}>
          <Icon name={course.icon as IconName} size={24} color={c} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[s.code, { color: c }]}>{course.code}</Text>
          <Text style={s.title} numberOfLines={2}>
            {course.title}
          </Text>
        </View>
        {empty ? (
          <View style={[s.soon, { backgroundColor: p.surface2 }]}>
            <Text style={s.soonText}>Bientôt</Text>
          </View>
        ) : (
          <Ring value={prog.level} size={50} stroke={5} color={c}>
            <RingLabel value={prog.level} size={12} />
          </Ring>
        )}
      </View>
      {empty ? (
        <Text style={s.sub}>Envoie ta page de révision et tes slides dans le fil : le cours apparaîtra ici.</Text>
      ) : (
        <View style={{ gap: 8 }}>
          <View style={s.meta}>
            <Meta icon="book-open-page-variant-outline" text={`${course.lessons.length} chapitres`} />
            <Meta icon="cards-outline" text={due ? `${due} à revoir` : 'Cartes à jour'} strong={due > 0} />
            <Meta icon="format-list-checks" text={`${course.questions.length} questions`} />
          </View>
          <View style={s.readRow}>
            <View style={{ flex: 1 }}>
              <Bar value={prog.read} color={c} height={5} />
            </View>
            <Text style={s.readText}>Lu {Math.round(prog.read * 100)} %</Text>
          </View>
        </View>
      )}
    </Card>
  );

  function Meta({ icon, text, strong }: { icon: IconName; text: string; strong?: boolean }) {
    return (
      <View style={s.metaItem}>
        <Icon name={icon} size={14} color={strong ? c : p.muted} />
        <Text style={[s.metaText, strong && { color: c, fontWeight: '700' }]}>{text}</Text>
      </View>
    );
  }
}

const useStyles = makeStyles((p) => ({
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tile: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  code: { ...type.overline, fontSize: 11 },
  title: { ...type.headline, fontSize: 17, color: p.text },
  sub: { ...type.callout, color: p.muted },
  soon: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  soonText: { fontFamily: 'Inter', fontSize: 12, fontWeight: '700', color: p.muted },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.md, rowGap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...type.caption, color: p.muted },
  readRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  readText: { ...type.caption, fontSize: 11.5, color: p.muted, fontWeight: '600', width: 54, textAlign: 'right' },
}));
