import { Panel } from '@/components/ui/panel';
import type { WriteStage } from '@/hooks/useBoard';

type PostWriteProps = {
  stage: WriteStage;
  title: string;
  isReply: boolean;
};

/** 글/답글 작성 화면. 제목 입력 → 내용 입력 2단계로 진행한다. */
export function PostWrite({ stage, title, isReply }: PostWriteProps) {
  if (stage === 'idle') {
    return null;
  }
  return (
    <div className="flex flex-grow flex-col">
      <Panel className="flex-grow p-4">
        <h2 className="mb-3 mt-0 text-[1.2em] text-terminal-accent">{isReply ? '답글 쓰기' : '새 글 쓰기'}</h2>
        <div className="mb-2">
          <span className="text-terminal-dim">제목: </span>
          <span className="text-terminal-text">{title || (stage === 'title' ? '_' : '')}</span>
        </div>
        {stage === 'content' && (
          <div className="text-terminal-dim">아래 입력창에 내용을 입력하고 Enter를 누르면 등록됩니다.</div>
        )}
      </Panel>
      <div className="mt-3 text-center text-terminal-dim">
        {stage === 'title' ? '제목을 입력하고 Enter' : '내용을 입력하고 Enter (등록)'}
      </div>
    </div>
  );
}
