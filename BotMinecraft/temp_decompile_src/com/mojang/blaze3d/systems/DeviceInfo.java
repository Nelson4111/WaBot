/*
 * Decompiled with CFR 0.152.
 */
package com.mojang.blaze3d.systems;

import com.mojang.blaze3d.systems.DeviceFeatures;
import com.mojang.blaze3d.systems.DeviceLimits;
import com.mojang.blaze3d.systems.DeviceType;
import com.mojang.blaze3d.systems.HintsAndWorkarounds;
import java.util.Set;

public record DeviceInfo(String name, String vendorName, String driverInfo, boolean isZZeroToOne, String backendName, float timestampPeriod, DeviceLimits limits, DeviceFeatures features, Set<String> underlyingExtensions, HintsAndWorkarounds hintsAndWorkarounds, DeviceType type) {
}

