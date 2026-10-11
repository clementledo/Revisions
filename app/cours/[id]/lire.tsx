import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { PageView, type PageMessage } from '@/components/PageView';
import { Icon } from '@/components/ui';
import { courseById } from '@/lib/courses';
import type { PageMode } from '@/lib/pages';
import { useStored } from '@/lib/store';
import { markRead, readKey, type ReadMap } from '@/lib/study';
import { useTheme } from '@/lib/theme';

const TITLES: Record<string, string> = { recap: 'Récap', examples: 'Exemples' };

export default function Read() {
  const { id, ch, mode = 'chapter', anchor, find } = useLocalSearchParams<{ id: string; ch: string; mode?: PageMode; anchor?: string; find?: string }>();
  const course = courseById(id)!;
  const chapter = course.chapters.find((c) => c.id === ch);
  const router = useRouter();
  const { p } = useTheme();
  const [readMap] = useStored<ReadMap>(readKey(id), {});
  const isLesson = course.lessons.includes(ch);
  const done = !!readMap[ch];

  const onMessage = (m: PageMessage) => {
    if (m.type === 'end' && mode === 'chapter' && isLesson && !done) markRead(id, ch, true);
    if (m.type === 'nav') router.setParams({ ch: m.chapter, anchor: m.anchor, mode: 'chapter', find: undefined });
  };

  const title = TITLES[mode] ? `${TITLES[mode]} · ${chapter?.eyebrow ?? ''}` : (chapter?.eyebrow ?? '');
  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <Stack.Screen
        options={{
          title: ch === 'formules' ? 'Aide-mémoire' : title,
          headerRight: () =>
            isLesson && mode === 'chapter' ? (
              <Pressable onPress={() => markRead(id, ch, !done)} hitSlop={10}>
                <Icon name={done ? 'check-circle' : 'check-circle-outline'} size={26} color={done ? p.good : p.muted} />
              </Pressable>
            ) : null,
        }}
      />
      {course.page != null && <PageView page={course.page} options={{ mode, chapter: ch, anchor, find }} onMessage={onMessage} />}
    </View>
  );
}
