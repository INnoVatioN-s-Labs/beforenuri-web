/** ASCII 80컬럼 점선 구분선. */
export function Separator() {
  return (
    <div className="my-5 overflow-hidden whitespace-nowrap text-center text-terminal-line">
      {'-'.repeat(80)}
    </div>
  );
}
