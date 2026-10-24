import { api, toApiError } from "@/lib/axios";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";

function unwrap<T>(data: { data: T }): T {
  return data.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<{
      data: AuthResponse;
    }>("/login", payload);
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const { data } = await api.post<{
      data: AuthResponse;
    }>("/register", payload);
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/logout");
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const { data } = await api.get<{ data: User }>("/user");
    return unwrap(data);
  } catch (error) {
    throw toApiError(error);
  }
}