/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  fi.dy.masa.malilib.gui.GuiBase
 *  fi.dy.masa.malilib.render.GuiContext
 *  fi.dy.masa.malilib.render.RenderUtils
 *  fi.dy.masa.malilib.util.StringUtils
 *  fi.dy.masa.malilib.util.game.BlockUtils
 *  net.minecraft.core.registries.BuiltInRegistries
 *  net.minecraft.resources.Identifier
 *  net.minecraft.world.item.ItemStack
 *  net.minecraft.world.level.block.state.BlockState
 */
package fi.dy.masa.litematica.render;

import fi.dy.masa.litematica.render.RenderUtils;
import fi.dy.masa.litematica.util.ItemUtils;
import fi.dy.masa.malilib.gui.GuiBase;
import fi.dy.masa.malilib.render.GuiContext;
import fi.dy.masa.malilib.util.StringUtils;
import fi.dy.masa.malilib.util.game.BlockUtils;
import java.util.List;
import java.util.Objects;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.Identifier;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.state.BlockState;

public class BlockInfo {
    private final String title;
    private final BlockState state;
    private final ItemStack stack;
    private final String blockRegistryName;
    private final String stackName;
    private final List<String> props;
    private final int totalWidth;
    private final int totalHeight;
    private boolean useBackgroundMask = false;

    public BlockInfo(BlockState state, String titleKey) {
        String pre = GuiBase.TXT_WHITE + GuiBase.TXT_BOLD;
        this.title = pre + StringUtils.translate((String)titleKey, (Object[])new Object[0]) + GuiBase.TXT_RST;
        this.state = state;
        this.stack = ItemUtils.getItemForState(this.state);
        Identifier rl = BuiltInRegistries.BLOCK.getKey((Object)this.state.getBlock());
        this.blockRegistryName = rl.toString();
        this.stackName = this.stack.getHoverName().getString();
        int w = StringUtils.getStringWidth((String)this.stackName) + 20;
        w = Math.max(w, StringUtils.getStringWidth((String)this.blockRegistryName));
        w = Math.max(w, StringUtils.getStringWidth((String)this.title));
        this.props = BlockUtils.getFormattedBlockStateProperties((BlockState)this.state, (String)" = ");
        this.totalWidth = w + 40;
        this.totalHeight = this.props.size() * (StringUtils.getFontHeight() + 2) + 60;
    }

    public int getTotalWidth() {
        return this.totalWidth;
    }

    public int getTotalHeight() {
        return this.totalHeight;
    }

    public void toggleUseBackgroundMask(boolean toggle) {
        this.useBackgroundMask = toggle;
    }

    public void render(GuiContext ctx, int x, int y) {
        if (this.state != null) {
            if (this.useBackgroundMask) {
                RenderUtils.renderBackgroundMask(ctx, x + 1, y + 1, this.totalWidth - 1, this.totalHeight - 1);
            }
            fi.dy.masa.malilib.render.RenderUtils.drawOutlinedBox((GuiContext)ctx, (int)x, (int)y, (int)this.totalWidth, (int)this.totalHeight, (int)-16777216, (int)-6710887);
            int x1 = x + 10;
            ctx.drawString(ctx.fontRenderer(), this.title, x1, y += 4, -1, false);
            fi.dy.masa.malilib.render.RenderUtils.drawRect((GuiContext)ctx, (int)x1, (int)(y += 12), (int)16, (int)16, (int)0x20FFFFFF);
            ctx.renderItem(this.stack, x1, y);
            ctx.renderItemDecorations(ctx.fontRenderer(), this.stack, x1, y);
            ctx.drawString(ctx.fontRenderer(), this.stackName, x1 + 20, y + 4, -1, false);
            ctx.drawString(ctx.fontRenderer(), this.blockRegistryName, x1, y += 20, -12558081, false);
            Objects.requireNonNull(ctx.fontRenderer());
            fi.dy.masa.malilib.render.RenderUtils.renderText((GuiContext)ctx, (int)x1, (int)(y += 9 + 4), (int)-5197648, this.props);
        }
    }
}

