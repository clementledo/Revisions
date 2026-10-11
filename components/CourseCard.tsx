import { Text, View } from 'react-native';

import { Bar, Card, Icon } from '@/components/ui';
import { courseProgress } from '@/lib/study';
import { makeStyles, space, useTheme } from '@/lib/theme';
import type { Course } from '@/lib/types';

/** Carte d'un cours sur l'accueil : sigle, titre, lecture et maîtrise. */
export function CourseCard({ course, onPress, due }: { course: Course; onPress: () => void; due: number }) {
  const { p } = useTheme();
  const s = useStyles();
  const empty = !course.lessons.length;
  const prog = courseProgress(course);
  return (
    <Card onPress={onPress} style={{ padding: 0, overflow: 'hidden' }}>
      <View style={[s.top, { backgroundColor: course.color }]}>
        <Text style={s.code}>{course.code}</Text>
        {due > 0 && (
          <View style={s.due}>
            <Icon name="cards-outline" size={14} color={course.color} />
            <Text style={[s.dueText, { color: course.color }]}>{due}</Text>
          </View>
        )}
      </View>
      <View style={s.body}>
        <Text style={s.title}>{course.title}</Text>
        <Text style={s.sub}>{empty ? 'Contenu à venir : envoie ta page et tes slides' : `${course.lessons.length} chapitres · ${course.cards.length} cartes · ${course.questions.length} questions`}</Text>
        {!empty && (
          <View style={s.bars}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.barLabel}>Lu {Math.round(prog.read * 100)} %</Text>
              <Bar value={prog.read} color={course.color} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={s.barLabel}>Maîtrise {Math.round(prog.level * 100)} %</Text>
              <Bar value={prog.level} color={p.good} />
            </View>
          </View>
        )}
      </View>
    </Card>
  );
}

const useStyles = makeStyles((p) => ({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: 12 },
  code: { fontFamily: 'Inter', fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  due: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 },
  dueText: { fontFamily: 'Inter', fontSize: 13, fontWeight: '800' },
  body: { padding: space.lg, gap: 6 },
  title: { fontFamily: 'Inter', fontSize: 19, fontWeight: '700', color: p.text, letterSpacing: -0.3 },
  sub: { fontFamily: 'Inter', fontSize: 13.5, color: p.muted },
  bars: { flexDirection: 'row', gap: space.lg, marginTop: 8 },
  barLabel: { fontFamily: 'Inter', fontSize: 12, fontWeight: '600', color: p.muted },
}));
