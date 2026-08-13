/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.interfaces.IServerListener
 *  net.minecraft.client.server.IntegratedServer
 */
package fi.dy.masa.litematica.event;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.malilib.interfaces.IServerListener;
import net.minecraft.client.server.IntegratedServer;

public class ServerListener
implements IServerListener {
    public void onServerIntegratedSetup(IntegratedServer server) {
        DataManager.getInstance().setHasIntegratedServer(true);
    }
}

