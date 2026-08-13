/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.interfaces.ISelectionListener
 *  fi.dy.masa.malilib.gui.widgets.WidgetListBase
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.data.ItemType
 *  it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap
 *  it.unimi.dsi.fastutil.objects.Object2ObjectOpenHashMap
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.gui.widgets;

import fi.dy.masa.litematica.config.Configs;
import fi.dy.masa.litematica.gui.GuiSchematicVerifier;
import fi.dy.masa.litematica.gui.widgets.WidgetSchematicVerificationResult;
import fi.dy.masa.litematica.schematic.verifier.SchematicVerifier;
import fi.dy.masa.litematica.schematic.verifier.VerifierResultSorter;
import fi.dy.masa.litematica.util.ItemUtils;
import fi.dy.masa.malilib.gui.interfaces.ISelectionListener;
import fi.dy.masa.malilib.gui.widgets.WidgetListBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.data.ItemType;
import it.unimi.dsi.fastutil.objects.Object2IntOpenHashMap;
import it.unimi.dsi.fastutil.objects.Object2ObjectOpenHashMap;
import java.util.ArrayList;
import java.util.List;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.state.BlockState;

public class WidgetListSchematicVerificationResults
extends WidgetListBase<GuiSchematicVerifier.BlockMismatchEntry, WidgetSchematicVerificationResult> {
    private static int lastScrollbarPosition;
    private final GuiSchematicVerifier guiSchematicVerifier;
    private final VerifierResultSorter sorter;
    private boolean scrollbarRestored;

    public WidgetListSchematicVerificationResults(int x, int y, int width, int height, GuiSchematicVerifier parent) {
        super(x, y, width, height, (ISelectionListener)parent);
        this.browserEntryHeight = 22;
        this.guiSchematicVerifier = parent;
        this.allowMultiSelection = true;
        this.sorter = new VerifierResultSorter(parent.getPlacement().getSchematicVerifier());
    }

    public void drawContents(GuiContext ctx, int mouseX, int mouseY, float partialTicks) {
        super.drawContents(ctx, mouseX, mouseY, partialTicks);
        lastScrollbarPosition = this.scrollBar.getValue();
    }

    protected void offsetSelectionOrScrollbar(int amount, boolean changeSelection) {
        super.offsetSelectionOrScrollbar(amount, changeSelection);
        lastScrollbarPosition = this.scrollBar.getValue();
    }

    protected WidgetSchematicVerificationResult createHeaderWidget(int x, int y, int listIndexStart, int usableHeight, int usedHeight) {
        GuiSchematicVerifier.BlockMismatchEntry entry;
        int height = this.browserEntryHeight;
        if (usedHeight + height > usableHeight) {
            return null;
        }
        SchematicVerifier.MismatchType type = this.guiSchematicVerifier.getResultMode();
        String strExpected = TXT_BOLD + StringUtils.translate((String)"litematica.gui.label.schematic_verifier.expected", (Object[])new Object[0]) + TXT_RST;
        if (type != SchematicVerifier.MismatchType.CORRECT_STATE) {
            String strFound = TXT_WHITE + TXT_BOLD + StringUtils.translate((String)"litematica.gui.label.schematic_verifier.found", (Object[])new Object[0]) + TXT_RST;
            entry = new GuiSchematicVerifier.BlockMismatchEntry(strExpected, strFound);
        } else {
            entry = new GuiSchematicVerifier.BlockMismatchEntry(strExpected, "");
        }
        return this.createListEntryWidget(x, y, listIndexStart, true, entry);
    }

    protected void refreshBrowserEntries() {
        this.listContents.clear();
        SchematicVerifier.MismatchType type = this.guiSchematicVerifier.getResultMode();
        if (type == SchematicVerifier.MismatchType.ALL) {
            this.addEntriesForType(SchematicVerifier.MismatchType.WRONG_BLOCK);
            if (Configs.Generic.ENABLE_DIFFERENT_BLOCKS.getBooleanValue()) {
                this.addEntriesForType(SchematicVerifier.MismatchType.DIFF_BLOCK);
            }
            this.addEntriesForType(SchematicVerifier.MismatchType.WRONG_STATE);
            this.addEntriesForType(SchematicVerifier.MismatchType.EXTRA);
            this.addEntriesForType(SchematicVerifier.MismatchType.MISSING);
        } else {
            this.addEntriesForType(type);
        }
        this.reCreateListEntryWidgets();
        if (!this.scrollbarRestored && lastScrollbarPosition <= this.scrollBar.getMaxValue()) {
            this.scrollBar.setValue(lastScrollbarPosition);
            this.scrollbarRestored = true;
            this.reCreateListEntryWidgets();
        }
    }

    private void addEntriesForType(SchematicVerifier.MismatchType type) {
        List<SchematicVerifier.BlockMismatch> list;
        String title = type.getFormattingCode() + type.getDisplayname() + TXT_RST;
        this.listContents.add(new GuiSchematicVerifier.BlockMismatchEntry(type, title));
        if (type == SchematicVerifier.MismatchType.CORRECT_STATE) {
            Object2IntOpenHashMap<BlockState> counts = this.guiSchematicVerifier.getPlacement().getSchematicVerifier().getCorrectStates();
            Object2IntOpenHashMap itemCounts = new Object2IntOpenHashMap();
            Object2ObjectOpenHashMap states = new Object2ObjectOpenHashMap();
            for (BlockState state : counts.keySet()) {
                if (state.isAir()) continue;
                ItemStack stack = ItemUtils.getItemForState(state);
                ItemType itemType = new ItemType(stack, true, false);
                if (!itemCounts.containsKey((Object)itemType)) {
                    states.put((Object)itemType, (Object)state);
                }
                itemCounts.addTo((Object)itemType, counts.getInt((Object)state));
            }
            list = new ArrayList<SchematicVerifier.BlockMismatch>();
            for (ItemType itemType : itemCounts.keySet()) {
                BlockState state = (BlockState)states.get((Object)itemType);
                SchematicVerifier.BlockMismatch mismatch = new SchematicVerifier.BlockMismatch(SchematicVerifier.MismatchType.CORRECT_STATE, state, state, itemCounts.getInt((Object)itemType));
                list.add(mismatch);
            }
        } else {
            list = this.guiSchematicVerifier.getPlacement().getSchematicVerifier().getMismatchOverviewFor(type);
        }
        list.sort(this.sorter);
        for (SchematicVerifier.BlockMismatch mismatch : list) {
            this.listContents.add(new GuiSchematicVerifier.BlockMismatchEntry(type, mismatch));
        }
    }

    protected WidgetSchematicVerificationResult createListEntryWidget(int x, int y, int listIndex, boolean isOdd, GuiSchematicVerifier.BlockMismatchEntry entry) {
        return new WidgetSchematicVerificationResult(x, y, this.browserEntryWidth, this.getBrowserEntryHeightFor(entry), isOdd, this, this.guiSchematicVerifier, entry, listIndex);
    }
}

