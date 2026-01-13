import { api } from "@/lib/axios";

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  dateNaissance: string
  country: string
  city: string
  role: "ROLE_TENANT" | "ROLE_OWNER" | "ROLE_ADMIN"
  walletAddress?: string
}

export interface LoginData {
  email: string;
  password: string;
}

export const AuthService = {
  register(data: RegisterData) {
    return api.post("/auth/register", data)
  },

  login(email: string, password: string) {
    return api.post("/auth/login", { email, password })
  },
  me() {
    return api.get("/users/me")
  },

  generateWalletMessage(address: string) {
    return api.post(
      `/auth/generate-wallet-message`,
      null,
      { params: { address: address.toLowerCase() } }
    )
  },

  loginWithWallet(payload: {
    address: string
    message: string
    signature: string
  }) {
    return api.post("/auth/login-wallet", payload)
  },

  getMe() {
    return api.get("/auth/me")
  },

  updateProfile(data: Partial<RegisterData>) {
    return api.put("/users/me", data)
  },

  verifyEmail(token: string) {
    return api.get("/auth/verify-email", { params: { token } })
  },
  ChangePassword(oldPassword: string, newPassword: string) {
    return api.post("/auth/change-password", { oldPassword, newPassword });
  }
};