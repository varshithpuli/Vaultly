package com.mycards.vault;

import android.app.Activity;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.IsoDep;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;

/** Reads the card number and expiry from a contactless (EMV) payment card. Never reads the CVV: it is not on the chip. */
@CapacitorPlugin(name = "CardNfc")
public class CardNfcPlugin extends Plugin {
    private PluginCall pending;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        NfcAdapter a = NfcAdapter.getDefaultAdapter(getContext());
        JSObject r = new JSObject();
        r.put("available", a != null);
        r.put("enabled", a != null && a.isEnabled());
        call.resolve(r);
    }

    @PluginMethod
    public void read(PluginCall call) {
        final Activity act = getActivity();
        final NfcAdapter a = NfcAdapter.getDefaultAdapter(act);
        if (a == null || !a.isEnabled()) {
            call.reject("NFC is off or not available on this phone");
            return;
        }
        pending = call;
        final int flags = NfcAdapter.FLAG_READER_NFC_A | NfcAdapter.FLAG_READER_NFC_B | NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK;
        act.runOnUiThread(() -> a.enableReaderMode(act, tag -> handle(tag), flags, null));
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        stopReader();
        PluginCall p = pending;
        pending = null;
        if (p != null) p.reject("cancelled");
        call.resolve();
    }

    private void stopReader() {
        final Activity act = getActivity();
        if (act == null) return;
        act.runOnUiThread(() -> {
            try {
                NfcAdapter a = NfcAdapter.getDefaultAdapter(act);
                if (a != null) a.disableReaderMode(act);
            } catch (Exception ignored) {
            }
        });
    }

    private void handle(Tag tag) {
        IsoDep iso = IsoDep.get(tag);
        if (iso == null) return;
        String err = null;
        JSObject out = null;
        try {
            iso.connect();
            iso.setTimeout(5000);
            out = readCard(iso);
            if (out == null) err = "Could not read the card number. Some banks block contactless reading.";
        } catch (Exception e) {
            err = "Lost contact with the card. Hold it still and try again.";
        } finally {
            try {
                iso.close();
            } catch (Exception ignored) {
            }
        }
        finish(out, err);
    }

    private void finish(JSObject out, String err) {
        PluginCall p = pending;
        pending = null;
        stopReader();
        if (p == null) return;
        if (out != null) p.resolve(out);
        else p.reject(err == null ? "Read failed" : err);
    }

    private JSObject readCard(IsoDep iso) throws Exception {
        List<byte[]> aids = new ArrayList<>();
        byte[] ppse = tx(iso, sel("2PAY.SYS.DDF01".getBytes("US-ASCII")));
        if (ppse != null) walk(ppse, 0, ppse.length, 0x4F, aids);
        String[] fallback = {"A0000000031010", "A0000000041010", "A0000005241010", "A00000002501", "A0000000043060", "A0000001523010"};
        for (String f : fallback) aids.add(hex(f));

        String pan = null, expiry = null, holder = null;
        for (byte[] aid : aids) {
            byte[] fci = tx(iso, sel(aid));
            if (fci == null) continue;
            byte[] pdol = first(fci, 0x9F38);
            byte[] gpoData = pdol == null ? new byte[]{(byte) 0x83, 0x00} : wrap83(pdolData(pdol));
            byte[] cmd = new byte[5 + gpoData.length + 1];
            cmd[0] = (byte) 0x80;
            cmd[1] = (byte) 0xA8;
            cmd[2] = 0x00;
            cmd[3] = 0x00;
            cmd[4] = (byte) gpoData.length;
            System.arraycopy(gpoData, 0, cmd, 5, gpoData.length);
            cmd[cmd.length - 1] = 0x00;
            byte[] gpo = tx(iso, cmd);
            if (gpo == null) continue;

            List<byte[]> pool = new ArrayList<>();
            pool.add(gpo);
            byte[] afl = null;
            if (gpo.length > 2 && (gpo[0] & 0xFF) == 0x77) {
                afl = first(gpo, 0x94);
            } else if (gpo.length > 4 && (gpo[0] & 0xFF) == 0x80) {
                int len = gpo[1] & 0xFF;
                if (len > 2 && 2 + len <= gpo.length) afl = Arrays.copyOfRange(gpo, 4, 2 + len);
            }
            if (afl != null) {
                for (int i = 0; i + 3 < afl.length; i += 4) {
                    int sfi = (afl[i] & 0xFF) >> 3;
                    int from = afl[i + 1] & 0xFF;
                    int to = afl[i + 2] & 0xFF;
                    for (int r = from; r <= to; r++) {
                        byte[] rec = tx(iso, new byte[]{0x00, (byte) 0xB2, (byte) r, (byte) ((sfi << 3) | 4), 0x00});
                        if (rec != null) pool.add(rec);
                    }
                }
            }
            for (byte[] d : pool) {
                byte[] t5a = first(d, 0x5A);
                if (pan == null && t5a != null) pan = bcd(t5a).replaceAll("[^0-9]", "");
                byte[] t57 = first(d, 0x57);
                if (t57 != null) {
                    String t2 = bcd(t57);
                    int dd = t2.indexOf('D');
                    if (dd > 12) {
                        if (pan == null) pan = t2.substring(0, dd).replaceAll("[^0-9]", "");
                        if (expiry == null && t2.length() >= dd + 5) expiry = t2.substring(dd + 3, dd + 5) + "/" + t2.substring(dd + 1, dd + 3);
                    }
                }
                byte[] t24 = first(d, 0x5F24);
                if (t24 != null && expiry == null) {
                    String e = bcd(t24);
                    if (e.length() >= 4) expiry = e.substring(2, 4) + "/" + e.substring(0, 2);
                }
                byte[] t20 = first(d, 0x5F20);
                if (t20 != null && holder == null) {
                    String h = new String(t20, "US-ASCII").trim();
                    if (h.length() > 2 && !h.contains("/") && !h.toUpperCase().startsWith("CARDHOLDER")) holder = h;
                }
            }
            if (pan != null) break;
        }
        if (pan == null || pan.length() < 13 || pan.length() > 19) return null;
        JSObject o = new JSObject();
        o.put("number", pan);
        if (expiry != null) o.put("expiry", expiry);
        if (holder != null) o.put("holder", holder);
        return o;
    }

    /** Sends a command; returns the response data without the status word, or null if the card did not answer 90 00. */
    private byte[] tx(IsoDep iso, byte[] cmd) throws IOException {
        byte[] r = iso.transceive(cmd);
        if (r == null || r.length < 2) return null;
        if ((r[r.length - 2] & 0xFF) != 0x90 || (r[r.length - 1] & 0xFF) != 0x00) return null;
        return Arrays.copyOf(r, r.length - 2);
    }

    private static byte[] sel(byte[] name) {
        byte[] c = new byte[6 + name.length];
        c[0] = 0x00;
        c[1] = (byte) 0xA4;
        c[2] = 0x04;
        c[3] = 0x00;
        c[4] = (byte) name.length;
        System.arraycopy(name, 0, c, 5, name.length);
        c[5 + name.length] = 0x00;
        return c;
    }

    private static byte[] hex(String s) {
        byte[] o = new byte[s.length() / 2];
        for (int i = 0; i < o.length; i++) o[i] = (byte) Integer.parseInt(s.substring(2 * i, 2 * i + 2), 16);
        return o;
    }

    private static String bcd(byte[] b) {
        StringBuilder sb = new StringBuilder();
        for (byte x : b) sb.append(String.format("%02X", x));
        return sb.toString();
    }

    private static byte[] wrap83(byte[] d) {
        byte[] o = new byte[d.length + 2];
        o[0] = (byte) 0x83;
        o[1] = (byte) d.length;
        System.arraycopy(d, 0, o, 2, d.length);
        return o;
    }

    private static byte[] pdolData(byte[] pdol) {
        ByteArrayOutputStream o = new ByteArrayOutputStream();
        int i = 0;
        while (i < pdol.length) {
            int tag = pdol[i] & 0xFF;
            i++;
            if ((tag & 0x1F) == 0x1F && i < pdol.length) {
                tag = (tag << 8) | (pdol[i] & 0xFF);
                i++;
            }
            if (i >= pdol.length) break;
            int len = pdol[i] & 0xFF;
            i++;
            byte[] v = new byte[len];
            if (tag == 0x9F66 && len == 4) {
                v[0] = 0x27;
            } else if ((tag == 0x9F1A || tag == 0x5F2A) && len == 2) {
                v[0] = 0x03;
                v[1] = 0x56;
            } else if (tag == 0x9F37) {
                new SecureRandom().nextBytes(v);
            } else if (tag == 0x9A && len == 3) {
                Calendar c = Calendar.getInstance();
                int yy = c.get(Calendar.YEAR) % 100, mm = c.get(Calendar.MONTH) + 1, dd = c.get(Calendar.DAY_OF_MONTH);
                v[0] = (byte) (((yy / 10) << 4) | (yy % 10));
                v[1] = (byte) (((mm / 10) << 4) | (mm % 10));
                v[2] = (byte) (((dd / 10) << 4) | (dd % 10));
            }
            o.write(v, 0, len);
        }
        return o.toByteArray();
    }

    private static byte[] first(byte[] d, int want) {
        List<byte[]> l = new ArrayList<>();
        walk(d, 0, d.length, want, l);
        return l.isEmpty() ? null : l.get(0);
    }

    /** Walks BER-TLV data and collects the value of every occurrence of the wanted tag, including inside constructed tags. */
    private static void walk(byte[] d, int s, int e, int want, List<byte[]> out) {
        int i = s;
        while (i < e) {
            int b0 = d[i] & 0xFF;
            i++;
            if (b0 == 0x00 || b0 == 0xFF) continue;
            int tag = b0;
            boolean cons = (b0 & 0x20) != 0;
            if ((b0 & 0x1F) == 0x1F) {
                int b;
                do {
                    if (i >= e) return;
                    b = d[i] & 0xFF;
                    i++;
                    tag = (tag << 8) | b;
                } while ((b & 0x80) != 0);
            }
            if (i >= e) return;
            int len = d[i] & 0xFF;
            i++;
            if (len == 0x81) {
                if (i >= e) return;
                len = d[i] & 0xFF;
                i++;
            } else if (len == 0x82) {
                if (i + 1 >= e) return;
                len = ((d[i] & 0xFF) << 8) | (d[i + 1] & 0xFF);
                i += 2;
            }
            if (i + len > e) return;
            if (tag == want) out.add(Arrays.copyOfRange(d, i, i + len));
            if (cons) walk(d, i, i + len, want, out);
            i += len;
        }
    }
}
