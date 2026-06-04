"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

type ProcessBlock = {
  title: string;
  items: string[];
};

type ProcessGroup = {
  label: string;
  blocks: ProcessBlock[];
};

type ProcessDocumentTreeProps = {
  groups: ProcessGroup[];
  documentCounts?: Record<string, number>;
};

function documentsHref(query: string) {
  return `/documents?q=${encodeURIComponent(query)}`;
}

function countForLabel(documentCounts: Record<string, number>, label: string) {
  const key = label.trim().toLowerCase();
  return documentCounts[key] ?? 0;
}

export function ProcessDocumentTree({ groups, documentCounts = {} }: ProcessDocumentTreeProps) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  function toggle(key: string) {
    setOpenKeys((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  return (
    <div className="space-y-1 px-2 py-2 text-[10px] leading-4 text-ink">
      {groups.map((group) => {
        const groupKey = `group:${group.label}`;
        const groupOpen = openKeys.has(groupKey);
        const groupCount = countForLabel(documentCounts, group.label);

        return (
          <div key={group.label} className="border-b border-[#d5edf8]/70 pb-1 last:border-b-0">
            <button
              type="button"
              className="flex w-full items-center gap-1.5 px-1 py-1 text-left font-bold text-[#2749a0] hover:bg-[#fff4b8]"
              aria-expanded={groupOpen}
              onClick={() => toggle(groupKey)}
            >
              <ChevronRight
                className={`h-3.5 w-3.5 text-[#00a9da] transition-transform ${groupOpen ? "rotate-90" : ""}`}
              />
              <span className="flex-1">{group.label}</span>
              {groupCount > 0 ? (
                <span className="rounded bg-[#fff4b8] px-1.5 text-[9px] font-bold text-[#2749a0]">
                  {groupCount}
                </span>
              ) : null}
            </button>

            {groupOpen ? (
              <div className="ml-4 space-y-1 border-l border-[#c9eaf8] pl-2">
                {group.blocks.map((block) => {
                  const blockKey = `${groupKey}:block:${block.title}`;
                  const blockOpen = openKeys.has(blockKey);
                  const blockCount = countForLabel(documentCounts, block.title);

                  return (
                    <div key={block.title}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-1.5 px-1 py-0.5 text-left font-semibold text-[#17306b] hover:bg-[#eef9fd]"
                        aria-expanded={blockOpen}
                        onClick={() => toggle(blockKey)}
                      >
                        <ChevronRight
                          className={`h-3 w-3 text-[#00a9da] transition-transform ${blockOpen ? "rotate-90" : ""}`}
                        />
                        <span className="flex-1">{block.title}</span>
                        {blockCount > 0 ? (
                          <span className="rounded bg-[#d7f8ff] px-1 text-[9px] font-bold text-[#2749a0]">
                            {blockCount}
                          </span>
                        ) : null}
                      </button>

                      {blockOpen ? (
                        <div className="ml-4 space-y-0.5 border-l border-[#e0f3fb] pl-2">
                          <Link
                            href={documentsHref(block.title)}
                            className="flex items-center justify-between gap-1 px-1 py-0.5 font-medium text-[#2749a0] hover:bg-[#fff4b8]"
                          >
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3 w-3 text-[#ffcd12]" />
                              Tous les documents
                            </span>
                          </Link>
                          {block.items.map((item) => {
                            const itemCount = countForLabel(documentCounts, item);

                            return (
                              <Link
                                key={item}
                                href={documentsHref(item)}
                                className="flex items-center justify-between gap-1 px-1 py-0.5 text-muted hover:bg-[#eef9fd] hover:text-[#00a9da]"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <FileText className="h-3 w-3 text-[#00a9da]" />
                                  {item}
                                </span>
                                {itemCount > 0 ? (
                                  <span className="text-[9px] font-bold text-[#2749a0]">{itemCount}</span>
                                ) : null}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
