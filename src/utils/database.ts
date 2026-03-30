function hasCode23505(value: unknown): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    "code" in value &&
    (value as { code: string }).code === "23505"
  );
}

export function isUniqueViolation(error: unknown): boolean {
  if (hasCode23505(error)) return true;

  if (
    error !== null &&
    typeof error === "object" &&
    "cause" in error &&
    hasCode23505((error as { cause: unknown }).cause)
  ) {
    return true;
  }

  return false;
}
