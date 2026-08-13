/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiTextInputFeedback
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.IDirectoryNavigator
 *  fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider
 *  fi.dy.masa.malilib.gui.interfaces.IMessageConsumer
 *  fi.dy.masa.malilib.gui.widgets.WidgetDirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntryType
 *  fi.dy.masa.malilib.interfaces.IStringConsumerFeedback
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.client.input.MouseButtonEvent
 *  net.minecraft.core.BlockPos
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.gui.GuiAreaSelectionEditorNormal;
import fi.dy.masa.litematica.gui.widgets.WidgetAreaSelectionBrowser;
import fi.dy.masa.litematica.selection.AreaSelection;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiTextInputFeedback;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.IDirectoryNavigator;
import fi.dy.masa.malilib.gui.interfaces.IFileBrowserIconProvider;
import fi.dy.masa.malilib.gui.interfaces.IMessageConsumer;
import fi.dy.masa.malilib.gui.widgets.WidgetDirectoryEntry;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import fi.dy.masa.malilib.interfaces.IStringConsumerFeedback;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.render.RenderUtils;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.util.ArrayList;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.core.BlockPos;

public class WidgetAreaSelectionEntry
extends WidgetDirectoryEntry {
    private final SelectionManager selectionManager;
    private final WidgetAreaSelectionBrowser parent;
    private final int buttonsStartX;

    public WidgetAreaSelectionEntry(int x, int y, int width, int height, boolean isOdd, WidgetFileBrowserBase.DirectoryEntry entry, int listIndex, SelectionManager selectionManager, WidgetAreaSelectionBrowser parent, IFileBrowserIconProvider iconProvider) {
        super(x, y, width, height, isOdd, entry, listIndex, (IDirectoryNavigator)parent, iconProvider);
        this.selectionManager = selectionManager;
        this.parent = parent;
        int posX = x + width - 2;
        int posY = y + 1;
        if (entry.type() == WidgetFileBrowserBase.DirectoryEntryType.FILE && FileType.fromFile(entry.getFullPath()) == FileType.JSON) {
            posX = this.createButton(posX, posY, ButtonListener.ButtonType.REMOVE);
            posX = this.createButton(posX, posY, ButtonListener.ButtonType.RENAME);
            posX = this.createButton(posX, posY, ButtonListener.ButtonType.COPY);
            posX = this.createButton(posX, posY, ButtonListener.ButtonType.CONFIGURE);
        }
        this.buttonsStartX = posX;
    }

    private int createButton(int x, int y, ButtonListener.ButtonType type) {
        String label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        int len = Math.max(this.getStringWidth(label) + 10, 20);
        this.addButton((ButtonBase)new ButtonGeneric(x -= len, y, len, 20, label, new String[0]), new ButtonListener(type, this.selectionManager, this));
        return x - 2;
    }

    public boolean canSelectAt(MouseButtonEvent click) {
        return click.x() < (double)this.buttonsStartX && super.canSelectAt(click);
    }

    public void render(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        if (this.entry.type() == WidgetFileBrowserBase.DirectoryEntryType.FILE && FileType.fromFile(this.entry.getFullPath()) == FileType.JSON) {
            selected = this.entry.getFullPath().toAbsolutePath().toString().equals(this.selectionManager.getCurrentNormalSelectionId());
            super.render(ctx, mouseX, mouseY, selected);
        } else {
            super.render(ctx, mouseX, mouseY, selected);
        }
    }

    protected String getDisplayName() {
        if (this.entry.type() == WidgetFileBrowserBase.DirectoryEntryType.FILE && FileType.fromFile(this.entry.getFullPath()) == FileType.JSON) {
            AreaSelection selection = this.selectionManager.getOrLoadSelectionReadOnly(this.getDirectoryEntry().getFullPath().toAbsolutePath().toString());
            String prefix = this.entry.getDisplayNamePrefix();
            return selection != null ? (prefix != null ? prefix + selection.getName() : selection.getName()) : "<error>";
        }
        return super.getDisplayName();
    }

    public void postRenderHovered(GuiContext ctx, int mouseX, int mouseY, boolean selected) {
        int offset;
        ArrayList<String> text = new ArrayList<String>();
        AreaSelection selection = this.selectionManager.getOrLoadSelectionReadOnly(this.getDirectoryEntry().getFullPath().toAbsolutePath().toString());
        if (selection != null) {
            String str;
            BlockPos o = selection.getExplicitOrigin();
            if (o == null) {
                o = selection.getEffectiveOrigin();
                str = StringUtils.translate((String)"litematica.gui.label.origin.auto", (Object[])new Object[0]);
            } else {
                str = StringUtils.translate((String)"litematica.gui.label.origin.manual", (Object[])new Object[0]);
            }
            String strOrigin = String.format("x: %d, y: %d, z: %d (%s)", o.getX(), o.getY(), o.getZ(), str);
            text.add(StringUtils.translate((String)"litematica.gui.label.area_selection_origin", (Object[])new Object[]{strOrigin}));
            int count = selection.getAllSubRegionBoxes().size();
            text.add(StringUtils.translate((String)"litematica.gui.label.area_selection_box_count", (Object[])new Object[]{count}));
        }
        if (GuiBase.isMouseOver((int)mouseX, (int)mouseY, (int)this.x, (int)this.y, (int)(this.buttonsStartX - (offset = 12)), (int)this.height)) {
            RenderUtils.drawHoverText((GuiContext)ctx, (int)mouseX, (int)mouseY, text);
        }
    }

    private record ButtonListener(ButtonType type, SelectionManager selectionManager, WidgetAreaSelectionEntry widget) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            AreaSelection selection;
            String selectionId = this.widget.getDirectoryEntry().getFullPath().toAbsolutePath().toString();
            if (this.type == ButtonType.RENAME) {
                String title = "litematica.gui.title.rename_area_selection";
                AreaSelection selection2 = this.selectionManager.getOrLoadSelection(selectionId);
                String name = selection2 != null ? selection2.getName() : "<error>";
                SelectionRenamer renamer = new SelectionRenamer(this.selectionManager, this.widget, false);
                GuiBase.openGui((Screen)new GuiTextInputFeedback(160, title, name, (Screen)this.widget.parent.getSelectionManagerGui(), (IStringConsumerFeedback)renamer));
            } else if (this.type == ButtonType.COPY) {
                AreaSelection selection3 = this.selectionManager.getOrLoadSelection(selectionId);
                if (selection3 != null) {
                    String title = StringUtils.translate((String)"litematica.gui.title.copy_area_selection", (Object[])new Object[]{selection3.getName()});
                    SelectionRenamer renamer = new SelectionRenamer(this.selectionManager, this.widget, true);
                    GuiBase.openGui((Screen)new GuiTextInputFeedback(160, title, selection3.getName(), (Screen)this.widget.parent.getSelectionManagerGui(), (IStringConsumerFeedback)renamer));
                } else {
                    this.widget.parent.getSelectionManagerGui().addMessage(Message.MessageType.ERROR, "litematica.error.area_selection.failed_to_load", new Object[0]);
                }
            } else if (this.type == ButtonType.REMOVE) {
                this.selectionManager.removeSelection(selectionId);
            } else if (this.type == ButtonType.CONFIGURE && (selection = this.selectionManager.getOrLoadSelection(selectionId)) != null) {
                GuiAreaSelectionEditorNormal gui = new GuiAreaSelectionEditorNormal(selection);
                gui.setParent(GuiUtils.getCurrentScreen());
                gui.setSelectionId(selectionId);
                GuiBase.openGui((Screen)gui);
            }
            this.widget.parent.refreshEntries();
        }

        public static enum ButtonType {
            RENAME("litematica.gui.button.rename"),
            COPY("litematica.gui.button.copy"),
            CONFIGURE("litematica.gui.button.configure"),
            REMOVE(GuiBase.TXT_RED + "-");

            private final String labelKey;

            private ButtonType(String labelKey) {
                this.labelKey = labelKey;
            }

            public String getLabelKey() {
                return this.labelKey;
            }
        }
    }

    private record SelectionRenamer(SelectionManager selectionManager, WidgetAreaSelectionEntry widget, boolean copy) implements IStringConsumerFeedback
    {
        public boolean setString(String string) {
            String selectionId = this.widget.getDirectoryEntry().getFullPath().toAbsolutePath().toString();
            return this.selectionManager.renameSelection(this.widget.getDirectoryEntry().getDirectory(), selectionId, string, this.copy, (IMessageConsumer)this.widget.parent.getSelectionManagerGui());
        }
    }
}

