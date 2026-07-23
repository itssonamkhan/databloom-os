export const RESUME_STORAGE_KEY = "databloom-resume-builder-v1";
export const RESUME_UPDATED_EVENT = "databloom:resume-updated";

export const resumeSectionOrder = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
  "links",
] as const;

export type ResumeSectionId = (typeof resumeSectionOrder)[number];

export type ResumePersonalDetails = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
};

export type ResumeEducation = {
  id: string;
  institution: string;
  qualification: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
};

export type ResumeExperience = {
  id: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string;
};

export type ResumeProject = {
  id: string;
  name: string;
  tools: string;
  link: string;
  bullets: string;
};

export type ResumeCertification = {
  id: string;
  name: string;
  provider: string;
  date: string;
  credentialLink: string;
};

export type ResumeAchievement = {
  id: string;
  title: string;
  date: string;
  details: string;
};

export type ResumeLink = {
  id: string;
  label: string;
  url: string;
};

export type ResumeDocument = {
  version: 1;
  updatedAt: string;
  personal: ResumePersonalDetails;
  summary: string;
  skills: string[];
  education: ResumeEducation[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  achievements: ResumeAchievement[];
  links: ResumeLink[];
  sectionOrder: ResumeSectionId[];
};

export type ResumeStrengthItem = {
  id: string;
  label: string;
  complete: boolean;
};

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createResumeEducation(): ResumeEducation {
  return {
    id: createId("education"),
    institution: "",
    qualification: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
    details: "",
  };
}

export function createResumeExperience(): ResumeExperience {
  return {
    id: createId("experience"),
    organization: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    bullets: "",
  };
}

export function createResumeProject(): ResumeProject {
  return {
    id: createId("project"),
    name: "",
    tools: "",
    link: "",
    bullets: "",
  };
}

export function createResumeCertification(): ResumeCertification {
  return {
    id: createId("certification"),
    name: "",
    provider: "",
    date: "",
    credentialLink: "",
  };
}

export function createResumeAchievement(): ResumeAchievement {
  return {
    id: createId("achievement"),
    title: "",
    date: "",
    details: "",
  };
}

export function createResumeLink(label = ""): ResumeLink {
  return {
    id: createId("link"),
    label,
    url: "",
  };
}

export function createEmptyResume(): ResumeDocument {
  return {
    version: 1,
    updatedAt: "",
    personal: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
    },
    summary: "",
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    links: [createResumeLink("LinkedIn"), createResumeLink("GitHub")],
    sectionOrder: [...resumeSectionOrder],
  };
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function entryList<T>(
  value: unknown,
  normalize: (entry: Record<string, unknown>) => T | null,
) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => normalize(objectValue(entry)))
    .filter((entry): entry is T => entry !== null);
}

function normalizeResume(value: unknown): ResumeDocument {
  const stored = objectValue(value);
  const personal = objectValue(stored.personal);
  const storedOrder = stringList(stored.sectionOrder).filter(
    (id): id is ResumeSectionId =>
      resumeSectionOrder.includes(id as ResumeSectionId),
  );
  const sectionOrder = [
    ...new Set([...storedOrder, ...resumeSectionOrder]),
  ] as ResumeSectionId[];

  return {
    version: 1,
    updatedAt: text(stored.updatedAt),
    personal: {
      fullName: text(personal.fullName),
      headline: text(personal.headline),
      email: text(personal.email),
      phone: text(personal.phone),
      location: text(personal.location),
    },
    summary: text(stored.summary),
    skills: Array.from(new Set(stringList(stored.skills))),
    education: entryList(stored.education, (entry) =>
      text(entry.id)
        ? {
            id: text(entry.id),
            institution: text(entry.institution),
            qualification: text(entry.qualification),
            field: text(entry.field),
            location: text(entry.location),
            startDate: text(entry.startDate),
            endDate: text(entry.endDate),
            details: text(entry.details),
          }
        : null,
    ),
    experience: entryList(stored.experience, (entry) =>
      text(entry.id)
        ? {
            id: text(entry.id),
            organization: text(entry.organization),
            role: text(entry.role),
            location: text(entry.location),
            startDate: text(entry.startDate),
            endDate: text(entry.endDate),
            bullets: text(entry.bullets),
          }
        : null,
    ),
    projects: entryList(stored.projects, (entry) =>
      text(entry.id)
        ? {
            id: text(entry.id),
            name: text(entry.name),
            tools: text(entry.tools),
            link: text(entry.link),
            bullets: text(entry.bullets),
          }
        : null,
    ),
    certifications: entryList(stored.certifications, (entry) =>
      text(entry.id)
        ? {
            id: text(entry.id),
            name: text(entry.name),
            provider: text(entry.provider),
            date: text(entry.date),
            credentialLink: text(entry.credentialLink),
          }
        : null,
    ),
    achievements: entryList(stored.achievements, (entry) =>
      text(entry.id)
        ? {
            id: text(entry.id),
            title: text(entry.title),
            date: text(entry.date),
            details: text(entry.details),
          }
        : null,
    ),
    links: entryList(stored.links, (entry) =>
      text(entry.id)
        ? {
            id: text(entry.id),
            label: text(entry.label),
            url: text(entry.url),
          }
        : null,
    ),
    sectionOrder,
  };
}

export function loadResume(): ResumeDocument {
  if (typeof window === "undefined") return createEmptyResume();
  try {
    const stored = window.localStorage.getItem(RESUME_STORAGE_KEY);
    return stored ? normalizeResume(JSON.parse(stored)) : createEmptyResume();
  } catch {
    return createEmptyResume();
  }
}

export function saveResume(resume: ResumeDocument) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resume));
    window.dispatchEvent(
      new CustomEvent(RESUME_UPDATED_EVENT, { detail: { resume } }),
    );
    return true;
  } catch {
    return false;
  }
}

export function getResumeStrength(resume: ResumeDocument) {
  const hasContact =
    Boolean(resume.personal.fullName.trim()) &&
    Boolean(resume.personal.email.trim() || resume.personal.phone.trim());
  const items: ResumeStrengthItem[] = [
    { id: "contact", label: "Name and contact method", complete: hasContact },
    {
      id: "headline",
      label: "Role-focused headline",
      complete: Boolean(resume.personal.headline.trim()),
    },
    {
      id: "summary",
      label: "Professional summary",
      complete: resume.summary.trim().length >= 40,
    },
    {
      id: "skills",
      label: "At least three relevant skills",
      complete: resume.skills.filter((skill) => skill.trim()).length >= 3,
    },
    {
      id: "education",
      label: "Education details",
      complete: resume.education.some(
        (item) => item.institution.trim() && item.qualification.trim(),
      ),
    },
    {
      id: "evidence",
      label: "Project or experience evidence",
      complete:
        resume.projects.some((item) => item.name.trim() && item.bullets.trim()) ||
        resume.experience.some(
          (item) => item.organization.trim() && item.bullets.trim(),
        ),
    },
    {
      id: "links",
      label: "At least one professional link",
      complete: resume.links.some((item) => item.url.trim()),
    },
    {
      id: "details",
      label: "Bullets include specific outcomes",
      complete: [...resume.projects, ...resume.experience].some((item) =>
        /\d|%|improv|reduc|increas|automat|deliver/i.test(item.bullets),
      ),
    },
  ];
  const completed = items.filter((item) => item.complete).length;
  return {
    items,
    completed,
    total: items.length,
    percentage: Math.round((completed / items.length) * 100),
  };
}
