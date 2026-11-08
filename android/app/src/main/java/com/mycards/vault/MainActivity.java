package com.mycards.vault;

import android.content.Intent;
import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    /** Text shared to Vaultly from another app (for example an SMS or email about a new card). Read once by the web layer. */
    public static String pendingShare = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ScreenPlugin.class);
        registerPlugin(CardNfcPlugin.class);
        registerPlugin(BioVaultPlugin.class);
        registerPlugin(BackupPlugin.class);
        registerPlugin(AppIconPlugin.class);
        registerPlugin(NotifPlugin.class);
        // Secure by default; the in-app "Allow screenshots" setting can lift this after launch
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
        super.onCreate(savedInstanceState);
        grabShare(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        grabShare(intent);
    }

    private static void grabShare(Intent i) {
        if (i == null || !Intent.ACTION_SEND.equals(i.getAction()) || !"text/plain".equals(i.getType())) return;
        String t = i.getStringExtra(Intent.EXTRA_TEXT);
        if (t != null && !t.isEmpty()) pendingShare = t.length() > 4000 ? t.substring(0, 4000) : t;
    }
}
