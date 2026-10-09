/** A shell prompt line: `guest@idlemullet:~/games$ <command>`, optionally ending in a blinking cursor. */
export function Prompt({ path = '~/games', command, cursor = false }: { path?: string; command?: string; cursor?: boolean }) {
  return <div className="prompt">
    <span className="prompt-user">guest@idlemullet</span>:<span className="prompt-path">{path}</span>$ {command && <span className="prompt-cmd">{command}</span>}
    {cursor && <span className="cursor" aria-hidden="true" />}
  </div>;
}
