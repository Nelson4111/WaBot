/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.config.HudAlignment
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  net.minecraft.core.BlockPos
 *  net.minecraft.core.Direction
 *  net.minecraft.core.Vec3i
 *  net.minecraft.world.InteractionHand
 *  net.minecraft.world.entity.LivingEntity
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.render.infohud;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.data.EntityDataManager;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.render.infohud.StatusInfoRenderer;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.placement.SubRegionPlacement;
import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.schematic.projects.SchematicVersion;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.Box;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.selection.SelectionMode;
import fi.dy.masa.litematica.tool.ToolMode;
import fi.dy.masa.litematica.tool.ToolModeData;
import fi.dy.masa.litematica.util.EntityUtils;
import fi.dy.masa.litematica.util.PasteLayerBehavior;
import fi.dy.masa.litematica.util.PositionUtils;
import fi.dy.masa.litematica.util.ReplaceBehavior;
import fi.dy.masa.malilib.config.HudAlignment;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.game.BlockUtils;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.Vec3i;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.state.BlockState;

public class ToolHud
extends InfoHud {
    private static final ToolHud INSTANCE = new ToolHud();
    public static final Date DATE = new Date();
    public static final SimpleDateFormat SIMPLE_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    protected ToolHud() {
    }

    public static ToolHud getInstance() {
        return INSTANCE;
    }

    @Override
    protected boolean shouldRender() {
        return true;
    }

    protected boolean hasEnabledTool() {
        return Configs.Generic.TOOL_ITEM_ENABLED.getBooleanValue() && EntityUtils.hasToolItem((LivingEntity)this.mc.player);
    }

    @Override
    protected HudAlignment getHudAlignment() {
        return (HudAlignment)Configs.InfoOverlays.TOOL_HUD_ALIGNMENT.getOptionListValue();
    }

    @Override
    protected double getScaleFactor() {
        return Configs.InfoOverlays.TOOL_HUD_SCALE.getDoubleValue();
    }

    @Override
    protected int getOffsetX() {
        return Configs.InfoOverlays.TOOL_HUD_OFFSET_X.getIntegerValue();
    }

    @Override
    protected int getOffsetY() {
        return Configs.InfoOverlays.TOOL_HUD_OFFSET_Y.getIntegerValue();
    }

    @Override
    protected void updateHudText() {
        Object str;
        String green = GuiBase.TXT_GREEN;
        String rst = GuiBase.TXT_RST;
        boolean hasTool = this.hasEnabledTool();
        List lines = this.lineList;
        if (hasTool && DataManager.getSchematicProjectsManager().hasProjectOpen()) {
            String subRegionName;
            Object str2;
            SchematicProject project = DataManager.getSchematicProjectsManager().getCurrentProject();
            lines.add(StringUtils.translate((String)"litematica.hud.schematic_projects.project_name", (Object[])new Object[]{green + project.getName() + rst}));
            SchematicVersion version = project.getCurrentVersion();
            if (version != null) {
                lines.add(StringUtils.translate((String)"litematica.hud.schematic_projects.current_version", (Object[])new Object[]{green + version.getVersion() + rst, green + project.getVersionCount() + rst, green + version.getName() + rst}));
                DATE.setTime(version.getTimeStamp());
                lines.add(StringUtils.translate((String)"litematica.hud.schematic_projects.current_version_date", (Object[])new Object[]{green + SIMPLE_DATE_FORMAT.format(DATE) + rst}));
                BlockPos o = project.getOrigin();
                str2 = String.format("%d, %d, %d", o.getX(), o.getY(), o.getZ());
                lines.add(StringUtils.translate((String)"litematica.hud.schematic_projects.origin", (Object[])new Object[]{green + (String)str2 + rst}));
            } else {
                lines.add(StringUtils.translate((String)"litematica.hud.schematic_projects.no_versions", (Object[])new Object[0]));
            }
            SelectionManager sm = DataManager.getSelectionManager();
            AreaSelection selection = sm.getCurrentSelection();
            if (selection != null && sm.getSelectionMode() == SelectionMode.NORMAL && (subRegionName = selection.getCurrentSubRegionBoxName()) != null) {
                lines.add(StringUtils.translate((String)"litematica.hud.area_selection.selected_sub_region", (Object[])new Object[]{green + subRegionName + rst}));
            }
            str2 = green + Configs.Generic.SELECTION_CORNERS_MODE.getOptionListValue().getDisplayName() + rst;
            lines.add(StringUtils.translate((String)"litematica.hud.area_selection.selection_corners_mode", (Object[])new Object[]{str2}));
            if (!StatusInfoRenderer.getInstance().shouldRenderStatusInfoHud()) {
                lines.add(StringUtils.translate((String)"litematica.hud.schematic_projects_mode", (Object[])new Object[0]));
            }
            return;
        }
        ToolMode mode = DataManager.getToolMode();
        String orange = GuiBase.TXT_GOLD;
        String red = GuiBase.TXT_RED;
        String white = GuiBase.TXT_WHITE;
        String aqua = GuiBase.TXT_AQUA;
        String strYes = green + StringUtils.translate((String)"litematica.label.yes", (Object[])new Object[0]) + rst;
        String strNo = GuiBase.TXT_RED + StringUtils.translate((String)"litematica.label.no", (Object[])new Object[0]) + rst;
        if (hasTool && mode == ToolMode.DELETE) {
            String strp = ToolModeData.DELETE.getUsePlacement() ? "litematica.hud.delete.target_mode.placement" : "litematica.hud.delete.target_mode.area";
            lines.add(StringUtils.translate((String)"litematica.hud.delete.target_mode", (Object[])new Object[]{green + StringUtils.translate((String)strp, (Object[])new Object[0]) + rst}));
        }
        if (hasTool && mode.getUsesAreaSelection()) {
            BlockState state;
            SelectionManager sm = DataManager.getSelectionManager();
            AreaSelection selection = sm.getCurrentSelection();
            if (selection != null) {
                String strOr;
                String name = green + selection.getName() + rst;
                if (sm.getSelectionMode() == SelectionMode.NORMAL) {
                    lines.add(StringUtils.translate((String)"litematica.hud.area_selection.selected_area_normal", (Object[])new Object[]{name}));
                } else {
                    lines.add(StringUtils.translate((String)"litematica.hud.area_selection.selected_area_simple", (Object[])new Object[]{name}));
                }
                BlockPos o = selection.getExplicitOrigin();
                if (o == null) {
                    o = selection.getEffectiveOrigin();
                    strOr = StringUtils.translate((String)"litematica.gui.label.origin.auto", (Object[])new Object[0]);
                } else {
                    strOr = StringUtils.translate((String)"litematica.gui.label.origin.manual", (Object[])new Object[0]);
                }
                int count = selection.getAllSubRegionBoxes().size();
                str = String.format("%d, %d, %d %s[%s%s%s]", o.getX(), o.getY(), o.getZ(), rst, orange, strOr, rst);
                String strOrigin = StringUtils.translate((String)"litematica.hud.area_selection.origin", (Object[])new Object[]{green + (String)str + rst});
                String strBoxes = StringUtils.translate((String)"litematica.hud.area_selection.box_count", (Object[])new Object[]{green + count + rst});
                lines.add(strOrigin + " - " + strBoxes);
                String subRegionName = selection.getCurrentSubRegionBoxName();
                Box box = selection.getSelectedSubRegionBox();
                if (subRegionName != null && box != null) {
                    lines.add(StringUtils.translate((String)"litematica.hud.area_selection.selected_sub_region", (Object[])new Object[]{green + subRegionName + rst}));
                    BlockPos p1 = box.getPos1();
                    BlockPos p2 = box.getPos2();
                    if (p1 != null && p2 != null) {
                        BlockPos size = PositionUtils.getAreaSizeFromRelativeEndPositionAbs(p2.subtract((Vec3i)p1));
                        String strDim = green + String.format("%dx%dx%d", size.getX(), size.getY(), size.getZ()) + rst;
                        String strp1 = green + String.format("%d, %d, %d", p1.getX(), p1.getY(), p1.getZ()) + rst;
                        String strp2 = green + String.format("%d, %d, %d", p2.getX(), p2.getY(), p2.getZ()) + rst;
                        lines.add(StringUtils.translate((String)"litematica.hud.area_selection.dimensions_position", (Object[])new Object[]{strDim, strp1, strp2}));
                    }
                }
            }
            if (mode.getUsesBlockPrimary() && (state = mode.getPrimaryBlock()) != null) {
                lines.add(StringUtils.translate((String)"litematica.tool_hud.block_1", (Object[])new Object[]{this.getBlockString(state)}));
            }
            if (mode.getUsesBlockSecondary() && (state = mode.getSecondaryBlock()) != null) {
                lines.add(StringUtils.translate((String)"litematica.tool_hud.block_2", (Object[])new Object[]{this.getBlockString(state)}));
            }
            str = green + Configs.Generic.SELECTION_CORNERS_MODE.getOptionListValue().getDisplayName() + rst;
            lines.add(StringUtils.translate((String)"litematica.hud.area_selection.selection_corners_mode", (Object[])new Object[]{str}));
        } else if ((hasTool || mode == ToolMode.REBUILD) && mode.getUsesSchematic()) {
            SchematicPlacement schematicPlacement = DataManager.getSchematicPlacementManager().getSelectedSchematicPlacement();
            if (schematicPlacement != null) {
                SubRegionPlacement placement;
                ItemStack stack;
                str = StringUtils.translate((String)"litematica.hud.schematic_placement.selected_placement", (Object[])new Object[0]);
                lines.add(String.format("%s: %s%s%s", str, green, schematicPlacement.getName(), rst));
                str = StringUtils.translate((String)"litematica.hud.schematic_placement.sub_region_count", (Object[])new Object[0]);
                int count = schematicPlacement.getSubRegionCount();
                String strCount = String.format("%s: %s%d%s", str, green, count, rst);
                str = StringUtils.translate((String)"litematica.hud.schematic_placement.sub_regions_modified", (Object[])new Object[0]);
                String strTmp = schematicPlacement.isRegionPlacementModified() ? strYes : strNo;
                lines.add(strCount + String.format(" - %s: %s", str, strTmp));
                BlockPos or = schematicPlacement.getOrigin();
                str = String.format("%d, %d, %d", or.getX(), or.getY(), or.getZ());
                lines.add(StringUtils.translate((String)"litematica.hud.area_selection.origin", (Object[])new Object[]{green + (String)str + rst}));
                BlockState state = mode.getPrimaryBlock();
                ItemStack itemStack = stack = this.mc.player != null ? this.mc.player.getMainHandItem() : ItemStack.EMPTY;
                if (state != null && mode == ToolMode.REBUILD && (stack.isEmpty() || EntityUtils.hasToolItemInHand((LivingEntity)this.mc.player, InteractionHand.MAIN_HAND))) {
                    lines.add(StringUtils.translate((String)"litematica.tool_hud.block_1", (Object[])new Object[]{this.getBlockString(state)}));
                }
                if ((placement = schematicPlacement.getSelectedSubRegionPlacement()) != null) {
                    String areaName = placement.getName();
                    str = StringUtils.translate((String)"litematica.hud.schematic_placement.selected_sub_region", (Object[])new Object[0]);
                    String str2 = StringUtils.translate((String)"litematica.hud.schematic_placement.sub_region_modified", (Object[])new Object[0]);
                    strTmp = placement.isRegionPlacementModifiedFromDefault() ? strYes : strNo;
                    lines.add(String.format("%s: %s%s%s - %s: %s", str, green, areaName, rst, str2, strTmp));
                    or = placement.getPos();
                    or = PositionUtils.getTransformedBlockPos(or, schematicPlacement.getMirror(), schematicPlacement.getRotation());
                    or = or.offset((Vec3i)schematicPlacement.getOrigin());
                    str = String.format("%d, %d, %d", or.getX(), or.getY(), or.getZ());
                    lines.add(StringUtils.translate((String)"litematica.hud.schematic_placement.sub_region_origin", (Object[])new Object[]{green + (String)str + rst}));
                }
                if (mode == ToolMode.PASTE_SCHEMATIC) {
                    ReplaceBehavior replace = (ReplaceBehavior)Configs.Generic.PASTE_REPLACE_BEHAVIOR.getOptionListValue();
                    str = replace.getDisplayName();
                    str = replace == ReplaceBehavior.NONE ? red + (String)str + rst : orange + (String)str + rst;
                    lines.add(StringUtils.translate((String)"litematica.hud.misc.schematic_paste.replace_mode", (Object[])new Object[]{str}));
                    PasteLayerBehavior layers = (PasteLayerBehavior)Configs.Generic.PASTE_LAYER_BEHAVIOR.getOptionListValue();
                    str = layers.getDisplayName();
                    str = layers == PasteLayerBehavior.ALL ? green + (String)str + rst : aqua + (String)str + rst;
                    lines.add(StringUtils.translate((String)"litematica.hud.misc.schematic_paste.layer_mode", (Object[])new Object[]{str}));
                    str = Configs.Generic.PASTE_NBT_BEHAVIOR.getOptionListValue().getDisplayName();
                    if (EntityDataManager.getInstance().hasServuxServer() && Configs.Generic.PASTE_USING_SERVUX.getBooleanValue() && !Configs.Generic.PASTE_USING_COMMANDS_IN_SP.getBooleanValue()) {
                        str = orange + "Servux" + rst;
                    }
                    lines.add(StringUtils.translate((String)"litematica.hud.misc.schematic_paste.data_restore_mode", (Object[])new Object[]{str}));
                    String strVal = Configs.Generic.PASTE_IGNORE_INVENTORY.getBooleanValue() ? strYes : strNo;
                    lines.add(StringUtils.translate((String)"litematica.hud.misc.schematic_paste.ignore_inventory_contents", (Object[])new Object[]{strVal}));
                }
            } else {
                String strTmp = "<" + StringUtils.translate((String)"litematica.label.none_lower", (Object[])new Object[0]) + ">";
                str = StringUtils.translate((String)"litematica.hud.schematic_placement.selected_placement", (Object[])new Object[0]);
                lines.add(String.format("%s: %s%s%s", str, white, strTmp, rst));
            }
        }
        if (hasTool || mode == ToolMode.REBUILD) {
            str = StringUtils.translate((String)"litematica.hud.selected_mode", (Object[])new Object[0]);
            Object modeName = mode.getName();
            if (mode == ToolMode.REBUILD) {
                modeName = orange + (String)modeName + rst;
            }
            lines.add(String.format("%s [%s%d%s/%s%d%s]: %s%s%s", str, green, mode.ordinal() + 1, white, green, ToolMode.values().length, white, green, modeName, rst));
        }
    }

    protected String getBlockString(BlockState state) {
        String green = GuiBase.TXT_GREEN;
        String rst = GuiBase.TXT_RST;
        String strBlock = green + state.getBlock().getName().getString() + rst;
        Optional facing = BlockUtils.getFirstPropertyFacingValue((BlockState)state);
        if (facing.isPresent()) {
            String gold = GuiBase.TXT_GOLD;
            String strFacing = gold + ((Direction)facing.get()).name().toLowerCase() + rst;
            strBlock = strBlock + " - " + StringUtils.translate((String)"litematica.tool_hud.facing", (Object[])new Object[]{strFacing});
        }
        return strBlock;
    }
}

