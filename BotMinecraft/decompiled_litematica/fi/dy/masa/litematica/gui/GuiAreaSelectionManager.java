/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.GuiTextInput
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.gui.interfaces.IMessageConsumer
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetDirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntryType
 *  fi.dy.masa.malilib.interfaces.IStringConsumer
 *  fi.dy.masa.malilib.interfaces.IStringConsumerFeedback
 *  fi.dy.masa.malilib.util.FileUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  net.minecraft.client.gui.screens.Screen
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.widgets.WidgetAreaSelectionBrowser;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.selection.SelectionManager;
import fi.dy.masa.litematica.selection.SelectionMode;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.GuiTextInput;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.gui.interfaces.IMessageConsumer;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetDirectoryEntry;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import fi.dy.masa.malilib.interfaces.IStringConsumer;
import fi.dy.masa.malilib.interfaces.IStringConsumerFeedback;
import fi.dy.masa.malilib.util.FileUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.nio.file.Path;
import net.minecraft.client.gui.screens.Screen;

public class GuiAreaSelectionManager
extends GuiListBase<WidgetFileBrowserBase.DirectoryEntry, WidgetDirectoryEntry, WidgetAreaSelectionBrowser>
implements ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> {
    private final SelectionManager selectionManager;

    public GuiAreaSelectionManager() {
        super(10, 50);
        this.title = StringUtils.translate((String)"litematica.gui.title.area_selection_manager", (Object[])new Object[0]);
        this.selectionManager = DataManager.getSelectionManager();
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 68;
    }

    public void initGui() {
        super.initGui();
        this.reCreateGuiElements();
        if (this.selectionManager.getSelectionMode() == SelectionMode.SIMPLE) {
            InfoUtils.showGuiMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.warn.area_selection.browser_open_in_simple_mode", (Object[])new Object[0]);
        }
    }

    protected void reCreateGuiElements() {
        this.clearButtons();
        this.clearWidgets();
        int x = this.getScreenWidth() - 13;
        int y = 24;
        GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.AREA_EDITOR;
        ButtonGeneric button = new ButtonGeneric(10, y, -1, 20, StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]), (IGuiIcon)type.getIcon(), new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, (Screen)this));
        x = this.createButton(x, y, ButtonListener.ButtonType.UNSELECT);
        x = this.createButton(x, y, ButtonListener.ButtonType.FROM_PLACEMENT);
        x = this.createButton(x, y, ButtonListener.ButtonType.NEW_SELECTION);
        String currentSelection = this.selectionManager.getCurrentNormalSelectionId();
        if (currentSelection != null) {
            int len = DataManager.getAreaSelectionsBaseDirectory().toAbsolutePath().toString().length();
            if (currentSelection.length() > len + 1) {
                currentSelection = FileUtils.getNameWithoutExtension((String)currentSelection.substring(len + 1));
                String str = StringUtils.translate((String)"litematica.gui.label.area_selection_manager.current_selection", (Object[])new Object[]{currentSelection});
                int w = this.getStringWidth(str);
                this.addLabel(10, this.getScreenHeight() - 15, w, 14, -1, new String[]{str});
            }
        }
    }

    private int createButton(int x, int y, ButtonListener.ButtonType type) {
        String label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        int len = this.getStringWidth(label) + 10;
        ButtonGeneric button = new ButtonGeneric(x -= len + 2, y, len, 20, label, new String[0]);
        if (type == ButtonListener.ButtonType.UNSELECT) {
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.area_selections.unselect"});
        }
        this.addButton((ButtonBase)button, new ButtonListener(type, this));
        return x;
    }

    public String getBrowserContext() {
        return "area_selections";
    }

    public Path getDefaultDirectoryAsPath() {
        return DataManager.getAreaSelectionsBaseDirectory();
    }

    public Path getDefaultDirectory() {
        return DataManager.getAreaSelectionsBaseDirectory();
    }

    protected ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> getSelectionListener() {
        return this;
    }

    public void onSelectionChange(WidgetFileBrowserBase.DirectoryEntry entry) {
        if (entry == null) {
            return;
        }
        if (entry.type() == WidgetFileBrowserBase.DirectoryEntryType.FILE && FileType.fromFile(entry.getFullPath()) == FileType.JSON) {
            String selectionId = entry.getFullPath().toAbsolutePath().toString();
            if (selectionId.equals(this.selectionManager.getCurrentNormalSelectionId())) {
                this.selectionManager.setCurrentSelection(null);
            } else {
                this.selectionManager.setCurrentSelection(selectionId);
            }
            this.reCreateGuiElements();
        }
    }

    public SelectionManager getSelectionManager() {
        return this.selectionManager;
    }

    protected WidgetAreaSelectionBrowser createListWidget(int listX, int listY) {
        return new WidgetAreaSelectionBrowser(listX, listY, 100, 100, this, this.getSelectionListener());
    }

    private record ButtonListener(ButtonType type, GuiAreaSelectionManager gui) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            if (this.type == ButtonType.NEW_SELECTION) {
                Path dir = ((WidgetAreaSelectionBrowser)this.gui.getListWidget()).getCurrentDirectory();
                String title = "litematica.gui.title.create_area_selection";
                GuiBase.openGui((Screen)new GuiTextInput(256, title, "", (Screen)this.gui, (IStringConsumer)new SelectionCreator(dir, this.gui)));
            } else if (this.type == ButtonType.FROM_PLACEMENT) {
                SchematicPlacement placement = DataManager.getSchematicPlacementManager().getSelectedSchematicPlacement();
                if (placement != null) {
                    Path dir = ((WidgetAreaSelectionBrowser)this.gui.getListWidget()).getCurrentDirectory();
                    String title = "litematica.gui.title.create_area_selection_from_placement";
                    GuiBase.openGui((Screen)new GuiTextInput(256, title, placement.getName(), (Screen)this.gui, (IStringConsumerFeedback)new SelectionCreatorPlacement(placement, dir, this.gui)));
                } else {
                    this.gui.addMessage(Message.MessageType.ERROR, "litematica.error.area_selection.no_placement_selected", new Object[0]);
                }
            } else if (this.type == ButtonType.UNSELECT) {
                DataManager.getSelectionManager().setCurrentSelection(null);
                this.gui.reCreateGuiElements();
            }
        }

        public static enum ButtonType {
            NEW_SELECTION("litematica.gui.button.area_selections.create_new_selection"),
            FROM_PLACEMENT("litematica.gui.button.area_selections.create_selection_from_placement"),
            UNSELECT("litematica.gui.button.area_selections.unselect");

            private final String labelKey;

            private ButtonType(String labelKey) {
                this.labelKey = labelKey;
            }

            public String getLabelKey() {
                return this.labelKey;
            }
        }
    }

    public record SelectionCreatorPlacement(SchematicPlacement placement, Path dir, GuiAreaSelectionManager gui) implements IStringConsumerFeedback
    {
        public boolean setString(String name) {
            if (this.gui.getSelectionManager().createSelectionFromPlacement(this.dir, this.placement, name, (IMessageConsumer)this.gui)) {
                this.gui.addMessage(Message.MessageType.SUCCESS, "litematica.message.area_selections.selection_created_from_placement", new Object[]{name});
                ((WidgetAreaSelectionBrowser)this.gui.getListWidget()).refreshEntries();
                return true;
            }
            return false;
        }
    }

    public record SelectionCreator(Path dir, GuiAreaSelectionManager gui) implements IStringConsumer
    {
        public void setString(String string) {
            this.gui.selectionManager.createNewSelection(this.dir, string);
            ((WidgetAreaSelectionBrowser)this.gui.getListWidget()).refreshEntries();
        }
    }
}

