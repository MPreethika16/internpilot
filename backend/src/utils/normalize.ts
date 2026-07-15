export function normalizeInlineText(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  return normalized.length > 0 ? normalized : null;
}

export function normalizeMultilineText(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, lines) => {
      const isBlank = line.length === 0;
      const previousIsBlank = index > 0 && lines[index - 1].length === 0;

      return !(isBlank && previousIsBlank);
    })
    .join("\n")
    .trim();

  return normalized.length > 0 ? normalized : null;
}

export function normalizeStringArray(
  values: string[] | null | undefined,
): string[] {
  if (!values) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) => normalizeInlineText(value))
        .filter((value): value is string => value !== null),
    ),
  ).sort((first, second) => first.localeCompare(second));
}