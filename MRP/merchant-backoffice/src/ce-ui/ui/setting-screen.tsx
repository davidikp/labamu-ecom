"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { type SideTabItem } from "./side-tabs"
import {
  SideTabScreen,
  SideTabScreenHeader,
  SideTabScreenSection,
  type SideTabScreenHeaderProps,
  type SideTabScreenSectionProps,
} from "./side-tab-screen"

export type { SideTabScreenHeaderStat, SideTabScreenHeaderLink } from "./side-tab-screen"
export type { SideTabScreenSectionField, SideTabScreenSectionAction } from "./side-tab-screen"

export interface SettingScreenSection extends Omit<SideTabScreenSectionProps, "className" | "testId"> {}

export interface SettingScreenProps {
  tabs: SideTabItem[]
  activeTab?: string
  onTabChange?: (value: string) => void
  header: Omit<SideTabScreenHeaderProps, "className" | "testId">
  sections: SettingScreenSection[]
  className?: string
  testId?: string
}

export const SettingScreen: React.FC<SettingScreenProps> = ({
  tabs,
  activeTab,
  onTabChange,
  header,
  sections,
  className,
  testId,
}) => (
  <SideTabScreen
    tabs={tabs}
    activeTab={activeTab}
    onTabChange={onTabChange}
    className={cn("min-h-screen p-6 bg-lb-surface-grey", className)}
    testId={testId ?? "setting_screen"}
    header={<SideTabScreenHeader {...header} />}
  >
    {sections.map((section, i) => (
      <SideTabScreenSection key={i} {...section} />
    ))}
  </SideTabScreen>
)

export default SettingScreen
