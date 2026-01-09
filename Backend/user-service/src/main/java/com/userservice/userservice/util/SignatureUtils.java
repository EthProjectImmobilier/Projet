package com.userservice.userservice.util;

import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;

public class SignatureUtils {

    public static String recoverAddressFromSignature(String message, String signature) {
        try {
            System.out.println("🔍 Debug - Message: " + message);
            System.out.println("🔍 Debug - Signature: " + signature);

            // Message avec préfixe Ethereum
            String ethMessage = "\u0019Ethereum Signed Message:\n" + message.length() + message;

            byte[] messageHash = org.web3j.crypto.Hash.sha3(ethMessage.getBytes(StandardCharsets.UTF_8));

            // Nettoyer la signature
            String cleanSig = signature.startsWith("0x") ? signature.substring(2) : signature;
            byte[] sigBytes = Numeric.hexStringToByteArray(cleanSig);

            if (sigBytes.length < 64 || sigBytes.length > 65) {
                System.err.println("❌ Longueur signature invalide: " + sigBytes.length);
                return null;
            }

            byte[] r = new byte[32];
            byte[] s = new byte[32];
            System.arraycopy(sigBytes, 0, r, 0, 32);
            System.arraycopy(sigBytes, 32, s, 0, 32);

            byte v = sigBytes.length > 64 ? sigBytes[64] : 27; // Default to 27 if not present

            Sign.SignatureData signatureData = new Sign.SignatureData(v, r, s);

            // Essayer les 4 possibilités de recovery id
            for (int i = 0; i < 4; i++) {
                try {
                    Sign.SignatureData data = new Sign.SignatureData((byte)(v + i), r, s);
                    BigInteger publicKey = Sign.signedMessageHashToKey(messageHash, data);
                    String address = "0x" + Keys.getAddress(publicKey);
                    System.out.println("🔍 Tentative " + i + ": " + address);

                    // Vérifier si l'adresse correspond
                    if (isValidAddress(address)) {
                        System.out.println("✅ Adresse valide trouvée: " + address);
                        return address.toLowerCase();
                    }
                } catch (Exception e) {
                    // Continuer avec la prochaine tentative
                }
            }

            return null;

        } catch (Exception e) {
            System.err.println("❌ Erreur: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private static boolean isValidAddress(String address) {
        return address != null && address.matches("^0x[a-fA-F0-9]{40}$");
    }
}
