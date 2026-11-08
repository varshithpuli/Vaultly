package com.mycards.vault;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Switches the launcher icon by enabling one activity-alias and disabling the others. */
@CapacitorPlugin(name = "AppIcon")
public class AppIconPlugin extends Plugin {
    private static final String NS = "com.mycards.vault.";
    private static final String[] NAMES = {"default", "black", "mono", "ice", "rose", "aurora", "sunset", "emerald"};

    private static String cls(String n) {
        return NS + "Icon" + Character.toUpperCase(n.charAt(0)) + n.substring(1);
    }

    @PluginMethod
    public void set(PluginCall call) {
        String name = call.getString("name", "default");
        boolean known = false;
        for (String n : NAMES) if (n.equals(name)) known = true;
        if (!known) {
            call.reject("Unknown icon");
            return;
        }
        PackageManager pm = getContext().getPackageManager();
        String pkg = getContext().getPackageName();
        pm.setComponentEnabledSetting(new ComponentName(pkg, cls(name)), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
        for (String n : NAMES) {
            if (!n.equals(name)) {
                pm.setComponentEnabledSetting(new ComponentName(pkg, cls(n)), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void get(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        String pkg = getContext().getPackageName();
        String active = "default";
        for (String n : NAMES) {
            int st = pm.getComponentEnabledSetting(new ComponentName(pkg, cls(n)));
            if (st == PackageManager.COMPONENT_ENABLED_STATE_ENABLED || (st == PackageManager.COMPONENT_ENABLED_STATE_DEFAULT && n.equals("default"))) {
                active = n;
                if (st == PackageManager.COMPONENT_ENABLED_STATE_ENABLED) break;
            }
        }
        JSObject o = new JSObject();
        o.put("name", active);
        call.resolve(o);
    }
}
