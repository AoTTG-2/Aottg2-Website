import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Spinner,
  Textarea,
  cn,
  toast,
} from "@aottg2/ui";
import { authApi, authAssetUrl } from "../../auth/api";
import type { ProfilePreset, ProfilePresetCatalog } from "../../auth/types";
import { useAuth } from "../../auth/useAuth";

const socialFields = [
  { key: "discord", label: "Discord", type: "text" },
  { key: "x", label: "X", type: "url" },
  { key: "youtube", label: "YouTube", type: "url" },
  { key: "website", label: "Website", type: "url" },
] as const;

type SocialKey = typeof socialFields[number]["key"];
type SocialDraft = Record<SocialKey, string>;

const emptySocials: SocialDraft = {
  discord: "",
  x: "",
  youtube: "",
  website: "",
};

function imageUrl(preset?: ProfilePreset) {
  return preset ? authAssetUrl(preset.imageUrl) : "";
}

function PresetButton({
  preset,
  selected,
  className,
  imageClassName,
  onSelect,
}: {
  preset: ProfilePreset;
  selected: boolean;
  className?: string;
  imageClassName?: string;
  onSelect: (key: string) => void;
}) {
  return (
    <button
      type="button"
      title={preset.label}
      aria-label={preset.label}
      aria-pressed={selected}
      onClick={() => onSelect(preset.key)}
      className={cn(
        "relative overflow-hidden border bg-background/70 text-left outline-none transition-[border-color,box-shadow,transform] duration-150 ease-out hover:border-primary focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
        selected ? "border-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.35)]" : "border-border",
        className,
      )}
    >
      <img src={imageUrl(preset)} alt="" className={cn("h-full w-full object-cover", imageClassName)} loading="lazy" decoding="async" />
    </button>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { profile, isAuthenticated, isLoading, refreshProfile } = useAuth();
  const [catalog, setCatalog] = useState<ProfilePresetCatalog | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState<SocialDraft>(emptySocials);
  const [avatarKey, setAvatarKey] = useState("");
  const [bannerKey, setBannerKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!profile) return;
    setBio(profile.description ?? "");
    setAvatarKey(profile.avatarKey ?? "");
    setBannerKey(profile.bannerKey ?? "");
    setSocials({
      discord: profile.socials?.discord ?? "",
      x: profile.socials?.x ?? "",
      youtube: profile.socials?.youtube ?? "",
      website: profile.socials?.website ?? "",
    });
  }, [profile]);

  useEffect(() => {
    let alive = true;
    authApi.getProfilePresets()
      .then(({ ok, data }) => {
        if (!alive) return;
        if (ok) {
          setCatalog({ avatars: data.avatars ?? [], banners: data.banners ?? [] });
        } else {
          toast.error("Could not load presets", { description: data.error });
        }
      })
      .catch(() => toast.error("Could not load presets"))
      .finally(() => {
        if (alive) setCatalogLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const selectedAvatar = useMemo(
    () => catalog?.avatars.find((preset) => preset.key === avatarKey),
    [avatarKey, catalog],
  );
  const selectedBanner = useMemo(
    () => catalog?.banners.find((preset) => preset.key === bannerKey),
    [bannerKey, catalog],
  );

  function updateSocial(key: SocialKey, value: string) {
    setSocials((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    const nextSocials = { ...(profile.socials ?? {}) };
    for (const field of socialFields) {
      const value = socials[field.key].trim();
      if (value) nextSocials[field.key] = value;
      else delete nextSocials[field.key];
    }

    setSaving(true);
    try {
      const { ok, data } = await authApi.updateProfile({
        description: bio,
        avatarKey: avatarKey || null,
        bannerKey: bannerKey || null,
        socials: nextSocials,
      });

      if (!ok) {
        toast.error("Could not save profile", { description: data.error });
        return;
      }

      toast.success("Profile saved");
      await refreshProfile();
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !profile || catalogLoading) {
    return (
      <main className="relative z-10 flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-10 text-foreground md:min-h-[calc(100vh-4rem)]">
        <Spinner label="Loading profile" />
      </main>
    );
  }

  return (
    <main className="relative z-10 min-h-[calc(100vh-3.5rem)] px-4 py-8 text-foreground md:min-h-[calc(100vh-4rem)] md:px-8">
      <form className="mx-auto grid w-full max-w-6xl gap-6" onSubmit={save}>
        <Card className="overflow-hidden border-border bg-card/90 text-card-foreground">
          <div className="relative h-44 bg-muted md:h-56">
            {selectedBanner ? (
              <img src={imageUrl(selectedBanner)} alt="" className="h-full w-full object-cover" decoding="async" />
            ) : (
              <div className="h-full w-full bg-background/70" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/85 to-transparent" />
            <div className="absolute -bottom-10 left-6 h-24 w-24 overflow-hidden border-4 border-background bg-muted shadow-xl md:left-8 md:h-28 md:w-28">
              {selectedAvatar ? (
                <img src={imageUrl(selectedAvatar)} alt="" className="h-full w-full object-cover" decoding="async" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-primary text-3xl text-muted-foreground">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <CardHeader className="pt-14 md:pt-16">
            <CardTitle>{profile.displayName}</CardTitle>
            <CardDescription>{profile.photonUserId}</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Card className="border-border bg-card/90 text-card-foreground">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="profile-bio">Bio</Label>
                <Textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={512} rows={7} />
                <span className="block text-right text-xs text-muted-foreground">{bio.length}/512</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {socialFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={`profile-social-${field.key}`}>{field.label}</Label>
                    <Input
                      id={`profile-social-${field.key}`}
                      type={field.type}
                      value={socials[field.key]}
                      onChange={(event) => updateSocial(field.key, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/90 text-card-foreground">
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid max-h-[24rem] grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-3 overflow-y-auto pr-1">
                {catalog?.avatars.map((preset) => (
                  <PresetButton
                    key={preset.key}
                    preset={preset}
                    selected={avatarKey === preset.key}
                    className="aspect-square"
                    onSelect={setAvatarKey}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card/90 text-card-foreground">
          <CardHeader>
            <CardTitle>Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catalog?.banners.map((preset) => (
                <PresetButton
                  key={preset.key}
                  preset={preset}
                  selected={bannerKey === preset.key}
                  className="aspect-[16/7]"
                  onSelect={setBannerKey}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 z-10 flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </main>
  );
}
