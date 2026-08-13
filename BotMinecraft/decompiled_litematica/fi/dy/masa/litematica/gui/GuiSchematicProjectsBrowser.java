/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.GuiConfirmAction
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.GuiTextInput
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.IDirectoryNavigator
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetDirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntry
 *  fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase$DirectoryEntryType
 *  fi.dy.masa.malilib.interfaces.IConfirmationListener
 *  fi.dy.masa.malilib.interfaces.IStringConsumerFeedback
 *  fi.dy.masa.malilib.util.FileDeleter
 *  fi.dy.masa.malilib.util.FileNameUtils
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.gui.screens.Screen
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.GuiSchematicProjectManager;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicProjectBrowser;
import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.GuiConfirmAction;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.GuiTextInput;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.IDirectoryNavigator;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetDirectoryEntry;
import fi.dy.masa.malilib.gui.widgets.WidgetFileBrowserBase;
import fi.dy.masa.malilib.interfaces.IConfirmationListener;
import fi.dy.masa.malilib.interfaces.IStringConsumerFeedback;
import fi.dy.masa.malilib.util.FileDeleter;
import fi.dy.masa.malilib.util.FileNameUtils;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.StringUtils;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import javax.annotation.Nullable;
import net.minecraft.client.gui.screens.Screen;

public class GuiSchematicProjectsBrowser
extends GuiListBase<WidgetFileBrowserBase.DirectoryEntry, WidgetDirectoryEntry, WidgetSchematicProjectBrowser>
implements ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> {
    public GuiSchematicProjectsBrowser() {
        super(10, 30);
        this.title = StringUtils.translate((String)"litematica.gui.title.schematic_projects_browser", (Object[])new Object[0]);
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 58;
    }

    public void initGui() {
        super.initGui();
        this.createElements();
    }

    private void createElements() {
        int x = 10;
        int y = this.getScreenHeight() - 24;
        SchematicProject project = DataManager.getSchematicProjectsManager().getCurrentProject();
        if (project != null) {
            x += this.createButton(x, y, false, ButtonListener.Type.OPEN_MANAGER_GUI);
        }
        x += this.createButton(x, y, false, ButtonListener.Type.CREATE_PROJECT);
        WidgetFileBrowserBase.DirectoryEntry selected = (WidgetFileBrowserBase.DirectoryEntry)((WidgetSchematicProjectBrowser)this.getListWidget()).getLastSelectedEntry();
        if (selected != null && FileType.fromFile(selected.getFullPath()) == FileType.JSON) {
            x += this.createButton(x, y, false, ButtonListener.Type.LOAD_PROJECT);
            x += this.createButton(x, y, false, ButtonListener.Type.DELETE_PROJECT);
        }
        if (project != null) {
            x += this.createButton(x, y, false, ButtonListener.Type.CLOSE_PROJECT);
        }
        GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.MAIN_MENU;
        String label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        int buttonWidth = this.getStringWidth(label) + 20;
        this.addButton((ButtonBase)new ButtonGeneric(this.getScreenWidth() - buttonWidth - 10, y, buttonWidth, 20, label, new String[0]), new GuiMainMenu.ButtonListenerChangeMenu(type, null));
    }

    private int createButton(int x, int y, boolean rightAlign, ButtonListener.Type type) {
        ButtonGeneric button = new ButtonGeneric(x, y, -1, rightAlign, type.getTranslationKey(), new Object[0]);
        String hover = type.getHoverText();
        if (hover != null) {
            button.setHoverStrings(new String[]{hover});
        }
        this.addButton((ButtonBase)button, new ButtonListener(type, this));
        return button.getWidth() + 2;
    }

    private void reCreateGuiElements() {
        this.clearButtons();
        this.clearWidgets();
        this.createElements();
    }

    @Nullable
    protected ISelectionListener<WidgetFileBrowserBase.DirectoryEntry> getSelectionListener() {
        return this;
    }

    public void onSelectionChange(@Nullable WidgetFileBrowserBase.DirectoryEntry entry) {
        this.reCreateGuiElements();
    }

    protected WidgetSchematicProjectBrowser createListWidget(int listX, int listY) {
        return new WidgetSchematicProjectBrowser(listX, listY, 100, 100, this.getSelectionListener());
    }

    private record ButtonListener(Type type, GuiSchematicProjectsBrowser gui) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            SchematicProject project;
            if (this.gui.getListWidget() == null) {
                return;
            }
            if (this.type == Type.LOAD_PROJECT) {
                WidgetFileBrowserBase.DirectoryEntry entry = (WidgetFileBrowserBase.DirectoryEntry)((WidgetSchematicProjectBrowser)this.gui.getListWidget()).getLastSelectedEntry();
                if (entry != null && entry.type() == WidgetFileBrowserBase.DirectoryEntryType.FILE && DataManager.getSchematicProjectsManager().openProject(entry.getFullPath())) {
                    SchematicProject project2 = DataManager.getSchematicProjectsManager().getCurrentProject();
                    if (project2 != null) {
                        GuiSchematicProjectManager gui = new GuiSchematicProjectManager(project2);
                        GuiBase.openGui((Screen)gui);
                        String name = project2.getName();
                        InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.SUCCESS, (String)"litematica.message.schematic_projects.project_loaded", (Object[])new Object[]{name});
                    } else {
                        InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_projects.failed_to_load_project", (Object[])new Object[0]);
                    }
                }
            } else if (this.type == Type.DELETE_PROJECT) {
                WidgetFileBrowserBase.DirectoryEntry entry = (WidgetFileBrowserBase.DirectoryEntry)((WidgetSchematicProjectBrowser)this.gui.getListWidget()).getLastSelectedEntry();
                if (entry != null && entry.type() == WidgetFileBrowserBase.DirectoryEntryType.FILE) {
                    FileDeleter deleter = new FileDeleter(entry.getFullPath(), (IDirectoryNavigator)this.gui.getListWidget(), Configs.Generic.DISPLAY_FILE_OPS_FEEDBACK.getBooleanValue());
                    GuiBase.openGui((Screen)new GuiConfirmAction(400, "litematica.gui.title.confirm_file_deletion", (IConfirmationListener)deleter, (Screen)this.gui, "litematica.gui.message.confirm_file_deletion", new Object[]{entry.name()}));
                }
            } else if (this.type == Type.CREATE_PROJECT) {
                ProjectCreator creator = new ProjectCreator(((WidgetSchematicProjectBrowser)this.gui.getListWidget()).getCurrentDirectory(), this.gui);
                GuiTextInput gui = new GuiTextInput(256, "litematica.gui.title.create_schematic_project", "", GuiUtils.getCurrentScreen(), (IStringConsumerFeedback)creator);
                GuiBase.openGui((Screen)gui);
            } else if (this.type == Type.CLOSE_PROJECT) {
                DataManager.getSchematicProjectsManager().closeCurrentProject();
                this.gui.reCreateGuiElements();
            } else if (this.type == Type.OPEN_MANAGER_GUI && (project = DataManager.getSchematicProjectsManager().getCurrentProject()) != null) {
                GuiSchematicProjectManager gui = new GuiSchematicProjectManager(project);
                GuiBase.openGui((Screen)gui);
            }
        }

        public static enum Type {
            OPEN_MANAGER_GUI("litematica.gui.button.schematic_projects.open_manager_gui"),
            LOAD_PROJECT("litematica.gui.button.schematic_projects.load_project"),
            CREATE_PROJECT("litematica.gui.button.schematic_projects.create_project"),
            CLOSE_PROJECT("litematica.gui.button.schematic_projects.close_project"),
            DELETE_PROJECT("litematica.gui.button.schematic_projects.delete_project");

            private final String translationKey;
            @Nullable
            private final String hoverText;

            private Type(String label) {
                this(label, null);
            }

            private Type(String translationKey, String hoverText) {
                this.translationKey = translationKey;
                this.hoverText = hoverText;
            }

            public String getTranslationKey() {
                return this.translationKey;
            }

            @Nullable
            public String getHoverText() {
                return this.hoverText != null ? StringUtils.translate((String)this.hoverText, (Object[])new Object[0]) : null;
            }
        }
    }

    private record ProjectCreator(Path dir, GuiSchematicProjectsBrowser gui) implements IStringConsumerFeedback
    {
        public boolean setString(String projectName) {
            Path file;
            String fileName = FileNameUtils.generateSimpleUnicodeSafeFileName((String)projectName);
            if (FileNameUtils.doesFileNameContainIllegalCharacters((String)fileName)) {
                fileName = FileNameUtils.generateSafeFileName((String)fileName);
            }
            if (!Files.exists(file = this.dir.resolve(fileName + ".json").normalize(), new LinkOption[0])) {
                DataManager.getSchematicProjectsManager().createNewProject(this.dir, projectName);
                ((WidgetSchematicProjectBrowser)this.gui.getListWidget()).refreshEntries();
                this.gui.addMessage(Message.MessageType.SUCCESS, "litematica.message.schematic_projects.project_created", new Object[]{projectName});
                return true;
            }
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_projects.project_already_exists", (Object[])new Object[]{projectName});
            return false;
        }
    }
}

