import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { Group, Muted, Row, Screen } from '@/components/ui';
import { courseById } from '@/lib/courses';

/** Liste des récaps ou des calculateurs d'un cours, chapitre par chapitre. */
export default function List() {
  const { id, kind } = useLocalSearchParams<{ id: string; kind: 'recap' | 'calc' | 'traps' }>();
  const course = courseById(id)!;
  const router = useRouter();
  const lessons = course.lessons.map((l) => course.chapters.find((c) => c.id === l)!);

  if (kind === 'calc') {
    const items = lessons.flatMap((ch) => ch.widgets.map((w) => ({ ch, w })));
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Calculateurs' }} />
        <Group>
          {items.map(({ ch, w }) => (
            <Row
              key={w.id}
              icon="calculator-variant-outline"
             
              title={w.title}
              sub={ch.eyebrow + ' · ' + ch.title}
              onPress={() => router.push(`/cours/${id}/lire?ch=${ch.id}&anchor=${w.id}`)}
            />
          ))}
        </Group>
      </Screen>
    );
  }

  if (kind === 'traps') {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Pièges d’examen' }} />
        <Group>
          {lessons
            .filter((ch) => ch.traps)
            .map((ch) => (
              <Row
                key={ch.id}
                icon="alert-outline"
                color="#d9534f"
                title={ch.title}
                sub={`${ch.eyebrow}${ch.hot ? ' · ★ signalé par le prof' : ''} · ${ch.traps} piège${ch.traps > 1 ? 's' : ''}`}
                onPress={() => router.push(`/cours/${id}/lire?ch=${ch.id}&mode=traps`)}
              />
            ))}
        </Group>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Récaps' }} />
      <Group>
        {lessons
          .filter((ch) => ch.hasRecap)
          .map((ch) => (
            <Row
              key={ch.id}
              icon="star-four-points-outline"
             
              title={ch.title}
              sub={ch.eyebrow}
              onPress={() => router.push(`/cours/${id}/lire?ch=${ch.id}&mode=recap`)}
            />
          ))}
      </Group>
    </Screen>
  );
}
