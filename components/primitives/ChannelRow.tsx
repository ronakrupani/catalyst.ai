import type { RankedChannel } from "@/lib/types";
import { formatScore } from "@/lib/format";
import { MonoValue } from "./MonoValue";

export interface ChannelRowProps {
  channel: RankedChannel;
  className?: string;
  style?: React.CSSProperties;
}

export function ChannelRow({ channel, className = "", style }: ChannelRowProps) {
  return (
    <li
      className={`flex min-h-[56px] items-start gap-4 border-t border-border py-2 first:border-t-0 ${className}`}
      style={style}
    >
      <MonoValue size="title" tone="muted" className="w-8 shrink-0 tabular-nums">
        {channel.rank}
      </MonoValue>

      <div className="min-w-0 flex-1">
        <div className="text-body font-medium text-slate-100">{channel.platform}</div>
        <p className="mt-0.5 line-clamp-2 text-body-sm text-slate-300">
          {channel.rationale}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 pt-1">
        <div
          className="h-1 w-[72px] overflow-hidden rounded-xs bg-ink-400"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-xs bg-violet-base"
            style={{ width: `${channel.confidence * 100}%` }}
          />
        </div>
        {/* Numeral always accompanies the bar (rule 2.7.2). */}
        <MonoValue size="body-sm" tone="secondary">
          {formatScore(channel.confidence)}
        </MonoValue>
      </div>
    </li>
  );
}
