const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || "API request failed");
  }

  return res.json();
}

export async function sendChatMessage(
  message: string,
  sessionId: string,
  customerEmail?: string
) {
  return fetchAPI<{ message: string; sessionId: string }>("/api/chat/message", {
    method: "POST",
    body: JSON.stringify({ message, sessionId, customerEmail }),
  });
}

export async function getAvailability(date: string) {
  return fetchAPI<{ slots: { time: string; available: boolean }[] }>(
    `/api/booking/availability?date=${date}`
  );
}

export async function createBooking(data: {
  serviceType: string;
  scheduledAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}) {
  return fetchAPI("/api/booking/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getHealthCheck() {
  return fetchAPI<{ status: string; timestamp: string }>("/health");
}
