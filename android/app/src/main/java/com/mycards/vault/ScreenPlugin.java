package com.mycards.vault;

import android.view.WindowManager;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Screen")
public class ScreenPlugin extends Plugin {
    @PluginMethod
    public void setSecure(PluginCall call) {
        final boolean secure = Boolean.TRUE.equals(call.getBoolean("secure", true));
        getActivity().runOnUiThread(() -> {
            if (secure) getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
            else getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
            call.resolve();
        });
    }
}
