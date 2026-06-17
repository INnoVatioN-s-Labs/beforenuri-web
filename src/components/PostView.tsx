import { Panel } from '@/components/ui/panel';
import type { PostDetail } from '@/types';

type PostViewProps = {
  post: PostDetail | null;
};

/** 게시글 상세 화면. */
export function PostView({ post }: PostViewProps) {
  if (!post) {
    return <div className="mt-4 text-center text-terminal-dim">글을 불러오는 중...</div>;
  }
  return (
    <div className="flex flex-grow flex-col">
      <Panel className="flex-grow p-4">
        <h2 className="mb-1 mt-0 text-[1.2em] text-terminal-accent">{post.title}</h2>
        <div className="mb-3 text-[0.9em] text-terminal-dim">
          [{post.authorName}]{post.parentId ? ' · 답글' : ''}
        </div>
        <div className="whitespace-pre-wrap text-terminal-text">{post.content}</div>
      </Panel>
      <div className="mt-3 text-center text-terminal-dim">W: 답글 쓰기 · P: 목록 · TOP: 초기화면</div>
    </div>
  );
}
