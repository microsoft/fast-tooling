import { fastSwitch, fastTooltip } from "@microsoft/fast-components";
import { DesignSystem } from "@microsoft/fast-foundation";
import { fastToolingCSSLayout } from "../../../src/web-components/css-layout/index.js";

DesignSystem.getOrCreate()
    .withPrefix("fast-tooling")
    .register(fastSwitch(), fastTooltip(), fastToolingCSSLayout());
