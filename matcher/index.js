export function scoreJob(description, skills = []) {
  if (!description || skills.length === 0) return 0;

  const descLower = description.toLowerCase();
  const matches = skills.filter(skill => descLower.includes(skill.toLowerCase()));

  return matches.length / skills.length;
}

export class Matcher {
  constructor(preferences = {}) {
    this.preferences = preferences;
  }

  match(job) {
    return false;
  }
}
