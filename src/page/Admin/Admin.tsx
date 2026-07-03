import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAward, FiFileText, FiGrid, FiHeart, FiKey, FiLogIn, FiMail, FiShield, FiSlash, FiUsers } from "react-icons/fi";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Spinner, TooltipProvider } from "@aottg2/ui";
import { useAuth } from "../../auth/useAuth";
import { AdminConfirmDialogs } from "./components/AdminConfirmDialogs";
import { AdminSidebar } from "./components/AdminSidebar";
import { AssignRolesDialog } from "./components/AssignRolesDialog";
import { EditUserDialog } from "./components/EditUserDialog";
import { PatreonUserDialog } from "./components/PatreonUserDialog";
import { RestrictionDialog } from "./components/RestrictionDialog";
import { RoleDialog } from "./components/RoleDialog";
import { UserDetailDialog } from "./components/UserDetailDialog";
import { useAccountActions } from "./hooks/useAccountActions";
import { useAdminAudits } from "./hooks/useAdminAudits";
import { useAdminAuthMethods } from "./hooks/useAdminAuthMethods";
import { useAdminCatalogs } from "./hooks/useAdminCatalogs";
import { useAdminChangelogs } from "./hooks/useAdminChangelogs";
import { useAdminCredits } from "./hooks/useAdminCredits";
import { useAdminPermissions } from "./hooks/useAdminPermissions";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useEmailLimits } from "./hooks/useEmailLimits";
import { usePatreonCatalog } from "./hooks/usePatreonCatalog";
import { useRoleActions } from "./hooks/useRoleActions";
import { useUserColumns } from "./hooks/useUserColumns";
import { useUserPatreonActions } from "./hooks/useUserPatreonActions";
import { AuthMethodsSection } from "./sections/AuthMethodsSection";
import { AuditsSection } from "./sections/AuditsSection";
import { ChangelogSection } from "./sections/ChangelogSection";
import { CreditsSection } from "./sections/CreditsSection";
import { EmailSection } from "./sections/EmailSection";
import { OverviewSection } from "./sections/OverviewSection";
import { PatreonSection } from "./sections/PatreonSection";
import { PermissionsSection } from "./sections/PermissionsSection";
import { RolesSection } from "./sections/RolesSection";
import { UsersSection } from "./sections/UsersSection";
import type { AdminSection, AdminSectionItem } from "./types";

export default function Admin() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading } = useAuth();
  const permissions = useAdminPermissions(profile);
  const [section, setSection] = useState<AdminSection>("overview");

  const sectionItems = useMemo<AdminSectionItem[]>(() => [
    { id: "overview", label: "Overview", icon: <FiGrid />, visible: permissions.canAccessAdmin },
    { id: "users", label: "Users", icon: <FiUsers />, visible: permissions.canReadUsers },
    { id: "banned", label: "Banned users", icon: <FiSlash />, visible: permissions.canReadUsers },
    { id: "roles", label: "Roles", icon: <FiShield />, visible: permissions.canReadRoles },
    { id: "permissions", label: "Permissions", icon: <FiKey />, visible: permissions.canReadPermissions },
    { id: "audits", label: "Audit logs", icon: <FiFileText />, visible: permissions.canReadAudits },
    { id: "emails", label: "Email Service", icon: <FiMail />, visible: permissions.canReadEmails },
    { id: "auth-methods", label: "Auth methods", icon: <FiLogIn />, visible: permissions.canReadAuthMethods },
    { id: "credits", label: "Credits", icon: <FiAward />, visible: permissions.canReadCredits },
    { id: "patreon", label: "Patreon", icon: <FiHeart />, visible: permissions.canReadPatreon },
    { id: "changelog", label: "Changelog", icon: <FiFileText />, visible: permissions.canReadChangelogs },
  ], [permissions]);
  const visibleSectionItems = useMemo(() => sectionItems.filter((item) => item.visible), [sectionItems]);

  const catalogs = useAdminCatalogs(permissions.canReadRoles, permissions.canReadPermissions);
  const users = useAdminUsers(permissions.canReadUsers, section);
  const audits = useAdminAudits(permissions.canReadAudits, permissions.canReadUsers, section);
  const email = useEmailLimits(permissions.canReadEmails, permissions.canUpdateEmails, permissions.canReadAudits, section, audits.refetchAudits);
  const authMethods = useAdminAuthMethods(permissions.canReadAuthMethods, permissions.canUpdateAuthMethods, permissions.canReadAudits, section, audits.refetchAudits);
  const credits = useAdminCredits(permissions.canReadCredits, permissions.canUpdateCredits, permissions.canReadUsers, permissions.canReadAudits, section, audits.refetchAudits);
  const patreonCatalog = usePatreonCatalog(permissions.canReadPatreon, permissions.canUpdatePatreon, permissions.canReadAudits, section, audits.refetchAudits);
  const changelogs = useAdminChangelogs(permissions.canReadChangelogs, permissions.canUpdateChangelogs, permissions.canReadAudits, section, audits.refetchAudits);
  const roleActions = useRoleActions(permissions.canUpdateRolePermissions, catalogs.refetchRoles);
  const accountActions = useAccountActions({
    canAssignUserRoles: permissions.canAssignUserRoles,
    canReadAudits: permissions.canReadAudits,
    canRemoveUserRoles: permissions.canRemoveUserRoles,
    profile,
    refetchAudits: audits.refetchAudits,
    refetchUsers: users.refetchUsers,
    auditNav: {
      setAuditAccountFilter: audits.setAuditAccountFilter,
      setAuditUserSearch: audits.setAuditUserSearch,
      setAuditEventType: audits.setAuditEventType,
      setDebouncedAuditEventType: audits.setDebouncedAuditEventType,
      setAuditsPage: audits.setAuditsPage,
      setSection,
    },
  });
  const patreonActions = useUserPatreonActions({
    canReadAudits: permissions.canReadAudits,
    detail: accountActions.detail,
    loadPatreonCatalog: patreonCatalog.loadPatreonCatalog,
    patreonCatalogLoaded: patreonCatalog.patreonCatalogLoaded,
    patreonTiersError: patreonCatalog.patreonTiersError,
    patreonTiersLoading: patreonCatalog.patreonTiersLoading,
    refetchAudits: audits.refetchAudits,
    refetchUsers: users.refetchUsers,
    setDetail: accountActions.setDetail,
  });
  const actionLoading = accountActions.userActionLoading || roleActions.roleActionLoading || patreonActions.patreonActionLoading;
  const userColumns = useUserColumns({
    canDeleteUsers: permissions.canDeleteUsers,
    canManageUserRoles: permissions.canManageUserRoles,
    canReadUsers: permissions.canReadUsers,
    canRestrictUsers: permissions.canRestrictUsers,
    canUpdatePatreon: permissions.canUpdatePatreon,
    canUpdateUsers: permissions.canUpdateUsers,
    currentAccountId: profile?.accountId,
    onAssign: accountActions.openAssign,
    onClearFlag: accountActions.clearAccountFlag,
    onDelete: accountActions.setDeleteUser,
    onEdit: accountActions.openEdit,
    onLiftRestriction: accountActions.liftRestriction,
    onOpenPatreon: patreonActions.openPatreon,
    onRefreshPatreon: patreonActions.refreshUserPatreon,
    onRestrict: accountActions.openRestriction,
    onViewDetails: accountActions.viewDetails,
    roles: catalogs.roles,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!permissions.canAccessAdmin || visibleSectionItems.some((item) => item.id === section)) return;
    setSection(visibleSectionItems[0]?.id ?? "overview");
  }, [permissions.canAccessAdmin, section, visibleSectionItems]);

  if (isLoading || !isAuthenticated) {
    return <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background p-6 lg:min-h-[calc(100vh-4rem)]"><Spinner label="Checking access" /></main>;
  }

  if (!permissions.canAccessAdmin) {
    return (
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl items-center bg-background px-6 py-12 lg:min-h-[calc(100vh-4rem)]">
        <Card className="w-full border-border bg-card text-card-foreground">
          <CardHeader><CardTitle>Access denied</CardTitle><CardDescription>Admin or moderator permissions required.</CardDescription></CardHeader>
          <CardContent><Button type="button" onClick={() => navigate("/accounts")}>Back to account</Button></CardContent>
        </Card>
      </main>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <main className="relative z-10 min-h-[calc(100vh-3.5rem)] bg-background lg:min-h-[calc(100vh-4rem)]">
        <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-4rem)]">
          <AdminSidebar items={visibleSectionItems} section={section} onSection={setSection} />
          <section className="min-w-0 flex-1 space-y-6 px-6 py-8 lg:ml-64 lg:px-8">
            {section === "overview" ? <OverviewSection permissions={permissions} profile={profile} onSection={setSection} /> : null}
            {section === "users" || section === "banned" ? (
              <UsersSection mode={section} bannedStatusFilter={users.bannedStatusFilter} onBannedStatusFilter={users.setBannedStatusFilter} onPage={users.setPage} onPageSize={users.setPageSize} onRefresh={users.refetchUsers} onSearch={users.setSearch} page={users.page} pageCount={users.pageCount} pageSize={users.pageSize} roles={catalogs.roles} search={users.search} totalUsers={users.totalUsers} userColumns={userColumns} userFilters={users.userFilters} users={users.users} usersError={users.usersError} usersLoading={users.usersLoading} onApplyUserFilters={users.applyUserFilters} onResetUserFilters={users.resetUserFilters} />
            ) : null}
            {section === "roles" ? <RolesSection roles={catalogs.roles} rolesLoading={catalogs.rolesLoading} rolesError={catalogs.rolesError} onRefresh={catalogs.refetchRoles} canCreateRoles={permissions.canCreateRoles} canUpdateRoles={permissions.canUpdateRoles} canUpdateSystemRoles={permissions.canUpdateSystemRoles} canDeleteRoles={permissions.canDeleteRoles} canDeleteSystemRoles={permissions.canDeleteSystemRoles} canReadRolePermissions={permissions.canReadRolePermissions} onCreateRole={roleActions.openCreateRole} onEditRole={roleActions.openEditRole} onDeleteRole={roleActions.setDeleteRoleTarget} /> : null}
            {section === "permissions" ? <PermissionsSection permissions={catalogs.permissions} permissionsLoading={catalogs.permissionsLoading} permissionsError={catalogs.permissionsError} onRefresh={catalogs.refetchPermissions} /> : null}
            {section === "emails" ? <EmailSection canUpdateEmails={permissions.canUpdateEmails} dailyIpLimit={email.dailyIpLimit} dailyRecipientLimit={email.dailyRecipientLimit} dailyResetHourUtc={email.dailyResetHourUtc} emailLimits={email.emailLimits} emailLimitsError={email.emailLimitsError} emailLimitsLoading={email.emailLimitsLoading} emailLimitsSaving={email.emailLimitsSaving} monthlyHardLimit={email.monthlyHardLimit} monthlyResetDay={email.monthlyResetDay} onDailyIpLimit={email.setDailyIpLimit} onDailyRecipientLimit={email.setDailyRecipientLimit} onDailyResetHourUtc={email.setDailyResetHourUtc} onMonthlyHardLimit={email.setMonthlyHardLimit} onMonthlyResetDay={email.setMonthlyResetDay} onRefresh={email.refetchEmailLimits} onSave={() => void email.saveEmailLimits()} /> : null}
            {section === "auth-methods" ? <AuthMethodsSection canUpdate={permissions.canUpdateAuthMethods} draft={authMethods.draft} error={authMethods.error} loading={authMethods.loading} saving={authMethods.saving} onRefresh={authMethods.refresh} onSave={() => void authMethods.save()} onSetEnabled={authMethods.setEnabled} /> : null}
            {section === "credits" ? <CreditsSection canReadUsers={permissions.canReadUsers} canUpdate={permissions.canUpdateCredits} draft={credits.draft} error={credits.error} loading={credits.loading} saving={credits.saving} userResults={credits.userResults} userSearch={credits.userSearch} userSearchLoading={credits.userSearchLoading} onAddCategory={credits.addCategory} onAddContributor={credits.addContributor} onAddGroup={credits.addGroup} onDeleteCategory={credits.removeCategory} onDeleteContributor={credits.deleteContributor} onDeleteGroup={credits.deleteGroup} onLinkContributor={credits.linkContributor} onMoveCategory={credits.moveCategory} onMoveContributor={credits.moveContributor} onMoveGroup={credits.moveGroup} onRefresh={credits.refresh} onSave={() => void credits.save()} onSearchUsers={() => void credits.searchUsers()} onSetCategoryDescription={credits.setCategoryDescription} onSetCategoryName={credits.setCategoryName} onSetContributorName={credits.setContributorName} onSetGroupTitle={credits.setGroupTitle} onSetUserSearch={credits.setUserSearch} onUnlinkContributor={credits.unlinkContributor} /> : null}
            {section === "patreon" ? <PatreonSection canUpdatePatreon={permissions.canUpdatePatreon} labelsJson={patreonCatalog.patreonTierLabelsJson} labelsSaving={patreonCatalog.patreonTierLabelsSaving} onLabelsJson={patreonCatalog.setPatreonTierLabelsJson} onRefresh={patreonCatalog.refetchPatreon} onSaveLabels={() => void patreonCatalog.savePatreonTierLabels()} tiers={patreonCatalog.patreonTiers} tiersError={patreonCatalog.patreonTiersError} tiersLoading={patreonCatalog.patreonTiersLoading} /> : null}
            {section === "changelog" ? <ChangelogSection canUpdate={permissions.canUpdateChangelogs} contentMarkdown={changelogs.contentMarkdown} entries={changelogs.entries} error={changelogs.error} loading={changelogs.loading} saving={changelogs.saving} selected={changelogs.selected} version={changelogs.version} onContentMarkdown={changelogs.setContentMarkdown} onDeleteDraft={() => void changelogs.deleteDraft()} onNewDraft={changelogs.newDraft} onPublish={() => void changelogs.publish()} onRefresh={changelogs.refresh} onSave={() => void changelogs.save()} onSelect={changelogs.selectEntry} onUnpublish={() => void changelogs.unpublish()} onVersion={changelogs.setVersion} /> : null}
            {section === "audits" ? <AuditsSection accountFilter={audits.auditAccountFilter} accountLookup={audits.auditAccountLookup} auditViewMode={audits.auditViewMode} auditsError={audits.auditsError} auditsLoading={audits.auditsLoading} auditsPage={audits.auditsPage} auditsPageCount={audits.auditsPageCount} auditsPageSize={audits.auditsPageSize} auditsTotal={audits.auditsTotal} eventType={audits.auditEventType} events={audits.auditEvents} loadingUserSearch={audits.auditUserSearchLoading} onApplyUserSearch={audits.applyAuditAccountSearch} onEventType={audits.setAuditEventType} onPage={audits.setAuditsPage} onPageSize={audits.setAuditsPageSize} onRefresh={audits.refetchAudits} onResetFilters={audits.resetAuditFilters} onViewMode={audits.setAuditViewMode} roles={catalogs.roles} userSearch={audits.auditUserSearch} /> : null}
          </section>
        </div>

        <UserDetailDialog actionLoading={actionLoading} auditAccountLookup={audits.auditAccountLookup} canManageUserRoles={permissions.canManageUserRoles} canReadAudits={permissions.canReadAudits} canRestrictUsers={permissions.canRestrictUsers} canUpdatePatreon={permissions.canUpdatePatreon} detail={accountActions.detail} loading={accountActions.detailLoading} open={accountActions.detailOpen} profileAccountId={profile?.accountId} roles={catalogs.roles} onAssign={accountActions.openAssign} onClearFlag={accountActions.clearAccountFlag} onClearPatreonOverrideUser={patreonActions.setClearPatreonOverrideUser} onFullAudit={accountActions.openFullAuditForDetail} onLiftRestriction={accountActions.liftRestriction} onOpenChange={accountActions.setDetailOpen} onPatreon={patreonActions.openPatreon} onRefreshPatreon={patreonActions.refreshUserPatreon} onRestrict={accountActions.openRestriction} onViewDetails={accountActions.viewDetails} />
        <RestrictionDialog actionLoading={actionLoading} expiresAt={accountActions.restrictionExpiresAt} kind={accountActions.restrictionKind} reason={accountActions.restrictionReason} user={accountActions.restrictUser} onExpiresAt={accountActions.setRestrictionExpiresAt} onKind={accountActions.setRestrictionKind} onReason={accountActions.setRestrictionReason} onSave={() => void accountActions.saveRestriction()} onUser={accountActions.setRestrictUser} />
        <EditUserDialog actionLoading={actionLoading} name={accountActions.editName} user={accountActions.editUser} verified={accountActions.editVerified} onName={accountActions.setEditName} onSave={() => void accountActions.saveEdit()} onUser={accountActions.setEditUser} onVerified={accountActions.setEditVerified} />
        <AssignRolesDialog actionLoading={actionLoading} canAssignUserRoles={permissions.canAssignUserRoles} canRemoveUserRoles={permissions.canRemoveUserRoles} roleDraft={accountActions.roleDraft} roles={catalogs.roles} user={accountActions.assignUser} onRoleDraft={accountActions.setRoleDraft} onSave={() => void accountActions.saveRoles()} onUser={accountActions.setAssignUser} />
        <PatreonUserDialog actionLoading={actionLoading} amountDraft={patreonActions.patreonAmountDraft} customTier={patreonActions.patreonCustomTier} onAddCustomTier={patreonActions.addCustomPatreonTier} onAmountDraft={patreonActions.setPatreonAmountDraft} onClearOverrideUser={patreonActions.setClearPatreonOverrideUser} onCustomTier={patreonActions.setPatreonCustomTier} onLoadCatalog={() => void patreonCatalog.loadPatreonCatalog()} onSave={() => void patreonActions.savePatreonTiers()} onStatusDraft={patreonActions.setPatreonStatusDraft} onTierDraft={patreonActions.setPatreonTierDraft} onUser={patreonActions.setPatreonUser} patreonTiers={patreonCatalog.patreonTiers} statusDraft={patreonActions.patreonStatusDraft} tierDraft={patreonActions.patreonTierDraft} tiersError={patreonCatalog.patreonTiersError} tiersLoading={patreonCatalog.patreonTiersLoading} user={patreonActions.patreonUser} />
        <RoleDialog actionLoading={actionLoading} canReadRolePermissions={permissions.canReadRolePermissions} canUpdateRolePermissions={permissions.canUpdateRolePermissions} description={roleActions.roleDescription} displayName={roleActions.roleDisplayName} editingRoleName={roleActions.editingRole?.name} mode={roleActions.roleFormMode} name={roleActions.roleName} permissions={catalogs.permissions} rolePermissions={roleActions.rolePermissions} onDescription={roleActions.setRoleDescription} onDisplayName={roleActions.setRoleDisplayName} onMode={roleActions.setRoleFormMode} onName={roleActions.setRoleName} onRolePermissions={roleActions.setRolePermissions} onSave={() => void roleActions.saveRole()} />
        <AdminConfirmDialogs clearPatreonOverrideUser={patreonActions.clearPatreonOverrideUser} deleteRoleTarget={roleActions.deleteRoleTarget} deleteUser={accountActions.deleteUser} onClearPatreonOverride={() => void patreonActions.clearPatreonOverride()} onClearPatreonOverrideUser={patreonActions.setClearPatreonOverrideUser} onDeleteRole={() => void roleActions.confirmDeleteRole()} onDeleteRoleTarget={roleActions.setDeleteRoleTarget} onDeleteUser={() => void accountActions.confirmDelete()} onDeleteUserTarget={accountActions.setDeleteUser} />
      </main>
    </TooltipProvider>
  );
}
