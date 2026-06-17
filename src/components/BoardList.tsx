import { Panel } from '@/components/ui/panel';
import type { PostListItem } from '@/types';

type BoardListProps = {
  posts: PostListItem[];
};

/** 자유게시판 목록. 답글은 depth만큼 들여쓰고 'ㄴ' 기호로 트리를 표현한다. */
export function BoardList({ posts }: BoardListProps) {
  return (
    <div className="flex flex-grow flex-col">
      <h2 className="mb-3 mt-0 text-[1.2em] text-terminal-accent">자유게시판</h2>
      <Panel className="flex-grow p-4">
        {posts.length === 0 ? (
          <div className="text-terminal-dim">아직 글이 없습니다. K를 입력해 새 글을 써보세요.</div>
        ) : (
          <div className="flex flex-col gap-1">
            {posts.map((post, i) => (
              <div key={post.id} className="whitespace-pre-wrap">
                <span className="text-terminal-dim">{String(i + 1).padStart(2, ' ')}. </span>
                {post.depth > 0 && (
                  <span className="text-terminal-dim">{'  '.repeat(post.depth)}ㄴ</span>
                )}
                <span className="text-terminal-text">{post.title}</span>
                <span className="text-terminal-dim"> [{post.authorName}]</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <div className="mt-3 text-center text-terminal-dim">번호: 글 읽기 · K: 새 글 · P: 이전 화면</div>
    </div>
  );
}
