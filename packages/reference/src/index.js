// Shared "reference" package consumed by both apps via `workspace:`.
// All data is mocked — this exists only to exercise workspace resolution.

export const SERVICE_NAME = "unkey-railpack-test";

const mockKeys = [
  { id: "key_001", name: "production", enabled: true, requests: 1042 },
  { id: "key_002", name: "staging", enabled: true, requests: 87 },
  { id: "key_003", name: "revoked", enabled: false, requests: 0 },
];

export function listKeys() {
  return mockKeys.map((k) => ({ ...k }));
}

export function verifyKey(id) {
  const key = mockKeys.find((k) => k.id === id);
  return {
    valid: Boolean(key && key.enabled),
    key: key ? { ...key } : null,
  };
}

export function greeting() {
  return `Hello from ${SERVICE_NAME}`;
}
