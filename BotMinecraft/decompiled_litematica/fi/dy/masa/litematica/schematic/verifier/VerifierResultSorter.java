/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.schematic.verifier;

import fi.dy.masa.litematica.schematic.verifier.SchematicVerifier;
import fi.dy.masa.litematica.util.ItemUtils;
import java.util.Comparator;
import net.minecraft.world.level.block.state.BlockState;

public class VerifierResultSorter
implements Comparator<SchematicVerifier.BlockMismatch> {
    private final SchematicVerifier verifier;

    public VerifierResultSorter(SchematicVerifier verifier) {
        this.verifier = verifier;
    }

    @Override
    public int compare(SchematicVerifier.BlockMismatch entry1, SchematicVerifier.BlockMismatch entry2) {
        BlockState state2_2;
        BlockState state2_1;
        BlockState state1_2;
        BlockState state1_1;
        boolean reverse = this.verifier.getSortInReverse();
        SchematicVerifier.SortCriteria sortCriteria = this.verifier.getSortCriteria();
        if (sortCriteria == SchematicVerifier.SortCriteria.COUNT) {
            int count2;
            int count1 = entry1.count();
            if (count1 == (count2 = entry2.count())) {
                String name1 = ItemUtils.getItemForState(entry1.stateExpected()).getHoverName().getString();
                String name2 = ItemUtils.getItemForState(entry2.stateExpected()).getHoverName().getString();
                return name1.compareTo(name2);
            }
            return count1 > count2 != reverse ? -1 : 1;
        }
        if (sortCriteria == SchematicVerifier.SortCriteria.NAME_EXPECTED) {
            state1_1 = entry1.stateExpected();
            state1_2 = entry2.stateExpected();
            state2_1 = entry1.stateFound();
            state2_2 = entry2.stateFound();
        } else {
            state2_1 = entry1.stateExpected();
            state2_2 = entry2.stateExpected();
            state1_1 = entry1.stateFound();
            state1_2 = entry2.stateFound();
        }
        String name1_1 = ItemUtils.getItemForState(state1_1).getHoverName().getString();
        String name1_2 = ItemUtils.getItemForState(state1_2).getHoverName().getString();
        int res = name1_1.compareTo(name1_2);
        if (res != 0) {
            return !reverse ? res * -1 : res;
        }
        String name2_1 = ItemUtils.getItemForState(state2_1).getHoverName().getString();
        String name2_2 = ItemUtils.getItemForState(state2_2).getHoverName().getString();
        res = name2_1.compareTo(name2_2);
        return !reverse ? res * -1 : res;
    }
}

