"use client";

import { CollectorTopbar } from "@/collector/kit";
import { registry } from "@/collector/catalog/registry";

export default function TestingPage() {
  const Editor = registry["deletreo"].Editor;

  return (
    <div className="flex h-dvh flex-col">
      <CollectorTopbar />
      <div className="min-h-0 flex-1">
        <Editor />
      </div>
    </div>
  );
}
