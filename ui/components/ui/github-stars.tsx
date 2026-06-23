import { Star } from "lucide-react";
import { GithubIcon } from "./icons";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

export function GithubStars({
  stars = SITE.stars,
  className,
}: {
  stars?: string;
  className?: string;
}) {
  return (
    <a
      href={SITE.repo}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground transition-colors hover:border-border-strong hover:bg-surface-2",
        className,
      )}
    >
      <GithubIcon className="h-4 w-4" />
      <span className="font-medium">Star</span>
      <span className="h-3.5 w-px bg-border" />
      <Star className="h-3.5 w-3.5 text-accent group-hover:fill-accent transition-colors" />
      <span className="font-mono text-[0.78rem] text-muted">{stars}</span>
    </a>
  );
}
