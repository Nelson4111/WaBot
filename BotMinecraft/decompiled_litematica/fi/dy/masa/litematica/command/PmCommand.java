/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.interfaces.IClientCommandListener
 *  fi.dy.masa.malilib.util.StringUtils
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.components.ChatComponent
 *  net.minecraft.world.level.ChunkPos
 */
package fi.dy.masa.litematica.command;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.malilib.interfaces.IClientCommandListener;
import fi.dy.masa.malilib.util.StringUtils;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.components.ChatComponent;
import net.minecraft.world.level.ChunkPos;

public class PmCommand
implements IClientCommandListener {
    public static final String PREFIX = "litematica.pm_command";

    public String getCommand() {
        return "#pm";
    }

    public boolean execute(List<String> args, Minecraft mc) {
        if (mc.getCameraEntity() == null) {
            return false;
        }
        ArrayList<String> list = new ArrayList<String>(args);
        ChunkPos camPos = mc.getCameraEntity().chunkPosition();
        ChatComponent chat = mc.gui.hud.getChat();
        list.removeFirst();
        if (!list.isEmpty()) {
            String sub = (String)list.getFirst();
            if (!sub.isEmpty()) {
                list.removeFirst();
                if (sub.equalsIgnoreCase("ci")) {
                    return this.processChunkDebug(list, camPos, chat);
                }
                if (sub.equalsIgnoreCase("rb")) {
                    return this.processChunkRebuild(list, camPos, chat);
                }
                if (sub.equalsIgnoreCase("help")) {
                    return this.processHelp(chat);
                }
                return this.processInvalid(chat);
            }
            return this.processChunkDebug(list, camPos, chat);
        }
        return this.processChunkDebug(list, camPos, chat);
    }

    private boolean processInvalid(ChatComponent chat) {
        chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.invalid_other", (Object[])new Object[0]));
        return true;
    }

    private boolean processHelp(ChatComponent chat) {
        chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.help", (Object[])new Object[0]));
        return true;
    }

    private boolean processChunkDebug(List<String> args, ChunkPos camPos, ChatComponent chat) {
        if (args.size() >= 2) {
            String x = args.get(0);
            String z = args.get(1);
            try {
                int cx = Integer.parseInt(x);
                int cz = Integer.parseInt(z);
                DataManager.getSchematicPlacementManager().displayChunkDebugCmd(cx, cz, chat);
            }
            catch (NumberFormatException e) {
                chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.invalid_args", (Object[])new Object[0]));
            }
        } else {
            DataManager.getSchematicPlacementManager().displayChunkDebugCmd(camPos.x(), camPos.z(), chat);
        }
        return true;
    }

    private boolean processChunkRebuild(List<String> args, ChunkPos camPos, ChatComponent chat) {
        if (args.size() >= 2) {
            String x = args.get(0);
            String z = args.get(1);
            try {
                int cx = Integer.parseInt(x);
                int cz = Integer.parseInt(z);
                DataManager.getSchematicPlacementManager().markChunkForRebuildCmd(cx, cz, chat);
            }
            catch (NumberFormatException e) {
                chat.addClientSystemMessage(StringUtils.translateAsText((String)"litematica.pm_command.invalid_args", (Object[])new Object[0]));
            }
        } else {
            DataManager.getSchematicPlacementManager().markChunkForRebuildCmd(camPos.x(), camPos.z(), chat);
        }
        return true;
    }
}

