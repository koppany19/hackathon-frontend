export function normalizeUser(raw) {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    profileImage: raw.profile_image ?? null,
    xp: raw.xp ?? 0,
    streak: raw.streak ?? null,
    level: raw.level
      ? {
          current: raw.level.current,
          currentXp: raw.level.current_xp,
          nextLevelXp: raw.level.next_level_xp,
          xpToNext: raw.level.xp_to_next,
        }
      : null,
    university: raw.university
      ? { id: raw.university.id, name: raw.university.name }
      : null,
    city: raw.city
      ? { id: raw.city.id, name: raw.city.name }
      : null,
    profile: raw.profile
      ? {
          food: raw.profile.food ?? {},
          sports: raw.profile.sports ?? {},
          social: raw.profile.social ?? {},
          sportFrequency: raw.profile.sport_frequency ?? null,
        }
      : null,
    scheduleItems: raw.schedule_items ?? [],
  };
}
