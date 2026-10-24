import { api, toApiError } from "@/lib/axios";
import type {
  CatalogMeta,
  DashboardData,
  Paginated,
  Subscription,
  SubscriptionFilters,
  SubscriptionPayload,
} from "@/types/subscription";

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export async function getSubscriptions(
  filters: SubscriptionFilters = {},
): Promise<Paginated<Subscription>> {
  try {
    const { data } = await api.get<Paginated<Subscription>>("/subscriptions", {
      params: filters,
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getSubscription(id: string): Promise<Subscription> {
  try {
    const { data } = await api.get<{ data: Subscription }>(`/subscriptions/${id}`);
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createSubscription(
  payload: SubscriptionPayload,
): Promise<Subscription> {
  try {
    const { data } = await api.post<{ data: Subscription }>(
      "/subscriptions",
      payload,
    );
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateSubscription(
  id: string,
  payload: Partial<SubscriptionPayload>,
): Promise<Subscription> {
  try {
    const { data } = await api.patch<{ data: Subscription }>(
      `/subscriptions/${id}`,
      payload,
    );
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteSubscription(id: string): Promise<void> {
  try {
    await api.delete(`/subscriptions/${id}`);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function markSubscriptionUsed(id: string): Promise<Subscription> {
  try {
    const { data } = await api.post<{ data: Subscription }>(
      `/subscriptions/${id}/mark-used`,
    );
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getCatalog(): Promise<CatalogMeta> {
  try {
    const { data } = await api.get<{ data: CatalogMeta }>("/subscriptions/meta");
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getDashboard(): Promise<DashboardData> {
  try {
    const { data } = await api.get<{ data: DashboardData }>("/dashboard");
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getUpcomingRenewals(days = 7): Promise<Subscription[]> {
  try {
    const { data } = await api.get<{ data: Subscription[] }>(
      "/dashboard/upcoming-renewals",
      { params: { days } },
    );
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}