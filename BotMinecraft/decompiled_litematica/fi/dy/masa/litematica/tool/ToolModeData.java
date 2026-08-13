/*
 * Decompiled with CFR 0.152.
 * 
 * Could not load the following classes:
 *  com.google.gson.JsonElement
 *  com.google.gson.JsonObject
 *  com.google.gson.JsonPrimitive
 *  fi.dy.masa.malilib.util.data.json.JsonUtils
 */
package fi.dy.masa.litematica.tool;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;
import fi.dy.masa.malilib.util.data.json.JsonUtils;

public class ToolModeData {
    public static final DeleteModeData DELETE = new DeleteModeData();

    public static class DeleteModeData {
        private boolean usePlacement;

        public boolean getUsePlacement() {
            return this.usePlacement;
        }

        public void toggleUsePlacement() {
            this.usePlacement = !this.usePlacement;
        }

        public JsonObject toJson() {
            JsonObject obj = new JsonObject();
            obj.add("use_placement", (JsonElement)new JsonPrimitive(Boolean.valueOf(this.usePlacement)));
            return obj;
        }

        public void fromJson(JsonObject obj) {
            this.usePlacement = JsonUtils.getBoolean((JsonObject)obj, (String)"use_placement");
        }
    }
}

