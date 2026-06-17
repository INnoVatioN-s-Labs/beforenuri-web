import { Panel } from '@/components/ui/panel';

export type PanelKey = 'notice' | 'sysop' | 'config' | 'help' | 'preparing';

const PANELS: Record<PanelKey, { title: string; lines: string[] }> = {
  notice: {
    title: '공지사항',
    lines: [
      '1. 나우누리 가상 체험관에 오신 것을 환영합니다.',
      '2. 본 서비스는 1990년대 PC통신을 재현한 토이 프로젝트입니다.',
      '3. 현재 14번 대화실이 실시간으로 운영 중입니다.',
    ],
  },
  sysop: {
    title: '시삽 소개',
    lines: [
      'SYSOP : INnoVatioN',
      '운영 시간 : 24시간 (무인 자동 운영)',
      '문의 : 대화실에서 말을 걸어주세요.',
    ],
  },
  config: {
    title: '환경설정',
    lines: [
      '화면 색상 : 청색 단말기 모드 (고정)',
      '입력 방식 : 키보드 명령어 / 번호 선택',
      '글꼴 : 고정폭(monospace)',
    ],
  },
  help: {
    title: '도움말',
    lines: [
      '· 숫자(1~16) : 해당 메뉴로 이동',
      '· GO CHAT / 14 : 대화실 입장',
      '· GO NOTICE / 1 : 공지사항',
      '· H : 도움말,  X / TOP : 초기 화면',
      '· 대화실에서 /나가기 또는 X : 퇴장',
    ],
  },
  preparing: {
    title: '준비 중',
    lines: [
      '아직 준비 중인 서비스입니다.',
      '현재는 14번 대화실을 이용하실 수 있습니다.',
    ],
  },
};

/** 메인 화면에서 선택된 메뉴/도움말 내용을 보여주는 출력 패널. */
export function InfoPanel({ panel }: { panel: PanelKey }) {
  const content = PANELS[panel];
  return (
    <Panel className="mt-4 p-4">
      <h2 className="mb-2 mt-0 text-[1.1em] text-terminal-accent">{content.title}</h2>
      <div className="flex flex-col gap-1 whitespace-pre-wrap text-terminal-text">
        {content.lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </Panel>
  );
}
