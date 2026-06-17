import { useState, type RefObject } from 'react';
import { getApiUrl } from '@/lib/api';
import type { PostDetail, PostListItem } from '@/types';

export type WriteStage = 'idle' | 'title' | 'content';

type WriteState = {
  stage: WriteStage;
  title: string;
  parentId: string | null;
};

const IDLE: WriteState = { stage: 'idle', title: '', parentId: null };

/** 자유게시판 목록/읽기/글쓰기 상태. 글쓰기는 제목→내용 2단계 입력으로 진행한다. */
export function useBoard(sessionTokenRef: RefObject<string>) {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [currentPost, setCurrentPost] = useState<PostDetail | null>(null);
  const [write, setWrite] = useState<WriteState>(IDLE);

  const fetchPosts = async () => {
    try {
      const res = await fetch(getApiUrl('/api/posts'));
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (err) {
      console.error('게시글 목록 조회 실패', err);
    }
  };

  const openPost = async (id: string) => {
    setCurrentPost(null);
    try {
      const res = await fetch(getApiUrl(`/api/posts/${id}`));
      if (res.ok) {
        setCurrentPost(await res.json());
      }
    } catch (err) {
      console.error('게시글 조회 실패', err);
    }
  };

  const startWrite = (parentId: string | null) => {
    setWrite({ stage: 'title', title: '', parentId });
  };

  const cancelWrite = () => setWrite(IDLE);

  /** 글쓰기 입력 한 단계 처리. 제목 단계면 내용 단계로, 내용 단계면 등록 후 'done'을 반환. */
  const submitWriteInput = async (text: string): Promise<'continue' | 'done'> => {
    if (write.stage === 'title') {
      setWrite((prev) => ({ ...prev, stage: 'content', title: text }));
      return 'continue';
    }
    if (write.stage === 'content') {
      try {
        await fetch(getApiUrl('/api/posts'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            sessionToken: sessionTokenRef.current,
          },
          body: JSON.stringify({ title: write.title, content: text, parentId: write.parentId }),
        });
      } catch (err) {
        console.error('게시글 작성 실패', err);
      }
      setWrite(IDLE);
      await fetchPosts();
      return 'done';
    }
    return 'done';
  };

  return { posts, currentPost, write, fetchPosts, openPost, startWrite, cancelWrite, submitWriteInput };
}
