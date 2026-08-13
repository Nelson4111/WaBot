/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.IGuiIcon
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.world.entity.player.Player
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.Reference;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.data.DataManager;
import fi.dy.masa.litematica.gui.ButtonIcons;
import fi.dy.masa.litematica.gui.GuiAreaSelectionManager;
import fi.dy.masa.litematica.gui.GuiConfigs;
import fi.dy.masa.litematica.gui.GuiSchematicLoad;
import fi.dy.masa.litematica.gui.GuiSchematicLoadedList;
import fi.dy.masa.litematica.gui.GuiSchematicManager;
import fi.dy.masa.litematica.gui.GuiSchematicPlacementsList;
import fi.dy.masa.litematica.gui.GuiTaskManager;
import fi.dy.masa.litematica.selection.SelectionMode;
import fi.dy.masa.litematica.tool.ToolMode;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.IGuiIcon;
import fi.dy.masa.malilib.util.StringUtils;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.world.entity.player.Player;

public class GuiMainMenu
extends GuiBase {
    public GuiMainMenu() {
        String version = String.format("v%s", Reference.MOD_VERSION);
        this.title = StringUtils.translate((String)"litematica.gui.title.litematica_main_menu", (Object[])new Object[]{version});
    }

    public void initGui() {
        super.initGui();
        int x = 12;
        int y = 30;
        int width = this.getButtonWidth();
        this.createChangeMenuButton(x, y, width, ButtonListenerChangeMenu.ButtonType.SCHEMATIC_PLACEMENTS);
        this.createChangeMenuButton(x, y += 22, width, ButtonListenerChangeMenu.ButtonType.LOADED_SCHEMATICS);
        this.createChangeMenuButton(x, y += 22, width, ButtonListenerChangeMenu.ButtonType.LOAD_SCHEMATICS);
        this.createChangeMenuButton(x, y += 44, width, ButtonListenerChangeMenu.ButtonType.AREA_EDITOR);
        this.createChangeMenuButton(x, y += 22, width, ButtonListenerChangeMenu.ButtonType.AREA_SELECTION_BROWSER);
        SelectionMode mode = DataManager.getSelectionManager().getSelectionMode();
        String label = StringUtils.translate((String)"litematica.gui.button.area_selection_mode", (Object[])new Object[]{mode.getDisplayName()});
        ButtonGeneric button = new ButtonGeneric(x, y += 22, width, 20, label, new String[0]);
        this.addButton((ButtonBase)button, new ButtonListenerCycleAreaMode(this));
        label = StringUtils.translate((String)"litematica.gui.button.tool_mode", (Object[])new Object[]{DataManager.getToolMode().getName()});
        int width2 = this.getStringWidth(label) + 10;
        y = this.getScreenHeight() - 26;
        button = new ButtonGeneric(x, y, width2, 20, label, new String[0]);
        this.addButton((ButtonBase)button, new ButtonListenerCycleToolMode(this));
        y = 30;
        this.createChangeMenuButton(x += width + 20, y, width, ButtonListenerChangeMenu.ButtonType.CONFIGURATION);
        this.createChangeMenuButton(x, y += 88, width, ButtonListenerChangeMenu.ButtonType.SCHEMATIC_MANAGER);
        this.createChangeMenuButton(x, y += 22, width, ButtonListenerChangeMenu.ButtonType.TASK_MANAGER);
        if (Configs.Generic.UNHIDE_SCHEMATIC_PROJECTS.getBooleanValue()) {
            this.createChangeMenuButton(x, y += 22, width, ButtonListenerChangeMenu.ButtonType.SCHEMATIC_PROJECTS_MANAGER);
        }
    }

    private void createChangeMenuButton(int x, int y, int width, ButtonListenerChangeMenu.ButtonType type) {
        ButtonGeneric button = new ButtonGeneric(x, y, width, 20, type.getDisplayName(), (IGuiIcon)type.getIcon(), new String[0]);
        if (type == ButtonListenerChangeMenu.ButtonType.AREA_SELECTION_BROWSER && DataManager.getSchematicProjectsManager().hasProjectOpen()) {
            button.setEnabled(false);
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.schematic_projects.area_browser_disabled_currently_in_projects_mode"});
        } else if (type == ButtonListenerChangeMenu.ButtonType.SCHEMATIC_PROJECTS_MANAGER) {
            button.setHoverStrings(new String[]{"litematica.gui.button.hover.schematic_projects.menu_warning"});
        }
        this.addButton((ButtonBase)button, new ButtonListenerChangeMenu(type, (Screen)this));
    }

    private int getButtonWidth() {
        int width = 0;
        for (ButtonListenerChangeMenu.ButtonType buttonType : ButtonListenerChangeMenu.ButtonType.values()) {
            width = Math.max(width, this.getStringWidth(buttonType.getDisplayName()) + 30);
        }
        for (Enum enum_ : SelectionMode.values()) {
            String label = StringUtils.translate((String)"litematica.gui.button.area_selection_mode", (Object[])new Object[]{((SelectionMode)enum_).getDisplayName()});
            width = Math.max(width, this.getStringWidth(label) + 10);
        }
        return width;
    }

    public static class ButtonListenerChangeMenu
    implements IButtonActionListener {
        private final ButtonType type;
        @Nullable
        private final Screen parent;

        public ButtonListenerChangeMenu(ButtonType type, @Nullable Screen parent) {
            this.type = type;
            this.parent = parent;
        }

        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            Object gui = null;
            switch (this.type.ordinal()) {
                case 3: {
                    gui = DataManager.getSelectionManager().getEditGui();
                    break;
                }
                case 2: {
                    gui = new GuiAreaSelectionManager();
                    break;
                }
                case 8: {
                    GuiBase.openGui((Screen)new GuiConfigs());
                    return;
                }
                case 4: {
                    gui = new GuiSchematicLoad();
                    break;
                }
                case 0: {
                    gui = new GuiSchematicLoadedList();
                    break;
                }
                case 9: {
                    gui = new GuiMainMenu();
                    break;
                }
                case 5: {
                    gui = new GuiSchematicManager();
                    break;
                }
                case 1: {
                    gui = new GuiSchematicPlacementsList();
                    break;
                }
                case 6: {
                    gui = new GuiTaskManager();
                    break;
                }
                case 7: {
                    DataManager.getSchematicProjectsManager().openSchematicProjectsGui();
                    return;
                }
            }
            if (gui != null) {
                gui.setParent(this.parent);
                GuiBase.openGui((Screen)gui);
            }
        }

        public static enum ButtonType {
            LOADED_SCHEMATICS("litematica.gui.button.change_menu.show_loaded_schematics", ButtonIcons.LOADED_SCHEMATICS),
            SCHEMATIC_PLACEMENTS("litematica.gui.button.change_menu.show_schematic_placements", ButtonIcons.SCHEMATIC_PLACEMENTS),
            AREA_SELECTION_BROWSER("litematica.gui.button.change_menu.show_area_selections", ButtonIcons.AREA_SELECTION),
            AREA_EDITOR("litematica.gui.button.change_menu.area_editor", ButtonIcons.AREA_EDITOR),
            LOAD_SCHEMATICS("litematica.gui.button.change_menu.load_schematics_to_memory", ButtonIcons.SCHEMATIC_BROWSER),
            SCHEMATIC_MANAGER("litematica.gui.button.change_menu.schematic_manager", ButtonIcons.SCHEMATIC_MANAGER),
            TASK_MANAGER("litematica.gui.button.change_menu.task_manager", ButtonIcons.TASK_MANAGER),
            SCHEMATIC_PROJECTS_MANAGER("litematica.gui.button.change_menu.schematic_projects_manager", ButtonIcons.SCHEMATIC_PROJECTS),
            CONFIGURATION("litematica.gui.button.change_menu.configuration_menu", ButtonIcons.CONFIGURATION),
            MAIN_MENU("litematica.gui.button.change_menu.to_main_menu", null);

            private final String labelKey;
            private final ButtonIcons icon;

            private ButtonType(String labelKey, ButtonIcons icon) {
                this.labelKey = labelKey;
                this.icon = icon;
            }

            public String getLabelKey() {
                return this.labelKey;
            }

            public String getDisplayName() {
                return StringUtils.translate((String)this.getLabelKey(), (Object[])new Object[0]);
            }

            public ButtonIcons getIcon() {
                return this.icon;
            }
        }
    }

    private record ButtonListenerCycleAreaMode(GuiMainMenu gui) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            DataManager.getSelectionManager().switchSelectionMode();
            this.gui.initGui();
        }
    }

    private record ButtonListenerCycleToolMode(GuiMainMenu gui) implements IButtonActionListener
    {
        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            ToolMode mode = DataManager.getToolMode().cycle((Player)Minecraft.getInstance().player, mouseButton == 0);
            DataManager.setToolMode(mode);
            this.gui.initGui();
        }
    }
}

