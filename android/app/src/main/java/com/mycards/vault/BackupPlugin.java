package com.mycards.vault;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.UriPermission;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Saves the already-encrypted backup file into a folder the person picks (Storage Access Framework).
 * Nothing but the encrypted file is written, and the app only keeps permission for that one folder.
 */
@CapacitorPlugin(name = "AutoBackup")
public class BackupPlugin extends Plugin {
    private static final String PREFS = "vaultly_backup";
    private static final String KEY = "tree";

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, 0);
    }

    private static String folderName(Uri tree) {
        try {
            String id = DocumentsContract.getTreeDocumentId(tree);
            int i = id.indexOf(':');
            String n = i >= 0 ? id.substring(i + 1) : id;
            return n.isEmpty() ? "Storage root" : n;
        } catch (Exception e) {
            return "Folder chosen";
        }
    }

    @PluginMethod
    public void choose(PluginCall call) {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION
                | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                | Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);
        startActivityForResult(call, i, "picked");
    }

    @ActivityCallback
    private void picked(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent data = result.getData();
        if (result.getResultCode() != Activity.RESULT_OK || data == null || data.getData() == null) {
            call.reject("cancelled");
            return;
        }
        Uri tree = data.getData();
        try {
            getContext().getContentResolver().takePersistableUriPermission(tree,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            prefs().edit().putString(KEY, tree.toString()).apply();
            JSObject o = new JSObject();
            o.put("set", true);
            o.put("name", folderName(tree));
            call.resolve(o);
        } catch (Exception e) {
            call.reject("Could not keep access to that folder");
        }
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject o = new JSObject();
        String t = prefs().getString(KEY, null);
        boolean ok = false;
        if (t != null) {
            Uri tree = Uri.parse(t);
            for (UriPermission p : getContext().getContentResolver().getPersistedUriPermissions()) {
                if (p.getUri().equals(tree) && p.isWritePermission()) ok = true;
            }
            if (ok) o.put("name", folderName(tree));
        }
        o.put("set", ok);
        call.resolve(o);
    }

    @PluginMethod
    public void write(PluginCall call) {
        String t = prefs().getString(KEY, null);
        String name = call.getString("name");
        String data = call.getString("data");
        int keep = call.getInt("keep", 7);
        if (t == null || name == null || data == null) {
            call.reject("No folder chosen");
            return;
        }
        try {
            Uri tree = Uri.parse(t);
            ContentResolver cr = getContext().getContentResolver();
            String treeId = DocumentsContract.getTreeDocumentId(tree);
            Uri parent = DocumentsContract.buildDocumentUriUsingTree(tree, treeId);
            Uri doc = DocumentsContract.createDocument(cr, parent, "application/octet-stream", name);
            if (doc == null) {
                call.reject("Could not create the file");
                return;
            }
            OutputStream os = cr.openOutputStream(doc);
            if (os == null) {
                call.reject("Could not open the file");
                return;
            }
            try {
                os.write(data.getBytes(StandardCharsets.UTF_8));
            } finally {
                os.close();
            }
            prune(cr, tree, treeId, keep);
            call.resolve();
        } catch (Exception e) {
            call.reject("Write failed: folder unavailable");
        }
    }

    private static class Item {
        String id;
        long mod;
    }

    private void prune(ContentResolver cr, Uri tree, String treeId, int keep) {
        Cursor c = null;
        try {
            Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, treeId);
            c = cr.query(children, new String[]{
                    DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                    DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                    DocumentsContract.Document.COLUMN_LAST_MODIFIED}, null, null, null);
            List<Item> files = new ArrayList<>();
            while (c != null && c.moveToNext()) {
                String n = c.getString(1);
                if (n != null && n.startsWith("vaultly-backup-") && n.endsWith(".cvault")) {
                    Item it = new Item();
                    it.id = c.getString(0);
                    it.mod = c.getLong(2);
                    files.add(it);
                }
            }
            Collections.sort(files, (a, b) -> Long.compare(b.mod, a.mod));
            for (int i = Math.max(1, keep); i < files.size(); i++) {
                DocumentsContract.deleteDocument(cr, DocumentsContract.buildDocumentUriUsingTree(tree, files.get(i).id));
            }
        } catch (Exception ignored) {
        } finally {
            if (c != null) c.close();
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        String t = prefs().getString(KEY, null);
        if (t != null) {
            try {
                getContext().getContentResolver().releasePersistableUriPermission(Uri.parse(t),
                        Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            } catch (Exception ignored) {
            }
        }
        prefs().edit().clear().apply();
        call.resolve();
    }
}
