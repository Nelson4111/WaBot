/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 *  fi.dy.masa.malilib.util.position.PositionUtils
 *  javax.annotation.Nullable
 *  net.minecraft.client.Minecraft
 *  net.minecraft.client.gui.screens.Screen
 *  net.minecraft.core.BlockPos
 *  net.minecraft.world.entity.Entity
 */
package fi.dy.masa.litematica.schematic.projects;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.gui.GuiSchematicProjectManager;
import fi.dy.masa.litematica.gui.GuiSchematicProjectsBrowser;
import fi.dy.masa.litematica.schematic.projects.SchematicProject;
import fi.dy.masa.litematica.util.FileType;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.data.json.JsonUtils;
import fi.dy.masa.malilib.util.position.PositionUtils;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.util.Objects;
import javax.annotation.Nullable;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.core.BlockPos;
import net.minecraft.world.entity.Entity;

public class SchematicProjectsManager {
    private final Minecraft mc = Minecraft.getInstance();
    @Nullable
    private SchematicProject currentProject = null;

    public void openSchematicProjectsGui() {
        if (!Configs.Generic.UNHIDE_SCHEMATIC_PROJECTS.getBooleanValue()) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (int)10000, (String)"litematica.message.warning.schematic_projects_hidden", (Object[])new Object[0]);
            return;
        }
        if (this.currentProject != null) {
            GuiSchematicProjectManager gui = new GuiSchematicProjectManager(this.currentProject);
            gui.setParent(GuiUtils.getCurrentScreen());
            GuiBase.openGui((Screen)gui);
        } else {
            GuiSchematicProjectsBrowser gui = new GuiSchematicProjectsBrowser();
            gui.setParent(GuiUtils.getCurrentScreen());
            GuiBase.openGui((Screen)gui);
        }
    }

    @Nullable
    public SchematicProject getCurrentProject() {
        return this.hasProjectOpen() ? this.currentProject : null;
    }

    public boolean hasProjectOpen() {
        return this.currentProject != null && Configs.Generic.UNHIDE_SCHEMATIC_PROJECTS.getBooleanValue();
    }

    public void createNewProject(Path dir, String projectName) {
        this.closeCurrentProject();
        BlockPos origin = BlockPos.ZERO;
        if (this.mc.player != null) {
            origin = PositionUtils.getEntityBlockPos((Entity)this.mc.player);
        }
        this.currentProject = new SchematicProject(dir, dir.resolve(projectName + ".json"));
        this.currentProject.setName(projectName);
        this.currentProject.setOrigin(origin);
        this.currentProject.saveToFile();
    }

    public boolean openProject(Path projectFile) {
        this.closeCurrentProject();
        this.currentProject = this.loadProjectFromFile(projectFile, true);
        if (this.currentProject == null) {
            InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_projects.failed_to_load_project", (Object[])new Object[0]);
            return false;
        }
        this.currentProject.checkSelectionModeConfig();
        return true;
    }

    @Nullable
    public SchematicProject loadProjectFromFile(Path projectFile, boolean createPlacement) {
        SchematicProject project;
        JsonElement el;
        if (FileType.fromFile(projectFile) == FileType.JSON && Files.exists(projectFile, new LinkOption[0]) && Files.isRegularFile(projectFile, new LinkOption[0]) && Files.isReadable(projectFile) && (el = JsonUtils.parseJsonFile((Path)projectFile)) != null && el.isJsonObject() && (project = SchematicProject.fromJson(el.getAsJsonObject(), projectFile, createPlacement)) != null) {
            project.checkSelectionModeConfig();
            return project;
        }
        return null;
    }

    public void closeCurrentProject() {
        if (this.currentProject != null) {
            this.currentProject.saveToFile();
            this.removeCurrentPlacement();
            this.clear();
        }
    }

    public void saveCurrentProject() {
        if (this.currentProject != null) {
            this.currentProject.saveToFile();
        }
    }

    private void removeCurrentPlacement() {
        if (this.currentProject != null) {
            this.currentProject.removeCurrentPlacement();
        }
    }

    public void clear() {
        this.currentProject = null;
    }

    public boolean cycleVersion(int amount) {
        if (this.currentProject != null) {
            return this.currentProject.cycleVersion(amount);
        }
        InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_projects.no_project_open", (Object[])new Object[0]);
        return false;
    }

    public boolean commitNewVersion(String string, String description) {
        if (this.currentProject != null) {
            return this.currentProject.commitNewVersion(string, description);
        }
        InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.ERROR, (String)"litematica.error.schematic_projects.no_project_open", (Object[])new Object[0]);
        return false;
    }

    public boolean pasteCurrentVersionToWorld() {
        SchematicProject project = this.getCurrentProject();
        if (project != null) {
            project.pasteToWorld();
            return true;
        }
        return false;
    }

    public boolean deleteLastSeenArea(Minecraft mc) {
        SchematicProject project = this.getCurrentProject();
        if (project != null) {
            project.deleteLastSeenArea(mc);
            return true;
        }
        return false;
    }

    public boolean deleteBlocksByPlacement() {
        SchematicProject project = this.getCurrentProject();
        if (project != null) {
            project.deleteBlocksByPlacement();
            return true;
        }
        return false;
    }

    public JsonObject toJson() {
        JsonObject obj = new JsonObject();
        if (this.currentProject != null) {
            obj.add("current_project", (JsonElement)new JsonPrimitive(this.currentProject.getProjectFile().toAbsolutePath().toString()));
        }
        return obj;
    }

    public void loadFromJson(JsonObject obj) {
        if (JsonUtils.hasString((JsonObject)obj, (String)"current_project")) {
            Path file = Path.of((String)Objects.requireNonNull(JsonUtils.getString((JsonObject)obj, (String)"current_project")), (String[])new String[0]);
            this.currentProject = this.loadProjectFromFile(file, true);
            if (this.currentProject != null) {
                this.currentProject.checkSelectionModeConfig();
            }
        }
    }
}

