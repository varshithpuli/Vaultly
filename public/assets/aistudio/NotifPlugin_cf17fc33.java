package com.mycards.vault;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NotifTx")
public class NotifPlugin extends Plugin {

    @PluginMethod
    public void status(PluginCall call) {
        Context ctx = getContext();
        ComponentName cn = new ComponentName(ctx, NotifService.class);
        String flat = Settings.Secure.getString(ctx.getContentResolver(), "enabled_notification_listeners");
        JSObject r = new JSObject();
        r.put("granted", flat != null && flat.contains(cn.flattenToString()));
        call.resolve(r);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent i = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        } catch (Exception ignored) { }
        call.resolve();
    }

    @PluginMethod
    public void pull(PluginCall call) {
        JSObject r = new JSObject();
        r.put("items", NotifService.drain(getContext()));
        call.resolve(r);
    }

    @PluginMethod
    public void shared(PluginCall call) {
        JSObject r = new JSObject();
        r.put("text", MainActivity.pendingShare == null ? "" : MainActivity.pendingShare);
        MainActivity.pendingShare = null;
        call.resolve(r);
    }
}
