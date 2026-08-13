/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiListBase
 *  fi.dy.masa.malilib.gui.Message$MessageType
 *  fi.dy.masa.malilib.gui.button.ButtonBase
 *  fi.dy.masa.malilib.gui.button.ButtonGeneric
 *  fi.dy.masa.malilib.gui.button.IButtonActionListener
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.interfaces.ICompletionListener
 *  fi.dy.masa.malilib.util.GuiUtils
 *  fi.dy.masa.malilib.util.InfoUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  javax.annotation.Nullable
 */
package fi.dy.masa.litematica.gui;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.config.Hotkeys;
import fi.dy.masa.litematica.gui.GuiMainMenu;
import fi.dy.masa.litematica.gui.widgets.WidgetListSchematicVerificationResults;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicVerificationResult;
import fi.dy.masa.litematica.render.infohud.InfoHud;
import fi.dy.masa.litematica.render.infohud.RenderPhase;
import fi.dy.masa.litematica.schematic.placement.SchematicPlacement;
import fi.dy.masa.litematica.schematic.verifier.SchematicVerifier;
import fi.dy.masa.litematica.util.BlockInfoListType;
import fi.dy.masa.litematica.world.SchematicWorldHandler;
import fi.dy.masa.litematica.world.WorldSchematic;
import fi.dy.masa.malilib.gui.GuiListBase;
import fi.dy.masa.malilib.gui.Message;
import fi.dy.masa.malilib.gui.button.ButtonBase;
import fi.dy.masa.malilib.gui.button.ButtonGeneric;
import fi.dy.masa.malilib.gui.button.IButtonActionListener;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.interfaces.ICompletionListener;
import fi.dy.masa.malilib.util.GuiUtils;
import fi.dy.masa.malilib.util.InfoUtils;
import fi.dy.masa.malilib.util.StringUtils;
import javax.annotation.Nullable;

public class GuiSchematicVerifier
extends GuiListBase<BlockMismatchEntry, WidgetSchematicVerificationResult, WidgetListSchematicVerificationResults>
implements ISelectionListener<BlockMismatchEntry>,
ICompletionListener {
    private static SchematicVerifier verifierLast;
    private static SchematicVerifier.MismatchType resultMode;
    private final SchematicPlacement placement;
    private final SchematicVerifier verifier;

    public GuiSchematicVerifier(SchematicPlacement placement) {
        super(10, 60);
        this.title = StringUtils.translate((String)"litematica.gui.title.schematic_verifier", (Object[])new Object[]{placement.getName()});
        this.placement = placement;
        this.verifier = placement.getSchematicVerifier();
        SchematicVerifier verifier = placement.getSchematicVerifier();
        if (verifier != verifierLast) {
            WidgetSchematicVerificationResult.setMaxNameLengths(verifier.getMismatchOverviewCombined());
            verifierLast = verifier;
        }
    }

    protected int getBrowserWidth() {
        return this.getScreenWidth() - 20;
    }

    protected int getBrowserHeight() {
        return this.getScreenHeight() - 94;
    }

    public void initGui() {
        super.initGui();
        int x = 12;
        int y = 20;
        x += this.createButton(x, y, -1, ButtonListener.Type.START) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.STOP) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.RESET_VERIFIER) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.SET_LIST_TYPE) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.RESET_IGNORED) + 4;
        this.createButton(x, y, -1, ButtonListener.Type.TOGGLE_INFO_HUD);
        x = 12;
        x += this.createButton(x, y += 22, -1, ButtonListener.Type.SET_RESULT_MODE_ALL) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.SET_RESULT_MODE_WRONG_BLOCKS) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.SET_RESULT_MODE_WRONG_STATES) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.SET_RESULT_MODE_EXTRA) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.SET_RESULT_MODE_MISSING) + 4;
        x += this.createButton(x, y, -1, ButtonListener.Type.SET_RESULT_MODE_CORRECT) + 4;
        if (Configs.Generic.ENABLE_DIFFERENT_BLOCKS.getBooleanValue()) {
            x += this.createButton(x, y, -1, ButtonListener.Type.SET_RESULT_MODE_DIFF_BLOCKS) + 4;
        }
        y = this.getScreenHeight() - 36;
        if (this.verifier.isActive()) {
            String str = StringUtils.translate((String)"litematica.gui.label.schematic_verifier.status.verifying", (Object[])new Object[]{this.verifier.getUnseenChunks(), this.verifier.getTotalChunks()});
            this.addLabel(12, y, 100, 12, -986896, new String[]{str});
        } else if (this.verifier.isFinished()) {
            Integer wb = this.verifier.getMismatchedBlocks();
            Integer ws = this.verifier.getMismatchedStates();
            Integer m = this.verifier.getMissingBlocks();
            Integer e = this.verifier.getExtraBlocks();
            Integer c = this.verifier.getCorrectStatesCount();
            Integer d = this.verifier.getDiffBlocks();
            Integer t = this.verifier.getSchematicTotalBlocks();
            String str = StringUtils.translate((String)"litematica.gui.label.schematic_verifier.status.done_errors.no_diff", (Object[])new Object[]{wb, ws, m, e});
            if (Configs.Generic.ENABLE_DIFFERENT_BLOCKS.getBooleanValue()) {
                str = StringUtils.translate((String)"litematica.gui.label.schematic_verifier.status.done_errors", (Object[])new Object[]{wb, ws, m, e, d});
            }
            this.addLabel(12, y, 100, 12, -986896, new String[]{str});
            str = StringUtils.translate((String)"litematica.gui.label.schematic_verifier.status.done_correct_total", (Object[])new Object[]{c, t});
            this.addLabel(12, y + 14, 100, 12, -986896, new String[]{str});
        }
        GuiMainMenu.ButtonListenerChangeMenu.ButtonType type = GuiMainMenu.ButtonListenerChangeMenu.ButtonType.MAIN_MENU;
        String label = StringUtils.translate((String)type.getLabelKey(), (Object[])new Object[0]);
        int buttonWidth = this.getStringWidth(label) + 20;
        x = this.getScreenWidth() - buttonWidth - 10;
        ButtonGeneric button = new ButtonGeneric(x, y, buttonWidth, 20, label, new String[0]);
        this.addButton((ButtonBase)button, new GuiMainMenu.ButtonListenerChangeMenu(type, this.getParent()));
    }

    private int createButton(int x, int y, int width, ButtonListener.Type type) {
        ButtonListener listener = new ButtonListener(type, this.placement, this);
        boolean enabled = true;
        String label = "";
        switch (type.ordinal()) {
            case 0: {
                label = Configs.Generic.ENABLE_DIFFERENT_BLOCKS.getBooleanValue() ? SchematicVerifier.MismatchType.ALL.getDisplayname() : StringUtils.translate((String)"litematica.gui.label.schematic_verifier_display_type.all_not_ignored", (Object[])new Object[0]);
                enabled = resultMode != SchematicVerifier.MismatchType.ALL;
                break;
            }
            case 1: {
                label = SchematicVerifier.MismatchType.WRONG_BLOCK.getDisplayname();
                enabled = resultMode != SchematicVerifier.MismatchType.WRONG_BLOCK;
                break;
            }
            case 2: {
                label = SchematicVerifier.MismatchType.DIFF_BLOCK.getDisplayname();
                enabled = resultMode != SchematicVerifier.MismatchType.DIFF_BLOCK;
                break;
            }
            case 3: {
                label = SchematicVerifier.MismatchType.WRONG_STATE.getDisplayname();
                enabled = resultMode != SchematicVerifier.MismatchType.WRONG_STATE;
                break;
            }
            case 4: {
                label = SchematicVerifier.MismatchType.EXTRA.getDisplayname();
                enabled = resultMode != SchematicVerifier.MismatchType.EXTRA;
                break;
            }
            case 5: {
                label = SchematicVerifier.MismatchType.MISSING.getDisplayname();
                enabled = resultMode != SchematicVerifier.MismatchType.MISSING;
                break;
            }
            case 6: {
                label = SchematicVerifier.MismatchType.CORRECT_STATE.getDisplayname();
                enabled = resultMode != SchematicVerifier.MismatchType.CORRECT_STATE;
                break;
            }
            case 7: {
                if (this.verifier.isPaused()) {
                    label = StringUtils.translate((String)"litematica.gui.button.schematic_verifier.resume", (Object[])new Object[0]);
                    break;
                }
                label = StringUtils.translate((String)"litematica.gui.button.schematic_verifier.start", (Object[])new Object[0]);
                enabled = !this.verifier.isActive();
                break;
            }
            case 8: {
                label = StringUtils.translate((String)"litematica.gui.button.schematic_verifier.stop", (Object[])new Object[0]);
                enabled = this.verifier.isActive();
                break;
            }
            case 9: {
                label = StringUtils.translate((String)"litematica.gui.button.schematic_verifier.reset_verifier", (Object[])new Object[0]);
                enabled = this.verifier.isActive() || this.verifier.isPaused() || this.verifier.isFinished();
                break;
            }
            case 10: {
                String str = this.placement.getSchematicVerifierType().getDisplayName();
                label = StringUtils.translate((String)"litematica.gui.button.schematic_verifier.range_type", (Object[])new Object[]{str});
                break;
            }
            case 11: {
                label = StringUtils.translate((String)"litematica.gui.button.schematic_verifier.reset_ignored", (Object[])new Object[0]);
                enabled = this.verifier.getIgnoredMismatches().size() > 0;
                break;
            }
            case 12: {
                boolean val = InfoHud.getInstance().isEnabled() && this.verifier.getShouldRenderText(RenderPhase.POST);
                String str = (val ? TXT_GREEN : TXT_RED) + StringUtils.translate((String)("litematica.message.value." + (val ? "on" : "off")), (Object[])new Object[0]) + TXT_RST;
                label = StringUtils.translate((String)"litematica.gui.button.schematic_verifier.toggle_info_hud", (Object[])new Object[]{str});
                break;
            }
        }
        if (width == -1) {
            width = this.getStringWidth(label) + 10;
        }
        ButtonGeneric button = new ButtonGeneric(x, y, width, 20, label, new String[0]);
        button.setEnabled(enabled);
        this.addButton((ButtonBase)button, listener);
        return width;
    }

    public SchematicPlacement getPlacement() {
        return this.placement;
    }

    public SchematicVerifier.MismatchType getResultMode() {
        return resultMode;
    }

    private void setResultMode(SchematicVerifier.MismatchType type) {
        resultMode = type;
    }

    public void onTaskCompleted() {
        if (GuiUtils.getCurrentScreen() == this) {
            SchematicVerifier verifier = this.verifier;
            WidgetSchematicVerificationResult.setMaxNameLengths(verifier.getMismatchOverviewCombined());
            this.initGui();
        }
    }

    public void onSelectionChange(@Nullable BlockMismatchEntry entry) {
        if (entry != null) {
            if (entry.type == BlockMismatchEntry.Type.HEADER) {
                this.verifier.updateRequiredChunksStringList();
            } else if (entry.type == BlockMismatchEntry.Type.CATEGORY_TITLE) {
                this.verifier.toggleMismatchCategorySelected(entry.mismatchType);
            } else if (entry.type == BlockMismatchEntry.Type.DATA && entry.blockMismatch != null) {
                this.verifier.toggleMismatchEntrySelected(entry.blockMismatch);
            }
            if (!Configs.InfoOverlays.VERIFIER_OVERLAY_ENABLED.getBooleanValue()) {
                String name = Configs.InfoOverlays.VERIFIER_OVERLAY_ENABLED.getName();
                String hotkeyName = Hotkeys.TOGGLE_VERIFIER_OVERLAY_RENDERING.getName();
                String hotkeyVal = Hotkeys.TOGGLE_VERIFIER_OVERLAY_RENDERING.getKeybind().getKeysDisplayString();
                InfoUtils.showGuiOrInGameMessage((Message.MessageType)Message.MessageType.WARNING, (String)"litematica.message.warn.schematic_verifier.overlay_disabled", (Object[])new Object[]{name, hotkeyName, hotkeyVal});
            }
        }
    }

    protected ISelectionListener<BlockMismatchEntry> getSelectionListener() {
        return this;
    }

    protected WidgetListSchematicVerificationResults createListWidget(int listX, int listY) {
        return new WidgetListSchematicVerificationResults(listX, listY, this.getBrowserWidth(), this.getBrowserHeight(), this);
    }

    static {
        resultMode = SchematicVerifier.MismatchType.ALL;
    }

    private static class ButtonListener
    implements IButtonActionListener {
        private final GuiSchematicVerifier parent;
        private final Type type;

        public ButtonListener(Type type, SchematicPlacement placement, GuiSchematicVerifier parent) {
            this.parent = parent;
            this.type = type;
        }

        public void actionPerformedWithButton(ButtonBase button, int mouseButton) {
            switch (this.type.ordinal()) {
                case 0: {
                    this.parent.setResultMode(SchematicVerifier.MismatchType.ALL);
                    break;
                }
                case 1: {
                    this.parent.setResultMode(SchematicVerifier.MismatchType.WRONG_BLOCK);
                    break;
                }
                case 2: {
                    this.parent.setResultMode(SchematicVerifier.MismatchType.DIFF_BLOCK);
                    break;
                }
                case 3: {
                    this.parent.setResultMode(SchematicVerifier.MismatchType.WRONG_STATE);
                    break;
                }
                case 4: {
                    this.parent.setResultMode(SchematicVerifier.MismatchType.EXTRA);
                    break;
                }
                case 5: {
                    this.parent.setResultMode(SchematicVerifier.MismatchType.MISSING);
                    break;
                }
                case 6: {
                    this.parent.setResultMode(SchematicVerifier.MismatchType.CORRECT_STATE);
                    break;
                }
                case 7: {
                    WorldSchematic world = SchematicWorldHandler.getSchematicWorld();
                    if (world != null) {
                        SchematicVerifier verifier = this.parent.verifier;
                        if (this.parent.verifier.isPaused()) {
                            verifier.resume();
                        } else {
                            verifier.startVerification(this.parent.mc.level, world, this.parent.placement, this.parent);
                        }
                    } else {
                        this.parent.addMessage(Message.MessageType.ERROR, "litematica.error.generic.schematic_world_not_loaded", new Object[0]);
                    }
                    verifierLast = null;
                    break;
                }
                case 8: {
                    this.parent.verifier.stopVerification();
                    break;
                }
                case 9: {
                    this.parent.verifier.reset();
                    break;
                }
                case 10: {
                    SchematicPlacement placement = this.parent.placement;
                    this.parent.verifier.reset();
                    BlockInfoListType type = placement.getSchematicVerifierType();
                    placement.setSchematicVerifierType((BlockInfoListType)type.cycle(mouseButton == 0));
                    break;
                }
                case 11: {
                    this.parent.verifier.resetIgnoredStateMismatches();
                    break;
                }
                case 12: {
                    SchematicVerifier verifier = this.parent.verifier;
                    verifier.toggleShouldRenderInfoHUD();
                    if (verifier.getShouldRenderText(RenderPhase.POST)) {
                        InfoHud.getInstance().addInfoHudRenderer(verifier, true);
                        break;
                    }
                    InfoHud.getInstance().removeInfoHudRenderer(verifier, false);
                }
            }
            this.parent.initGui();
        }

        public static enum Type {
            SET_RESULT_MODE_ALL,
            SET_RESULT_MODE_WRONG_BLOCKS,
            SET_RESULT_MODE_DIFF_BLOCKS,
            SET_RESULT_MODE_WRONG_STATES,
            SET_RESULT_MODE_EXTRA,
            SET_RESULT_MODE_MISSING,
            SET_RESULT_MODE_CORRECT,
            START,
            STOP,
            RESET_VERIFIER,
            SET_LIST_TYPE,
            RESET_IGNORED,
            TOGGLE_INFO_HUD;

        }
    }

    public static class BlockMismatchEntry {
        public final Type type;
        @Nullable
        public final SchematicVerifier.MismatchType mismatchType;
        @Nullable
        public final SchematicVerifier.BlockMismatch blockMismatch;
        @Nullable
        public final String header1;
        @Nullable
        public final String header2;

        public BlockMismatchEntry(@Nullable SchematicVerifier.MismatchType mismatchType, @Nullable String title) {
            this.type = Type.CATEGORY_TITLE;
            this.mismatchType = mismatchType;
            this.blockMismatch = null;
            this.header1 = title;
            this.header2 = null;
        }

        public BlockMismatchEntry(@Nullable String header1, @Nullable String header2) {
            this.type = Type.HEADER;
            this.mismatchType = null;
            this.blockMismatch = null;
            this.header1 = header1;
            this.header2 = header2;
        }

        public BlockMismatchEntry(@Nullable SchematicVerifier.MismatchType mismatchType, @Nullable SchematicVerifier.BlockMismatch blockMismatch) {
            this.type = Type.DATA;
            this.mismatchType = mismatchType;
            this.blockMismatch = blockMismatch;
            this.header1 = null;
            this.header2 = null;
        }

        public int hashCode() {
            int prime = 31;
            int result = 1;
            result = 31 * result + (this.blockMismatch == null ? 0 : this.blockMismatch.hashCode());
            result = 31 * result + (this.header1 == null ? 0 : this.header1.hashCode());
            result = 31 * result + (this.header2 == null ? 0 : this.header2.hashCode());
            result = 31 * result + (this.mismatchType == null ? 0 : this.mismatchType.hashCode());
            result = 31 * result + (this.type == null ? 0 : this.type.hashCode());
            return result;
        }

        public boolean equals(Object obj) {
            if (this == obj) {
                return true;
            }
            if (obj == null) {
                return false;
            }
            if (this.getClass() != obj.getClass()) {
                return false;
            }
            BlockMismatchEntry other = (BlockMismatchEntry)obj;
            if (this.blockMismatch == null ? other.blockMismatch != null : !this.blockMismatch.equals(other.blockMismatch)) {
                return false;
            }
            if (this.header1 == null ? other.header1 != null : !this.header1.equals(other.header1)) {
                return false;
            }
            if (this.header2 == null ? other.header2 != null : !this.header2.equals(other.header2)) {
                return false;
            }
            if (this.mismatchType != other.mismatchType) {
                return false;
            }
            return this.type == other.type;
        }

        public static enum Type {
            HEADER,
            CATEGORY_TITLE,
            DATA;

        }
    }
}

