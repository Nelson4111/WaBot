/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.common.collect.ImmutableList
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.LeftRight
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetListBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetSearchBar
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  net.minecraft.core.BlockPos
 */
package fi.dy.masa.litematica.gui.widgets;

import com.google.common.collect.ImmutableList;
import fi.dy.masa.litematica.gui.GuiSchematicProjectManager;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicVersion;
import fi.dy.masa.litematica.render.infohud.ToolHud;
import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.schematic.projects.SchematicVersion;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.LeftRight;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListBase;
import fi.dy.masa.malilib.gui.widgets.WidgetSearchBar;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import net.minecraft.core.BlockPos;

public class WidgetListSchematicVersions
extends WidgetListBase<SchematicVersion, WidgetSchematicVersion> {
    private final SchematicProject project;
    protected final int infoWidth;

    public WidgetListSchematicVersions(int x, int y, int width, int height, SchematicProject project, GuiSchematicProjectManager parent) {
        super(x, y, width, height, (ISelectionListener)parent);
        this.project = project;
        this.browserEntryHeight = 16;
        this.infoWidth = 180;
        this.widgetSearchBar = new WidgetSearchBar(x + 2, y + 4, width - 14, 14, 0, (IGuiIcon)Icons.FILE_ICON_SEARCH, LeftRight.LEFT);
        this.browserEntriesOffsetY = this.widgetSearchBar.getHeight() + 3;
    }

    public void drawContents(GuiContext ctx, int mouseX, int mouseY, float partialTicks) {
        RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)this.posX, (int)this.posY, (int)this.browserWidth, (int)this.browserHeight, (int)-1342177280, (int)-6710887);
        super.drawContents(ctx, mouseX, mouseY, partialTicks);
        this.drawAdditionalContents(ctx, mouseX, mouseY);
    }

    protected void drawAdditionalContents(GuiContext ctx, int mouseX, int mouseY) {
        int x = this.posX + this.totalWidth - this.infoWidth + 4;
        int y = this.posY + 4;
        int infoHeight = 200;
        String w = GuiBase.TXT_WHITE;
        String r = GuiBase.TXT_RST;
        int color = -5197648;
        RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)(x - 4), (int)(y - 4), (int)this.infoWidth, (int)infoHeight, (int)-1610612736, (int)-6710887);
        String str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.project", (Object[])new Object[0]);
        this.drawString(ctx, str, x, y, color);
        this.drawString(ctx, w + this.project.getName() + r, x + 4, y += 12, color);
        int versionId = this.project.getCurrentVersionId();
        String strVer = w + (versionId >= 0 ? String.valueOf(versionId + 1) : "N/A") + r;
        str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.version", (Object[])new Object[]{strVer, w + this.project.getVersionCount() + r});
        this.drawString(ctx, str, x, y += 12, color);
        y += 12;
        SchematicVersion version = this.project.getCurrentVersion();
        if (version != null) {
            ToolHud.DATE.setTime(version.getTimeStamp());
            str = ToolHud.SIMPLE_DATE_FORMAT.format(ToolHud.DATE);
            str = StringUtils.translate((String)"litematica.hud.schematic_projects.current_version_date", (Object[])new Object[]{w + str + r});
            this.drawString(ctx, str, x, y, color);
            str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.version_name", (Object[])new Object[0]);
            this.drawString(ctx, str, x, y += 12, color);
            this.drawString(ctx, w + version.getName() + r, x + 4, y += 12, color);
            str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.origin", (Object[])new Object[0]);
            this.drawString(ctx, str, x, y += 12, color);
            BlockPos o = this.project.getOrigin();
            str = String.format("x: %s%d%s, y: %s%d%s, z: %s%d%s", w, o.getX(), r, w, o.getY(), r, w, o.getZ(), r);
            this.drawString(ctx, str, x, y += 12, color);
            if (version.getDescription() != null && !version.getDescription().isEmpty()) {
                str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.version_description", (Object[])new Object[0]);
                this.drawString(ctx, str, x, y += 12, color);
                ArrayList lines = new ArrayList();
                StringUtils.splitTextToLines(lines, (String)version.getDescription(), (int)512);
                for (String line : lines) {
                    this.drawString(ctx, w + "  " + line, x, y += 12, color);
                }
            }
        }
    }

    public void setSize(int width, int height) {
        super.setSize(width, height);
        this.browserWidth = width - this.infoWidth - 6;
        this.browserEntryWidth = this.browserWidth - 14;
    }

    protected Collection<SchematicVersion> getAllEntries() {
        return this.project.getAllVersions();
    }

    protected List<String> getEntryStringsForFilter(SchematicVersion entry) {
        return ImmutableList.of((Object)entry.getName().toLowerCase(), (Object)entry.getFileName().toLowerCase());
    }

    protected WidgetSchematicVersion createListEntryWidget(int x, int y, int listIndex, boolean isOdd, SchematicVersion entry) {
        return new WidgetSchematicVersion(x, y, this.browserEntryWidth, this.getBrowserEntryHeightFor(entry), isOdd, entry, listIndex, this.project);
    }
}

