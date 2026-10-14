import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, Group, Muted, Pill, Row, Screen, Section } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { useStored } from '@/lib/store';
import { quizChapterOf, quizKey, recordAnswer, type QuizMap } from '@/lib/study';
import { makeStyles, radius, space, tone, type, useTheme } from '@/lib/theme';

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
      <Muted style={{ paddingHorizontal: 2 }}>Réfléchis (ou écris ta réponse sur papier), puis dévoile la correction et dis-moi si tu avais bon.</Muted>

      {lessons.map((ch) => {
        const list = exercises.filter(({ q }) => quizChapterOf(course, q) === ch.id);
        if (!list.length && !ch.examples) return null;
        return (
          <Section key={ch.id} title={`${ch.eyebrow} · ${ch.title}`}>
            {ch.examples > 0 && (
              <Group>
                <Row
                  icon="book-open-variant"
                  color={course.color}
                  title="Exemples détaillés du cours"
                  sub={`${ch.examples} exemples avec calculs pas à pas`}
                  onPress={() => router.push(`/cours/${id}/lire?ch=${ch.id}&mode=examples`)}
                />
              </Group>
            )}
            {list.map(({ q, i }) => {
              const r = past[i];
              const shown = open[i];
              return (
                <Card key={i} style={{ gap: space.md }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Pill label={`Exercice ${list.findIndex((x) => x.i === i) + 1}`} color={course.color} />
                    <View style={{ flex: 1 }} />
                    {r && <Pill label={r.ok ? 'Su' : 'À retravailler'} icon={r.ok ? 'check' : 'refresh'} color={r.ok ? p.good : p.warn} />}
                  </View>
                  <Text style={s.q}>{q.q}</Text>
                  {shown ? (
                    <>
                      <View style={[s.sol, { borderLeftColor: tone(course.color, p) }]}>
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
                          color={p.warn}
                          onPress={() => {
                            recordAnswer(id, i, false);
                            setOpen({ ...open, [i]: false });
                          }}
                        />
                      </View>
                    </>
                  ) : (
                    <Button kind="soft" color={course.color} label="Voir la correction" icon="eye-outline" onPress={() => setOpen({ ...open, [i]: true })} />
                  )}
                </Card>
              );
            })}
          </Section>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((p) => ({
  q: { ...type.bodyStrong, fontSize: 16.5, lineHeight: 24, color: p.text },
  sol: { borderLeftWidth: 3, gap: 6, backgroundColor: p.surface2, borderRadius: radius.sm, padding: 14 },
  solTitle: { ...type.overline, fontSize: 11, color: p.muted },
  solText: { fontFamily: 'Inter', fontSize: 15, color: p.text, lineHeight: 23 },
}));
