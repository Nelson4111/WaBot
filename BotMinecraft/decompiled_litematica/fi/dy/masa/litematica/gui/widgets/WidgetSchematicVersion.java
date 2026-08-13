/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetListEntryBase
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.time.TimeFormat
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.schematic.projects.SchematicVersion;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.widgets.WidgetListEntryBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.time.TimeFormat;
import java.util.ArrayList;

public class WidgetSchematicVersion
extends WidgetListEntryBase<SchematicVersion> {
    private final SchematicProject project;
    private final boolean isOdd;

    public WidgetSchematicVersion(int x, int y, int width, int height, boolean isOdd, SchematicVersion entry, int listIndex, SchematicProject project) {
        super(x, y, width, height, (Object)entry, listIndex);
        this.project = project;
        this.isOdd = isOdd;
    }

    public void render(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        boolean versionSelected;
        boolean bl = versionSelected = this.project.getCurrentVersion() == this.entry;
        if (selected || versionSelected || this.isMouseOver(mouseX, mouseY)) {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1603243920);
        } else if (this.isOdd) {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1609560048);
        } else {
            RenderUtils.drawRect((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-1607454672);
        }
        if (versionSelected) {
            RenderUtils.drawOutline((GuiContext)ctx, (int)this.x, (int)this.y, (int)this.width, (int)this.height, (int)-2039584);
        }
        String str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.version_entry", (Object[])new Object[]{((SchematicVersion)this.entry).getVersion(), ((SchematicVersion)this.entry).getName()});
        this.drawString(ctx, this.x + 4, this.y + 4, -1, str);
    }

    public void postRenderHovered(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (this.entry != null && GuiBase.isMouseOver((int)mouseX, (int)mouseY, (int)this.x, (int)this.y, (int)this.width, (int)this.height)) {
            ArrayList<Object> text = new ArrayList<Object>();
            text.add(StringUtils.translate((String)"litematica.gui.label.schematic_projects.version_hover.entry", (Object[])new Object[]{((SchematicVersion)this.entry).getVersion(), ((SchematicVersion)this.entry).getName()}));
            text.add(StringUtils.translate((String)"litematica.gui.label.schematic_projects.version_hover.timestamp", (Object[])new Object[]{TimeFormat.REGULAR.formatTo(((SchematicVersion)this.entry).getTimeStamp())}));
            if (((SchematicVersion)this.entry).getDescription() != null && !((SchematicVersion)this.entry).getDescription().isEmpty()) {
                ArrayList lines = new ArrayList();
                StringUtils.splitTextToLines(lines, (String)((SchematicVersion)this.entry).getDescription(), (int)512);
                text.add(StringUtils.translate((String)"litematica.gui.label.schematic_projects.version_hover.description", (Object[])new Object[0]));
                for (String entry : lines) {
                    text.add("  \u00a7f" + entry);
                }
            }
            RenderUtils.drawHoverText((GuiContext)ctx, (int)mouseX, (int)mouseY, text);
        }
        super.postRenderHovered(ctx, mouseX, mouseY, selected);
    }
}

