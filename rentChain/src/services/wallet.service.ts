import { api } from "@/lib/axios";

export const WalletService = {
  generateWalletMessage(address: string): Promise<string> {
    return api.post(
      `/auth/generate-wallet-message`,
      null,
      { params: { address } }
    ).then(res => res.data);
  },

  verifyWallet(payload: {
    address: string;
    signature: string;
  }) {
    return api.post("/auth/verify-wallet", payload);
  },

  associateWallet(address: string) {
    return api.post("/auth/associate-wallet", { address });
  },

  loginWithWallet(payload: {
    address: string;
    message: string;
    signature: string;
  }) {
    return api.post("/auth/login-wallet", payload);
  }
};