import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, Chip, Empty, H2, Icon, Muted, Row, Screen } from '@/components/ui';
import { courseById } from '@/lib/courses';
import { DOCS_KEY, editDoc, formatSize, importDocs, removeDoc, type Doc } from '@/lib/docs';
import { useStored } from '@/lib/store';
import { space, useTheme } from '@/lib/theme';

/** Slides du cours : importées du téléphone ou du Drive, rangées par chapitre d'après leur nom. */
export default function Slides() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const course = courseById(id)!;
  const router = useRouter();
  const { p } = useTheme();
  const [docs] = useStored<Doc[]>(DOCS_KEY, []);
  const [editing, setEditing] = useState<string | null>(null);
  const mine = docs.filter((d) => d.course === id && d.kind !== 'antiseche');
  const groups = [
    ...course.lessons.map((l) => ({ id: l as string | undefined, title: course.chapters.find((c) => c.id === l)!.eyebrow })),
    { id: undefined, title: 'Autres documents' },
  ];

  const add = async () => {
    const added = await importDocs({ course: id });
    if (added.length) {
      const placed = added.filter((d) => d.chapter).length;
      Alert.alert(
        `${added.length} fichier${added.length > 1 ? 's' : ''} ajouté${added.length > 1 ? 's' : ''}`,
        placed === added.length
          ? 'Tous rangés dans leur chapitre.'
          : `${placed} rangé${placed > 1 ? 's' : ''} automatiquement. Touche le crayon d'un fichier pour choisir son chapitre.`,
      );
    }
  };

  return (
    <Screen>
      <Muted>
        Choisis tes PDF dans le sélecteur (Google Drive y apparaît). Ils sont copiés dans l’app et rangés d’après leur nom, par exemple «
        {course.code}_Cours3_….pdf ».
      </Muted>
      <Button label="Ajouter des slides" icon="plus" color={course.color} onPress={add} />

      {!mine.length && <Empty icon="presentation" title="Aucune slide pour l'instant" sub="Tu peux en choisir plusieurs d'un coup." />}

      {groups.map((g) => {
        const list = mine.filter((d) => (d.chapter ?? undefined) === g.id);
        if (!list.length) return null;
        return (
          <View key={g.id ?? 'autres'} style={{ gap: space.sm }}>
            <H2>{g.title}</H2>
            <Card style={{ paddingVertical: 2 }}>
              {list.map((d) => (
                <View key={d.id}>
                  <Row
                    icon="file-pdf-box"
                    color={course.color}
                    title={d.name}
                    sub={formatSize(d.size)}
                    onPress={() => router.push(`/pdf?id=${d.id}`)}
                    right={
                      <Pressable hitSlop={10} onPress={() => setEditing(editing === d.id ? null : d.id)}>
                        <Icon name={editing === d.id ? 'close' : 'pencil-outline'} size={20} color={p.muted} />
                      </Pressable>
                    }
                  />
                  {editing === d.id && (
                    <View style={{ gap: space.sm, paddingBottom: space.md }}>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {groups.map((x) => (
                          <Chip
                            key={x.id ?? 'autres'}
                            label={x.id ? x.title.replace('Cours ', 'C').replace(' · partie ', '') : 'Autre'}
                            active={(d.chapter ?? undefined) === x.id}
                            color={course.color}
                            onPress={() => {
                              editDoc(d.id, { chapter: x.id });
                              setEditing(null);
                            }}
                          />
                        ))}
                      </View>
                      <Button
                        kind="ghost"
                        color={p.bad}
                        icon="trash-can-outline"
                        label="Retirer de l'app"
                        onPress={() =>
                          Alert.alert('Retirer ce fichier ?', `${d.name}\nIl reste sur ton Drive.`, [
                            { text: 'Annuler', style: 'cancel' },
                            { text: 'Retirer', style: 'destructive', onPress: () => removeDoc(d.id) },
                          ])
                        }
                      />
                    </View>
                  )}
                </View>
              ))}
            </Card>
          </View>
        );
      })}
    </Screen>
  );
}
