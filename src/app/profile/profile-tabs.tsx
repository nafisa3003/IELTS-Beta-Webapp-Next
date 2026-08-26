"use client";

import { useState } from "react";

export function ProfileTabs({
  personalInfo,
  settings,
}: {
  personalInfo: React.ReactNode;
  settings: React.ReactNode;
}) {
  const [tab, setTab] = useState<"info" | "settings">("info");

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-pill bg-mist p-1 w-fit">
        <TabButton active={tab === "info"} onClick={() => setTab("info")}>
          Personal info
        </TabButton>
        <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>
          Settings
        </TabButton>
      </div>
      {tab === "info" ? personalInfo : settings}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-surface text-navy shadow-card" : "text-slate hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}
