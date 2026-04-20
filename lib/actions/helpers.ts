export function normalizeInput(input: FormData | unknown) {
  if (input instanceof FormData) {
    return Object.fromEntries(input.entries());
  }
  return input;
}
