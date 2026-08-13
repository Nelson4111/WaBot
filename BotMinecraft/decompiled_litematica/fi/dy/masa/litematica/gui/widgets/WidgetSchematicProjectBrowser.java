/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntryType
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$FileFilter
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 *  net.minecraft.core.BlockPos
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.Icons;
import fi.dy.masa.litematica.gui.widgets.WidgetAreaSelectionBrowser;
import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.schematic.projects.SchematicVersion;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.nio.file.Path;
import javax.annotation.Nullable;
import net.minecraft.core.BlockPos;

public class WidgetSchematicProjectBrowser
extends WidgetFileBrowserBase
implements ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> {
    @Nullable
    private SchematicProject selectedProject;
    private final ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> selectionListener;
    protected final int infoWidth;

    public WidgetSchematicProjectBrowser(int x, int y, int width, int height, ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> selectionListener) {
        super(x, y, width, height, DataManager.getDirectoryCache(), "version_control", DataManager.getSchematicsBaseDirectory(), null, (IFileBrowserIconProvider)Icons.DUMMY);
        this.selectionListener = selectionListener;
        this.browserEntryHeight = 14;
        this.infoWidth = 170;
        this.setSelectionListener(this);
    }

    protected Path getRootDirectory() {
        return DataManager.getSchematicsBaseDirectory();
    }

    protected WidgetFileBrowserBase.FileFilter getFileFilter() {
        return WidgetAreaSelectionBrowser.JSON_FILTER;
    }

    protected int getBrowserWidthForTotalWidth(int width) {
        return super.getBrowserWidthForTotalWidth(width) - this.infoWidth;
    }

    public void onSelectionChange(@Nullable WidgetFileBrowserBase.DirectoryEntry entry) {
        if (entry != null) {
            this.selectedProject = entry.type() == WidgetFileBrowserBase.DirectoryEntryType.FILE ? DataManager.getSchematicProjectsManager().loadProjectFromFile(entry.getFullPath(), false) : null;
        }
        this.selectionListener.onSelectionChange((Object)entry);
    }

    protected void drawAdditionalContents(GuiContext ctx, int mouseX, int mouseY) {
        this.drawSelectedProjectInfo(ctx, this.selectedProject);
    }

    protected void drawSelectedProjectInfo(GuiContext ctx, @Nullable SchematicProject project) {
        int x = this.posX + this.totalWidth - this.infoWidth + 4;
        int y = this.posY + 4;
        int infoHeight = 100;
        RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)(x - 4), (int)(y - 4), (int)this.infoWidth, (int)infoHeight, (int)-1610612736, (int)-6710887);
        if (project != null) {
            String w = GuiBase.TXT_WHITE;
            String r = GuiBase.TXT_RST;
            int color = -5197648;
            String str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.project", (Object[])new Object[0]);
            this.drawString(ctx, str, x, y, color);
            this.drawString(ctx, w + project.getName() + r, x + 8, y += 12, color);
            int versionId = project.getCurrentVersionId();
            String strVer = w + (versionId >= 0 ? String.valueOf(versionId + 1) : "N/A") + r;
            str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.version", (Object[])new Object[]{strVer, w + project.getVersionCount() + r});
            this.drawString(ctx, str, x, y += 12, color);
            y += 12;
            SchematicVersion version = project.getCurrentVersion();
            if (version != null) {
                str = StringUtils.translate((String)"litematica.gui.label.schematic_projects.origin", (Object[])new Object[0]);
                this.drawString(ctx, str, x, y, color);
                BlockPos o = project.getOrigin();
                str = String.format("x: %s%d%s, y: %s%d%s, z: %s%d%s", w, o.getX(), r, w, o.getY(), r, w, o.getZ(), r);
                this.drawString(ctx, str, x + 8, y += 12, color);
            }
        }
    }
}

