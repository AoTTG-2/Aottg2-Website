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
import { FaDiscord, FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiLink } from "react-icons/fi";
import type { IconType } from "react-icons";
import { authApi, authAssetUrl } from "../../auth/api";
import type { ProfilePreset, ProfilePresetCatalog } from "../../auth/types";
import { useAuth } from "../../auth/useAuth";

const MAX_SOCIAL_LINKS = 6;

function imageUrl(preset?: ProfilePreset) {
  return preset ? authAssetUrl(preset.imageUrl) : "";
}

function socialLinksFromProfile(socials?: Record<string, string>) {
  return Object.values(socials ?? {})
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, MAX_SOCIAL_LINKS);
}

function safeSocialUrl(url: string) {
  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

function socialLabel(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, "");
    return `${host}${path}`;
  } catch {
    return url;
  }
}

function socialIcon(url: string): IconType {
  const host = safeSocialUrl(url) ? new URL(url).hostname.replace(/^www\./, "").toLowerCase() : "";
  if (host === "discord.gg" || host.endsWith("discord.com")) return FaDiscord;
  if (host.endsWith("facebook.com") || host === "fb.com") return FaFacebookF;
  if (host.endsWith("instagram.com")) return FaInstagram;
  if (host === "x.com" || host.endsWith("twitter.com")) return FaXTwitter;
  if (host.endsWith("youtube.com") || host === "youtu.be") return FaYoutube;
  return FiLink;
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
  const [socialLinks, setSocialLinks] = useState<string[]>([]);
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
    setSocialLinks(socialLinksFromProfile(profile.socials));
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
  const previewSocialLinks = useMemo(
    () => socialLinks.map((url) => url.trim()).filter(Boolean).slice(0, MAX_SOCIAL_LINKS),
    [socialLinks],
  );

  function updateSocialLink(index: number, value: string) {
    setSocialLinks((current) => current.map((url, currentIndex) => (
      currentIndex === index ? value : url
    )));
  }

  function addSocialLink() {
    setSocialLinks((current) => (
      current.length >= MAX_SOCIAL_LINKS ? current : [...current, ""]
    ));
  }

  function removeSocialLink(index: number) {
    setSocialLinks((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    const nextSocials = Object.fromEntries(
      socialLinks
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, MAX_SOCIAL_LINKS)
        .map((url, index) => [`link${index + 1}`, url]),
    );

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
          <CardHeader className="pt-32 md:min-h-52 md:pt-36">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(12rem,18rem)] md:items-start">
              <div className="min-w-0 space-y-3">
                <CardTitle>{profile.displayName}</CardTitle>
                {bio.trim() ? (
                  <CardDescription className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed">
                    {bio.trim()}
                  </CardDescription>
                ) : null}
              </div>
              {previewSocialLinks.length ? (
                <div className="flex min-w-0 flex-col gap-2 md:items-end">
                  {previewSocialLinks.map((url, index) => {
                    const href = safeSocialUrl(url);
                    const label = socialLabel(url);
                    const Icon = socialIcon(url);
                    return href ? (
                      <a
                        key={`${url}-${index}`}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary"
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{label}</span>
                      </a>
                    ) : (
                      <span key={`${url}-${index}`} className="inline-flex max-w-full items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{label}</span>
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Social URLs</Label>
                  <Button type="button" variant="secondary" size="sm" onClick={addSocialLink} disabled={socialLinks.length >= MAX_SOCIAL_LINKS}>
                    Add URL
                  </Button>
                </div>
                <div className="space-y-3">
                  {socialLinks.map((url, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <Label htmlFor={`profile-social-${index}`} className="sr-only">
                        Social URL {index + 1}
                      </Label>
                      <Input
                        id={`profile-social-${index}`}
                        type="url"
                        value={url}
                        maxLength={256}
                        placeholder="https://example.com"
                        onChange={(event) => updateSocialLink(index, event.target.value)}
                      />
                      <Button type="button" variant="secondary" onClick={() => removeSocialLink(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  {socialLinks.length >= MAX_SOCIAL_LINKS ? (
                    <p className="text-xs text-muted-foreground">Maximum {MAX_SOCIAL_LINKS} URLs.</p>
                  ) : null}
                </div>
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
