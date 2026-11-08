package com.mycards.vault;

import android.content.SharedPreferences;
import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyPermanentlyInvalidatedException;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Hardware-bound biometric unlock. The master password is encrypted with an AES key that lives in the Android
 * Keystore and can only be used right after a strong biometric match (fingerprint, or face on phones that class it
 * as strong). The key is destroyed by Android when a new fingerprint is added.
 */
@CapacitorPlugin(name = "BioVault")
public class BioVaultPlugin extends Plugin {
    private static final String ALIAS = "vaultly_bio_key";
    private static final String PREFS = "vaultly_bio";
    private static final int AUTH = BiometricManager.Authenticators.BIOMETRIC_STRONG;

    private interface Done {
        void ok(Cipher cipher) throws Exception;
    }

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, 0);
    }

    private static String b64(byte[] b) {
        return Base64.encodeToString(b, Base64.NO_WRAP);
    }

    @PluginMethod
    public void available(PluginCall call) {
        int r = BiometricManager.from(getContext()).canAuthenticate(AUTH);
        JSObject o = new JSObject();
        o.put("available", r == BiometricManager.BIOMETRIC_SUCCESS);
        call.resolve(o);
    }

    @PluginMethod
    public void enroll(final PluginCall call) {
        final String secret = call.getString("secret");
        if (secret == null || secret.isEmpty()) {
            call.reject("No secret");
            return;
        }
        try {
            deleteKey();
            SecretKey key = createKey();
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.ENCRYPT_MODE, key);
            prompt(call, c, "Turn on biometric unlock", cipher -> {
                byte[] ct = cipher.doFinal(secret.getBytes(StandardCharsets.UTF_8));
                prefs().edit().putString("iv", b64(cipher.getIV())).putString("ct", b64(ct)).apply();
                call.resolve();
            });
        } catch (Exception e) {
            call.reject("Biometric setup failed");
        }
    }

    @PluginMethod
    public void unlock(final PluginCall call) {
        try {
            String iv = prefs().getString("iv", null);
            String ct = prefs().getString("ct", null);
            if (iv == null || ct == null) {
                call.reject("not_enrolled");
                return;
            }
            KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
            ks.load(null);
            SecretKey key = (SecretKey) ks.getKey(ALIAS, null);
            if (key == null) {
                wipe();
                call.reject("invalidated");
                return;
            }
            Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, Base64.decode(iv, Base64.NO_WRAP)));
            final byte[] ctb = Base64.decode(ct, Base64.NO_WRAP);
            prompt(call, c, "Unlock Vaultly", cipher -> {
                byte[] pt = cipher.doFinal(ctb);
                JSObject o = new JSObject();
                o.put("secret", new String(pt, StandardCharsets.UTF_8));
                call.resolve(o);
            });
        } catch (KeyPermanentlyInvalidatedException e) {
            wipe();
            call.reject("invalidated");
        } catch (Exception e) {
            call.reject("Biometric unlock failed");
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        wipe();
        call.resolve();
    }

    private void wipe() {
        try {
            deleteKey();
        } catch (Exception ignored) {
        }
        prefs().edit().clear().apply();
    }

    private void deleteKey() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if (ks.containsAlias(ALIAS)) ks.deleteEntry(ALIAS);
    }

    private SecretKey createKey() throws Exception {
        KeyGenerator kg = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        KeyGenParameterSpec.Builder b = new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .setUserAuthenticationRequired(true)
                .setInvalidatedByBiometricEnrollment(true);
        if (Build.VERSION.SDK_INT >= 30) {
            b.setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG);
        } else {
            b.setUserAuthenticationValidityDurationSeconds(-1);
        }
        kg.init(b.build());
        return kg.generateKey();
    }

    private void prompt(final PluginCall call, final Cipher cipher, final String title, final Done done) {
        final AppCompatActivity act = getActivity();
        act.runOnUiThread(() -> {
            BiometricPrompt.PromptInfo info = new BiometricPrompt.PromptInfo.Builder()
                    .setTitle(title)
                    .setNegativeButtonText("Use password")
                    .setAllowedAuthenticators(AUTH)
                    .build();
            BiometricPrompt bp = new BiometricPrompt(act, ContextCompat.getMainExecutor(act), new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                    try {
                        done.ok(result.getCryptoObject().getCipher());
                    } catch (Exception e) {
                        call.reject("Biometric failed");
                    }
                }

                @Override
                public void onAuthenticationError(int code, @NonNull CharSequence msg) {
                    call.reject("cancelled");
                }
            });
            bp.authenticate(info, new BiometricPrompt.CryptoObject(cipher));
        });
    }
}
