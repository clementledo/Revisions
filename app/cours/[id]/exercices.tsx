import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, H2, Icon, Muted, Row, Screen } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { useStored } from '@/lib/store';
import { quizChapterOf, quizKey, recordAnswer, type QuizMap } from '@/lib/study';
import { makeStyles, radius, space, useTheme } from '@/lib/theme';

/** Exercices à réponse libre : on réfléchit, on dévoile la correction, on s'auto-évalue. */
export default function Exercises() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = courseById(id)!;
  const router = useRouter();
  const { p } = useTheme();
  const s = useStyles();
  const [past] = useStored<QuizMap>(quizKey(id), {});
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const exercises = course.questions.map((q, i) => ({ q, i })).filter(({ q }) => q.t === 'ex');
  const lessons = course.lessons.map((l) => course.chapters.find((c) => c.id === l)!);

  return (
    <Screen>
      <Muted>Réfléchis (ou écris ta réponse sur papier), puis dévoile la correction et dis-moi si tu avais bon.</Muted>

      {lessons.map((ch) => {
        const list = exercises.filter(({ q }) => quizChapterOf(course, q) === ch.id);
        if (!list.length && !ch.examples) return null;
        return (
          <View key={ch.id} style={{ gap: space.md }}>
            <H2>{ch.eyebrow}</H2>
            {ch.examples > 0 && (
              <Card style={{ paddingVertical: 2 }}>
                <Row
                  icon="book-open-variant"
                  color={course.color}
                  title="Exemples détaillés du cours"
                  sub={`${ch.examples} exemples avec calculs pas à pas`}
                  onPress={() => router.push(`/cours/${id}/lire?ch=${ch.id}&mode=examples`)}
                />
              </Card>
            )}
            {list.map(({ q, i }) => {
              const r = past[i];
              const shown = open[i];
              return (
                <Card key={i} style={{ gap: space.md }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                    <Text style={s.q}>{q.q}</Text>
                    {r && <Icon name={r.ok ? 'check-circle' : 'alert-circle'} size={20} color={r.ok ? p.good : p.warn} />}
                  </View>
                  {shown ? (
                    <>
                      <View style={[s.sol, { borderLeftColor: course.color }]}>
                        <Text style={s.solTitle}>Correction</Text>
                        <Text style={s.solText}>{q.e}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: space.sm }}>
                        <Button
                          style={{ flex: 1 }}
                          kind="soft"
                          icon="check"
                          label="Je savais"
                          color={p.good}
                          onPress={() => {
                            recordAnswer(id, i, true);
                            setOpen({ ...open, [i]: false });
                          }}
                        />
                        <Button
                          style={{ flex: 1 }}
                          kind="soft"
                          icon="refresh"
                          label="À retravailler"
                          onPress={() => {
                            recordAnswer(id, i, false);
                            setOpen({ ...open, [i]: false });
                          }}
                        />
                      </View>
                    </>
                  ) : (
                    <Button kind="ghost" color={course.color} label="Voir la correction" icon="eye-outline" onPress={() => setOpen({ ...open, [i]: true })} />
                  )}
                </Card>
              );
            })}
          </View>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  q: { flex: 1, fontFamily: 'Inter', fontSize: 16.5, fontWeight: '600', color: p.text, lineHeight: 24 },
  sol: { borderLeftWidth: 3, paddingLeft: 12, gap: 4, backgroundColor: p.surface2, borderRadius: radius.sm, padding: 12 },
  solTitle: { fontFamily: 'Inter', fontSize: 12, fontWeight: '800', color: p.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
  solText: { fontFamily: 'Inter', fontSize: 15, color: p.text, lineHeight: 23 },
}));
