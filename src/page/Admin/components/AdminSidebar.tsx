import { FiHome, FiSettings } from "react-icons/fi";
import { Sidebar, SidebarFooter, SidebarHeader, SidebarItem, SidebarSection, SidebarToggle } from "@aottg2/ui";
import type { AdminSection, AdminSectionItem } from "../types";

export function AdminSidebar({
  collapsed,
  items,
  section,
  onCollapsedChange,
  onSection,
}: {
  collapsed: boolean;
  items: AdminSectionItem[];
  section: AdminSection;
  onCollapsedChange: (collapsed: boolean) => void;
  onSection: (section: AdminSection) => void;
}) {
  return (
    <Sidebar defaultCollapsed={collapsed} onCollapsedChange={onCollapsedChange} className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 bg-card pl-3 shadow-none lg:top-16 lg:flex lg:h-[calc(100vh-4rem)]">
      <SidebarHeader>
        <span className="truncate">Admin</span>
        <div className="ml-auto"><SidebarToggle /></div>
      </SidebarHeader>
      <SidebarSection title="Panel">
        {items.map((item) => (
          <SidebarItem key={item.id} icon={item.icon} active={section === item.id} onClick={() => onSection(item.id)}>{item.label}</SidebarItem>
        ))}
      </SidebarSection>
      <SidebarFooter>
        <SidebarItem icon={<FiSettings />} href="/accounts">Account settings</SidebarItem>
        <SidebarItem icon={<FiHome />} href="/">Back home</SidebarItem>
      </SidebarFooter>
    </Sidebar>
  );
}
