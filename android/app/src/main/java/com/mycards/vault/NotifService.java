package com.mycards.vault;

import android.content.Context;
import android.content.SharedPreferences;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import org.json.JSONArray;
import org.json.JSONObject;

public class NotifService extends NotificationListenerService {
    private static final String PREFS = "notif_txn";
    private static final String KEY = "queue";
    private static final int MAX = 40;

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            CharSequence t = sbn.getNotification().extras == null ? null : sbn.getNotification().extras.getCharSequence("android.title");
            CharSequence x = sbn.getNotification().extras == null ? null : sbn.getNotification().extras.getCharSequence("android.text");
            String title = t == null ? "" : t.toString();
            String text = x == null ? "" : x.toString();
            if (getPackageName().equals(sbn.getPackageName())) return;
            if (!looksTxn(title, text)) return;
            SharedPreferences sp = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            JSONArray arr;
            try { arr = new JSONArray(sp.getString(KEY, "[]")); } catch (Exception e) { arr = new JSONArray(); }
            JSONObject o = new JSONObject();
            o.put("title", title);
            o.put("text", text);
            o.put("pkg", sbn.getPackageName() == null ? "" : sbn.getPackageName());
            o.put("at", System.currentTimeMillis());
            arr.put(o);
            while (arr.length() > MAX) arr.remove(0);
            sp.edit().putString(KEY, arr.toString()).apply();
        } catch (Exception ignored) { }
    }

    private static boolean looksTxn(String title, String text) {
        String s = (title + " " + text).toLowerCase();
        // never queue one-time passwords or verification codes
        if (s.contains("otp") || s.contains("one time password") || s.contains("one-time password")
            || s.contains("verification code") || s.contains("do not share") || s.contains("cvv")) return false;
        boolean cardAlert = s.contains("card") && (s.contains("dispatch") || s.contains("activat") || s.contains("deliver")
            || s.contains("issued") || s.contains("approved") || s.contains("credit limit") || s.contains("new card"));
        if (cardAlert) return true;
        return s.contains("₹") || s.contains("rs.") || s.contains("rs ") || s.contains("inr")
            || s.contains("spent") || s.contains("debited") || s.contains("transaction")
            || s.contains("purchase") || s.contains("payment");
    }

    static JSONArray drain(Context ctx) {
        SharedPreferences sp = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        try {
            JSONArray arr = new JSONArray(sp.getString(KEY, "[]"));
            sp.edit().putString(KEY, "[]").apply();
            long cut = System.currentTimeMillis() - 7L * 24 * 3600 * 1000;
            JSONArray fresh = new JSONArray();
            for (int i = 0; i < arr.length(); i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o != null && o.optLong("at", 0) > cut) fresh.put(o);
            }
            return fresh;
        } catch (Exception e) { return new JSONArray(); }
    }
}
