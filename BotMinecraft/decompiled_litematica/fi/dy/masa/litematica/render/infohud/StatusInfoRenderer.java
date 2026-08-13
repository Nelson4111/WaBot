/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.util.LayerMode
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.position.LayerRange
 */
package fi.dy.masa.litematica.render.infohud;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.render.infohud.IInfoHudRenderer;
import fi.dy.masa.litematica.render.infohud.RenderPhase;
import fi.dy.masa.litematica.render.infohud.ToolHud;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.util.LayerMode;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.position.LayerRange;
import java.util.ArrayList;
import java.util.List;

public class StatusInfoRenderer
implements IInfoHudRenderer {
    private static final StatusInfoRenderer INSTANCE = new StatusInfoRenderer();
    private boolean overrideEnabled;
    private long lastOverrideTime;
    private long overrideDelay;

    public static void init() {
        ToolHud.getInstance().addInfoHudRenderer(INSTANCE, true);
    }

    public static StatusInfoRenderer getInstance() {
        return INSTANCE;
    }

    public void startOverrideDelay() {
        if (this.shouldOverrideShowStatusHud()) {
            this.lastOverrideTime = System.currentTimeMillis();
            this.overrideEnabled = true;
            this.overrideDelay = 10000L;
        }
    }

    public boolean shouldRenderStatusInfoHud() {
        return this.overrideEnabled || Configs.InfoOverlays.STATUS_INFO_HUD.getBooleanValue();
    }

    @Override
    public boolean getShouldRenderText(RenderPhase phase) {
        return phase == RenderPhase.POST && this.shouldRenderStatusInfoHud();
    }

    @Override
    public List<String> getText(RenderPhase phase) {
        ArrayList<String> lines = new ArrayList<String>();
        String g = GuiBase.TXT_GREEN;
        String red = GuiBase.TXT_RED;
        String rst = GuiBase.TXT_RST;
        if (Configs.Generic.EASY_PLACE_MODE.getBooleanValue()) {
            lines.add(StringUtils.translate((String)"litematica.hud.misc.easy_place_mode_enabled", (Object[])new Object[0]));
        } else if (Configs.Generic.PLACEMENT_RESTRICTION.getBooleanValue()) {
            lines.add(StringUtils.translate((String)"litematica.hud.misc.placement_restriction_mode_enabled", (Object[])new Object[0]));
        }
        LayerRange range = DataManager.getRenderLayerRange();
        String strMode = range.getLayerMode().getDisplayName();
        String axisName = range.getAxis().name().toLowerCase();
        String val = range.getCurrentLayerString();
        if (range.getLayerMode() == LayerMode.ALL) {
            lines.add(StringUtils.translate((String)"litematica.hud.misc.render_layer_mode_all", (Object[])new Object[]{g + strMode + rst}));
        } else {
            String strVal = String.format("%s%s = %s%s", g, axisName, val, rst);
            lines.add(StringUtils.translate((String)"litematica.hud.misc.render_layer_mode", (Object[])new Object[]{g + strMode + rst, g + strVal + rst}));
        }
        String strOn = g + StringUtils.translate((String)"litematica.message.value.on", (Object[])new Object[0]) + rst;
        String strOff = red + StringUtils.translate((String)"litematica.message.value.off", (Object[])new Object[0]) + rst;
        String strAll = Configs.Visuals.ENABLE_RENDERING.getBooleanValue() ? strOn : strOff;
        String strSch = Configs.Visuals.ENABLE_SCHEMATIC_RENDERING.getBooleanValue() ? strOn : strOff;
        String strBlk = Configs.Visuals.ENABLE_SCHEMATIC_BLOCKS.getBooleanValue() ? strOn : strOff;
        String strOvl = Configs.Visuals.ENABLE_SCHEMATIC_OVERLAY.getBooleanValue() ? strOn : strOff;
        String strSel = Configs.Visuals.ENABLE_AREA_SELECTION_RENDERING.getBooleanValue() ? strOn : strOff;
        lines.add(StringUtils.translate((String)"litematica.hud.misc.renderer_status", (Object[])new Object[]{strAll, strSch, strBlk, strOvl, strSel}));
        if (DataManager.getSchematicProjectsManager().hasProjectOpen()) {
            lines.add(StringUtils.translate((String)"litematica.hud.schematic_projects_mode", (Object[])new Object[0]));
        }
        if (this.overrideEnabled && System.currentTimeMillis() - this.lastOverrideTime > this.overrideDelay) {
            this.overrideEnabled = false;
        }
        return lines;
    }

    private boolean shouldOverrideShowStatusHud() {
        if (!Configs.InfoOverlays.STATUS_INFO_HUD_AUTO.getBooleanValue()) {
            return false;
        }
        return DataManager.getRenderLayerRange().getLayerMode() != LayerMode.ALL || !Configs.Visuals.ENABLE_RENDERING.getBooleanValue() || !Configs.Visuals.ENABLE_SCHEMATIC_RENDERING.getBooleanValue() || !Configs.Visuals.ENABLE_SCHEMATIC_BLOCKS.getBooleanValue() || !Configs.Visuals.ENABLE_SCHEMATIC_OVERLAY.getBooleanValue() || !Configs.Visuals.ENABLE_AREA_SELECTION_RENDERING.getBooleanValue();
    }
}

