import { useRouter } from 'expo-router';

import { Button, Card, H1, H2, Muted, Row, Screen } from '@/components/ui';
import { COURSES } from '@/lib/courses';
import { useStoreVersion } from '@/lib/store';
import { chapterStats, dueCards } from '@/lib/study';

export default function Review() {
  useStoreVersion();
  const router = useRouter();
  const ready = COURSES.filter((c) => c.lessons.length);
  const totalDue = ready.reduce((a, c) => a + dueCards(c).length, 0);

  return (
    <Screen top>
      <H1>Réviser</H1>
      <Muted>Choisis ta façon de réviser. Les cartes reviennent au bon moment selon ce que tu oublies.</Muted>
      {totalDue > 0 && <Button label={`Cartes du jour (${totalDue})`} icon="cards" onPress={() => router.push('/cartes?course=all')} />}

      {ready.map((c) => {
        const weak = chapterStats(c)
          .filter((s) => s.quizDone > 0 || s.mastered > 0)
          .sort((a, b) => a.level - b.level)[0];
        const ch = weak && c.chapters.find((x) => x.id === weak.id);
        return (
          <Card key={c.id} style={{ paddingVertical: 6 }}>
            <H2>{`${c.code} · ${c.title}`}</H2>
            {ch && (
              <Row
                icon="target"
                color={c.color}
                title={`Point faible : ${ch.eyebrow}`}
                sub={`${ch.title} · ${Math.round(weak.level * 100)} % · QCM ciblé`}
                onPress={() => router.push(`/cours/${c.id}/quiz?ch=${ch.id}`)}
              />
            )}
            <Row icon="cards-outline" color={c.color} title="Cartes mémoire" sub={`${dueCards(c).length} à revoir · ${c.cards.length} au total`} onPress={() => router.push(`/cartes?course=${c.id}`)} />
            <Row icon="format-list-checks" color={c.color} title="QCM" sub="Par chapitre et par type" onPress={() => router.push(`/cours/${c.id}/quiz`)} />
            <Row icon="pencil-box-outline" color={c.color} title="Exercices" sub="Correction et auto-évaluation" onPress={() => router.push(`/cours/${c.id}/exercices`)} />
            <Row icon="star-four-points-outline" color={c.color} title="Récaps" sub="À retenir, pièges, savoir-faire" onPress={() => router.push(`/cours/${c.id}/liste?kind=recap`)} />
            <Row icon="file-document-outline" color={c.color} title="Antisèche" onPress={() => router.push(`/cours/${c.id}/antiseche`)} />
          </Card>
        );
      })}
    </Screen>
  );
}
