import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  TextField,
  Dropdown,
  DialogBody,
  DialogButton,
  DialogButtonPrimary,
  DialogControlsSection,
  DialogHeader,
  DialogLabel,
  Focusable,
  ModalRoot,
  showModal,
} from "@decky/ui";
import {
  callable,
  definePlugin,
  toaster,
} from "@decky/api";
import { useState, useEffect, useCallback } from "react";
import { FaWifi, FaPlus, FaTrash, FaEdit, FaPlay, FaSync, FaExclamationTriangle } from "react-icons/fa";
import { apiAction, apiMessage, t } from "./i18n";

// ── Backend callables ────────────────────────────────────────────

const getProfiles = callable<[], NetworkProfile[]>("get_profiles");
const saveProfile = callable<[NetworkProfile], ApiResult>("save_profile");
const deleteProfile = callable<[string], ApiResult>("delete_profile");
const getCurrentNetwork = callable<[], CurrentNetwork>("get_current_network");
const applyProfile = callable<[string], ApiResult>("apply_profile");
const validateIp = callable<[string], boolean>("validate_ip");
const validateSubnet = callable<[string], boolean>("validate_subnet");

// ── Constants ────────────────────────────────────────────────────

const EMPTY_PROFILE: NetworkProfile = {
  name: "",
  ip: "",
  subnet_mask: "255.255.255.0",
  gateway: "",
  dns: [""],
  method: "manual",
};

// ── Helpers ──────────────────────────────────────────────────────

async function refreshProfiles(setProfiles: (p: NetworkProfile[]) => void) {
  const profiles = await getProfiles();
  setProfiles(profiles);
}

// ── Spin Animation Style ─────────────────────────────────────────

const spinKeyframes = `
@keyframes netprofile-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin {
  animation: netprofile-spin 1s linear infinite;
}
`;

// Inject CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

// ── Confirm Delete Modal ─────────────────────────────────────────

function ConfirmDeleteModal({
  profileName,
  onConfirm,
  closeModal,
}: {
  profileName: string;
  onConfirm: () => void;
  closeModal: () => void;
}) {
  return (
    <ModalRoot onCancel={closeModal}>
      <DialogHeader>{t("confirmDelete.title")}</DialogHeader>
      <DialogBody>
        <DialogControlsSection>
          <DialogLabel>{t("confirmDelete.body", { name: profileName })}</DialogLabel>
        </DialogControlsSection>
      </DialogBody>
      <DialogControlsSection>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <DialogButton onClick={closeModal}>{t("common.cancel")}</DialogButton>
          <DialogButtonPrimary
            onClick={() => {
              closeModal();
              onConfirm();
            }}
          >
            {t("common.delete")}
          </DialogButtonPrimary>
        </div>
      </DialogControlsSection>
    </ModalRoot>
  );
}

// ── Profile Editor Modal ─────────────────────────────────────────

function ProfileEditorModal({
  profile,
  onSave,
  closeModal,
}: {
  profile: NetworkProfile;
  onSave: () => void;
  closeModal: () => void;
}) {
  const [form, setForm] = useState<NetworkProfile>({ ...profile });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = !!profile.name;

  const updateField = (field: keyof NetworkProfile, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updateDns = (index: number, value: string) => {
    setForm((prev) => {
      const dns = [...prev.dns];
      dns[index] = value;
      return { ...prev, dns };
    });
  };

  const addDns = () => {
    setForm((prev) => ({ ...prev, dns: [...prev.dns, ""] }));
  };

  const removeDns = (index: number) => {
    setForm((prev) => ({
      ...prev,
      dns: prev.dns.filter((_, i) => i !== index),
    }));
  };

  const validate = async (): Promise<boolean> => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) {
      errs.name = t("validation.profileNameRequired");
    }

    if (form.method === "manual") {
      if (!form.ip.trim()) {
        errs.ip = t("validation.ipRequired");
      } else {
        const valid = await validateIp(form.ip.trim());
        if (!valid) errs.ip = t("validation.invalidIp");
      }

      if (!form.subnet_mask.trim()) {
        errs.subnet_mask = t("validation.subnetRequired");
      } else {
        const valid = await validateSubnet(form.subnet_mask.trim());
        if (!valid) errs.subnet_mask = t("validation.invalidSubnet");
      }

      if (form.gateway.trim()) {
        const valid = await validateIp(form.gateway.trim());
        if (!valid) errs.gateway = t("validation.invalidGateway");
      }

      for (let i = 0; i < form.dns.length; i++) {
        const dns = form.dns[i].trim();
        if (dns) {
          const valid = await validateIp(dns);
          if (!valid) errs[`dns_${i}`] = t("validation.invalidDns");
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!(await validate())) return;

    setSaving(true);
    // Clean up empty DNS entries
    const cleanProfile = {
      ...form,
      dns: form.dns.filter((d) => d.trim() !== ""),
    };
    const result = await saveProfile(cleanProfile);
    setSaving(false);

    if (result.success) {
      toaster.toast({ title: t("toast.profileSaved"), body: apiMessage(result.message, result.error_action) });
      closeModal();
      onSave();
    } else {
      toaster.toast({ title: t("common.error"), body: apiMessage(result.message, result.error_action) });
    }
  };

  return (
    <ModalRoot onCancel={closeModal}>
      <DialogHeader>
        {isEditing ? t("profileEditor.titleEdit", { name: profile.name }) : t("profileEditor.titleNew")}
      </DialogHeader>
      <DialogBody>
        <DialogControlsSection>
          <DialogLabel>{t("profileEditor.profileName")}</DialogLabel>
          <TextField
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder={t("profileEditor.profileNamePlaceholder")}
          />
          {errors.name && (
            <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}>
              {errors.name}
            </div>
          )}

          <DialogLabel style={{ marginTop: "12px" }}>{t("profileEditor.configurationMethod")}</DialogLabel>
          <Dropdown
            rgOptions={[
              { label: t("profileEditor.manualStaticIp"), data: "manual" },
              { label: t("profileEditor.automaticDhcp"), data: "auto" },
            ]}
            selectedOption={form.method}
            onChange={(e) => updateField("method", e.data)}
          />

          {form.method === "manual" && (
            <>
              <DialogLabel style={{ marginTop: "12px" }}>{t("profileEditor.ipAddress")}</DialogLabel>
              <TextField
                value={form.ip}
                onChange={(e) => updateField("ip", e.target.value)}
                placeholder="192.168.1.100"
              />
              {errors.ip && (
                <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}>
                  {errors.ip}
                </div>
              )}

              <DialogLabel style={{ marginTop: "12px" }}>{t("profileEditor.subnetMask")}</DialogLabel>
              <TextField
                value={form.subnet_mask}
                onChange={(e) => updateField("subnet_mask", e.target.value)}
                placeholder="255.255.255.0"
              />
              {errors.subnet_mask && (
                <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}>
                  {errors.subnet_mask}
                </div>
              )}

              <DialogLabel style={{ marginTop: "12px" }}>{t("profileEditor.gateway")}</DialogLabel>
              <TextField
                value={form.gateway}
                onChange={(e) => updateField("gateway", e.target.value)}
                placeholder="192.168.1.1"
              />
              {errors.gateway && (
                <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}>
                  {errors.gateway}
                </div>
              )}

              <DialogLabel style={{ marginTop: "12px" }}>{t("profileEditor.dnsServers")}</DialogLabel>
              {form.dns.map((dns, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: form.dns.length > 1 ? "minmax(0, 1fr) 42px" : "1fr",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <TextField
                      value={dns}
                      onChange={(e) => updateDns(i, e.target.value)}
                      placeholder={t("profileEditor.dnsPlaceholder", { index: i + 1 })}
                    />
                  </div>
                  {form.dns.length > 1 && (
                    <DialogButton
                      onClick={() => removeDns(i)}
                      style={{ minWidth: "42px", width: "42px", padding: "0" }}
                    >
                      <FaTrash />
                    </DialogButton>
                  )}
                </div>
              ))}
              {errors.dns_0 && (
                <div style={{ color: "#e74c3c", fontSize: "12px", marginTop: "4px" }}>
                  {errors.dns_0}
                </div>
              )}
              <ButtonItem onClick={addDns} style={{ marginTop: "4px" }}>
                <FaPlus style={{ marginRight: "8px" }} /> {t("profileEditor.addDns")}
              </ButtonItem>
            </>
          )}
        </DialogControlsSection>
      </DialogBody>
      <DialogControlsSection>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <DialogButton onClick={closeModal}>{t("common.cancel")}</DialogButton>
          <DialogButtonPrimary onClick={handleSave} disabled={saving}>
            {saving ? t("profileEditor.saving") : t("profileEditor.saveProfile")}
          </DialogButtonPrimary>
        </div>
      </DialogControlsSection>
    </ModalRoot>
  );
}

// ── Main Content Component ───────────────────────────────────────

function Content() {
  const [profiles, setProfiles] = useState<NetworkProfile[]>([]);
  const [currentNet, setCurrentNet] = useState<CurrentNetwork>({});
  const [loading, setLoading] = useState(true);
  const [applyingProfile, setApplyingProfile] = useState<string | null>(null);
  const [focusedApplyProfile, setFocusedApplyProfile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<ApiResult | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profilesData, netData] = await Promise.all([
        getProfiles(),
        getCurrentNetwork(),
      ]);
      setProfiles(profilesData);
      setCurrentNet(netData);
    } catch (e) {
      setError(t("currentNetwork.loadError"));
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleApply = async (name: string) => {
    setApplyingProfile(name);
    setApplyError(null);
    try {
      const result = await applyProfile(name);

      if (result.success) {
        setApplyError(null);
        toaster.toast({ title: t("toast.profileApplied"), body: apiMessage(result.message, result.error_action) });
        // Refresh after a short delay for the network to reconfigure
        setTimeout(() => refresh(), 2000);
      } else {
        setApplyError(result);
        toaster.toast({ title: t("toast.applyFailed"), body: t("toast.applyFailedBody") });
      }
    } catch (e) {
      const message = e instanceof Error ? e.stack || e.message : String(e);
      setApplyError({
        success: false,
        message: "Frontend apply call failed",
        error_details: message || t("api.unknownError"),
      });
      toaster.toast({ title: t("toast.applyFailed"), body: t("toast.applyFailedBody") });
    } finally {
      setApplyingProfile(null);
    }
  };

  const handleDelete = (name: string) => {
    let modal: ReturnType<typeof showModal>;
    const closeDeleteModal = () => modal?.Close();
    modal = showModal(
      <ConfirmDeleteModal
        profileName={name}
        onConfirm={async () => {
          const result = await deleteProfile(name);
          if (result.success) {
            toaster.toast({ title: t("toast.deleted"), body: apiMessage(result.message, result.error_action) });
            await refreshProfiles(setProfiles);
          } else {
            toaster.toast({ title: t("common.error"), body: apiMessage(result.message, result.error_action) });
          }
        }}
        closeModal={closeDeleteModal}
      />
    );
  };

  const openAddModal = () => {
    let modal: ReturnType<typeof showModal>;
    const closeEditorModal = () => modal?.Close();
    modal = showModal(
      <ProfileEditorModal
        profile={EMPTY_PROFILE}
        onSave={() => {
          refreshProfiles(setProfiles);
        }}
        closeModal={closeEditorModal}
      />
    );
  };

  const openEditModal = (profile: NetworkProfile) => {
    let modal: ReturnType<typeof showModal>;
    const closeEditorModal = () => modal?.Close();
    modal = showModal(
      <ProfileEditorModal
        profile={profile}
        onSave={() => {
          refreshProfiles(setProfiles);
        }}
        closeModal={closeEditorModal}
      />
    );
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div>
      {/* ── Current Network Status ───────────────────────────── */}
      <PanelSection title={t("currentNetwork.title")}>
        {error ? (
          <PanelSectionRow>
            <Focusable
              tabIndex={0}
              onActivate={() => undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                color: "#f39c12",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <FaExclamationTriangle />
              <span>{error}</span>
            </Focusable>
          </PanelSectionRow>
        ) : currentNet.error ? (
          <PanelSectionRow>
            <Focusable
              tabIndex={0}
              onActivate={() => undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                color: "#95a5a6",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <FaWifi />
              <span>{apiMessage(currentNet.error)}</span>
            </Focusable>
          </PanelSectionRow>
        ) : loading ? (
          <PanelSectionRow>
            <Focusable
              tabIndex={0}
              onActivate={() => undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                color: "#95a5a6",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <FaSync className="spin" />
              <span>{t("currentNetwork.loading")}</span>
            </Focusable>
          </PanelSectionRow>
        ) : (
          <PanelSectionRow>
            <Focusable
              tabIndex={0}
              onActivate={() => undefined}
              style={{
                padding: "12px",
                backgroundColor: "var(--decky-section-panel-background, rgba(255,255,255,0.03))",
                borderRadius: "4px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <FaWifi style={{ color: "#2ecc71" }} />
                <strong>{currentNet.connection_name}</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#bdc3c7", lineHeight: "1.6" }}>
                <div>{t("currentNetwork.method", { method: currentNet.method === "manual" ? t("common.manual") : t("common.dhcp") })}</div>
                {currentNet.ip && <div>{t("currentNetwork.ip", { ip: currentNet.ip })}</div>}
                {currentNet.subnet_mask && <div>{t("currentNetwork.mask", { mask: currentNet.subnet_mask })}</div>}
                {currentNet.gateway && <div>{t("currentNetwork.gateway", { gateway: currentNet.gateway })}</div>}
                {currentNet.dns && currentNet.dns.length > 0 && (
                  <div>{t("currentNetwork.dns", { dns: currentNet.dns.join(", ") })}</div>
                )}
              </div>
            </Focusable>
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={refresh} disabled={loading}>
            <FaSync className={loading ? "spin" : ""} style={{ marginRight: "8px" }} />
            {t("currentNetwork.refresh")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {applyError && (
        <PanelSection title={t("applyError.title")}>
          <PanelSectionRow>
            <div
              style={{
                padding: "12px",
                backgroundColor: "rgba(231,76,60,0.12)",
                border: "1px solid rgba(231,76,60,0.35)",
                borderRadius: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#ff8a80" }}>
                <FaExclamationTriangle />
                <strong>{applyError.message ? apiMessage(applyError.message, applyError.error_action) : t("applyError.lastFailed")}</strong>
              </div>
              {applyError.error_action && (
                <div style={{ color: "#f5c6c2", fontSize: "12px", marginBottom: "8px" }}>
                  {t("applyError.action", { action: apiAction(applyError.error_action) })}
                </div>
              )}
              {typeof applyError.error_code === "number" && (
                <div style={{ color: "#f5c6c2", fontSize: "12px", marginBottom: "8px" }}>
                  {t("applyError.exitCode", { code: applyError.error_code })}
                </div>
              )}
              {applyError.error_details && (
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ color: "#ffb3ad", fontSize: "12px", marginBottom: "4px" }}>{t("applyError.details")}</div>
                  <div
                    style={{
                      color: "#f5c6c2",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      lineHeight: "1.45",
                      maxHeight: "160px",
                      overflowY: "auto",
                      overflowWrap: "anywhere",
                      whiteSpace: "pre-wrap",
                      userSelect: "text",
                    }}
                  >
                    {applyError.error_details}
                  </div>
                </div>
              )}
              {applyError.error_command && (
                <div>
                  <div style={{ color: "#ffb3ad", fontSize: "12px", marginBottom: "4px" }}>{t("applyError.command")}</div>
                  <div
                    style={{
                      color: "#f5c6c2",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      lineHeight: "1.45",
                      maxHeight: "90px",
                      overflowY: "auto",
                      overflowWrap: "anywhere",
                      whiteSpace: "pre-wrap",
                      userSelect: "text",
                    }}
                  >
                    {applyError.error_command}
                  </div>
                </div>
              )}
            </div>
          </PanelSectionRow>
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={() => setApplyError(null)}>
              {t("common.dismiss")}
            </ButtonItem>
          </PanelSectionRow>
        </PanelSection>
      )}

      {/* ── Saved Profiles ──────────────────────────────────── */}
      <PanelSection title={t("profiles.title")}>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={openAddModal}
            style={{ borderColor: "#2ecc71", borderStyle: "dashed" }}
          >
            <FaPlus style={{ marginRight: "8px" }} /> {t("profiles.addNew")}
          </ButtonItem>
        </PanelSectionRow>

        {profiles.length === 0 && !loading ? (
          <PanelSectionRow>
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#7f8c8d",
              }}
            >
              <p>{t("profiles.empty")}</p>
              <p style={{ fontSize: "13px" }}>
                {t("profiles.emptyHelp")}
              </p>
            </div>
          </PanelSectionRow>
        ) : (
          profiles.map((profile) => (
            <PanelSectionRow key={profile.name}>
              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: "var(--decky-section-panel-background, rgba(255,255,255,0.03))",
                  borderRadius: "4px",
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <strong style={{ fontSize: "14px" }}>{profile.name}</strong>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      backgroundColor:
                        profile.method === "auto" ? "rgba(46,204,113,0.2)" : "rgba(52,152,219,0.2)",
                      color: profile.method === "auto" ? "#2ecc71" : "#3498db",
                    }}
                  >
                    {profile.method === "auto" ? t("common.dhcp") : t("common.static")}
                  </span>
                </div>

                {/* Details */}
                {profile.method === "manual" && (
                  <div style={{ fontSize: "12px", color: "#95a5a6", lineHeight: "1.5", marginBottom: "8px" }}>
                    <div>{t("currentNetwork.ip", { ip: `${profile.ip} / ${profile.subnet_mask}` })}</div>
                    {profile.gateway && <div>{t("currentNetwork.gateway", { gateway: profile.gateway })}</div>}
                    {profile.dns.length > 0 && <div>{t("currentNetwork.dns", { dns: profile.dns.join(", ") })}</div>}
                  </div>
                )}

                {/* Action buttons */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    width: "100%",
                  }}
                >
                  <DialogButton
                    onClick={() => handleApply(profile.name)}
                    disabled={applyingProfile === profile.name}
                    onBlur={() => setFocusedApplyProfile((focused) => focused === profile.name ? null : focused)}
                    onFocus={() => setFocusedApplyProfile(profile.name)}
                    onGamepadBlur={() => setFocusedApplyProfile((focused) => focused === profile.name ? null : focused)}
                    onGamepadFocus={() => setFocusedApplyProfile(profile.name)}
                    style={{
                      minWidth: 0,
                      width: "100%",
                      backgroundColor: focusedApplyProfile === profile.name ? "rgba(46,204,113,0.42)" : "rgba(46,204,113,0.15)",
                      borderColor: focusedApplyProfile === profile.name ? "#7dffad" : "#2ecc71",
                      boxShadow: focusedApplyProfile === profile.name ? "0 0 0 2px rgba(125,255,173,0.35)" : "none",
                      color: focusedApplyProfile === profile.name ? "#ffffff" : undefined,
                    }}
                  >
                    {applyingProfile === profile.name ? (
                      <>
                        <FaSync className="spin" style={{ marginRight: "6px" }} />
                        {t("actions.applying")}
                      </>
                    ) : (
                      <>
                        <FaPlay style={{ marginRight: "6px", fontSize: "10px" }} />
                        {t("actions.apply")}
                      </>
                    )}
                  </DialogButton>
                  <DialogButton
                    onClick={() => openEditModal(profile)}
                    style={{ minWidth: 0, width: "100%" }}
                  >
                    <FaEdit style={{ marginRight: "6px" }} />
                    {t("actions.edit")}
                  </DialogButton>
                  <DialogButton
                    onClick={() => handleDelete(profile.name)}
                    style={{ minWidth: 0, width: "100%", borderColor: "rgba(231,76,60,0.3)" }}
                  >
                    <FaTrash style={{ color: "#e74c3c", marginRight: "6px" }} />
                    {t("actions.delete")}
                  </DialogButton>
                </div>
              </div>
            </PanelSectionRow>
          ))
        )}
      </PanelSection>
    </div>
  );
}

// ── Plugin Definition ────────────────────────────────────────────

export default definePlugin(() => {
  console.log("NetProfile Switcher initializing...");

  return {
    name: t("plugin.name"),
    titleView: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <FaWifi />
        <span>{t("plugin.name")}</span>
      </div>
    ),
    content: <Content />,
    icon: <FaWifi />,
    onDismount() {
      console.log("NetProfile Switcher unmounted");
    },
  };
});
