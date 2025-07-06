import type {
  AngularGradientStopData,
  BackgroundLayerData,
  ConicGradientData,
  GradientBackgroundLayerData,
  ImageBackgroundLayerData,
  LinearGradientData,
  LinearGradientStopData,
  RadialGradientData} from "@elllphnt/elementa-base";
import {
  StyleDataType,
} from "@elllphnt/elementa-base";
import {
  variableFlexibleStyleDataToCss,
  variableStyleDataToCss,
} from "../variable.js";

export function linearGradientStopToCss(stop: LinearGradientStopData): string {
  return [
    variableStyleDataToCss(StyleDataType.Color, stop.color),
    variableFlexibleStyleDataToCss(
      stop.position,
      StyleDataType.Length,
      StyleDataType.Percent
    ),
  ].join(" ");
}
export function angularGradientStopToCss(
  stop: AngularGradientStopData
): string {
  return [
    variableStyleDataToCss(StyleDataType.Color, stop.color),
    variableFlexibleStyleDataToCss(
      stop.angle,
      StyleDataType.Angle,
      StyleDataType.Percent
    ),
  ].join(" ");
}

export function linearGradientToCss(gradient: LinearGradientData): string {
  const parts: string[] = [];
  if (gradient.angle) {
    parts.push(variableStyleDataToCss(StyleDataType.Angle, gradient.angle));
  }
  for (const stop of gradient.stops || []) {
    parts.push(
      linearGradientStopToCss({
        color: stop.color,
        position: stop.position,
      })
    );
  }

  return `linear-gradient(${parts.join(", ")})`;
}
export function radialGradientToCss(gradient: RadialGradientData): string {
  const parts: string[] = [];
  if (gradient.shape) {
    parts.push(variableStyleDataToCss(StyleDataType.String, gradient.shape));
  }
  if (gradient.size) {
    parts.push(
      variableFlexibleStyleDataToCss(
        gradient.size,
        StyleDataType.Length,
        StyleDataType.Percent
      )
    );
  }
  if (gradient.position) {
    parts.push(
      "at " +
        [
          variableFlexibleStyleDataToCss(
            gradient.position.x,
            StyleDataType.Length,
            StyleDataType.Percent
          ),
          variableFlexibleStyleDataToCss(
            gradient.position.y,
            StyleDataType.Length,
            StyleDataType.Percent
          ),
        ].join(" ")
    );
  }
  for (const stop of gradient.stops) {
    parts.push(
      linearGradientStopToCss({
        color: stop.color,
        position: stop.position,
      })
    );
  }

  return `radial-gradient(${parts.join(", ")})`;
}
export function conicGradientToCss(gradient: ConicGradientData): string {
  const parts: string[] = [];
  if (gradient.angle) {
    parts.push(
      "from " + variableStyleDataToCss(StyleDataType.Angle, gradient.angle)
    );
  }
  if (gradient.position) {
    parts.push(
      "at " +
        [
          variableFlexibleStyleDataToCss(
            gradient.position.x,
            StyleDataType.Length,
            StyleDataType.Percent
          ),
          variableFlexibleStyleDataToCss(
            gradient.position.y,
            StyleDataType.Length,
            StyleDataType.Percent
          ),
        ].join(" ")
    );
  }
  for (const stop of gradient.stops || []) {
    parts.push(angularGradientStopToCss(stop));
  }

  return `conic-gradient(${parts.join(", ")})`;
}

export function imagebackgroundLayerToCss(
  layer: ImageBackgroundLayerData
): string {
  const parts: string[] = [];
  if (layer.url) {
    parts.push(`url(${layer.url})`);
  }
  if (layer.position) {
    parts.push(
      [
        variableFlexibleStyleDataToCss(
          layer.position.x,
          StyleDataType.Length,
          StyleDataType.Percent
        ),
        variableFlexibleStyleDataToCss(
          layer.position.y,
          StyleDataType.Length,
          StyleDataType.Percent
        ),
      ].join(" ")
    );
  }
  if (layer.size) {
    parts.push(
      "/ " +
        variableFlexibleStyleDataToCss(
          layer.size,
          StyleDataType.String,
          StyleDataType.Length,
          StyleDataType.Percent
        )
    );
  }
  if (layer.repeat) {
    parts.push(variableStyleDataToCss(StyleDataType.String, layer.repeat));
  }
  if (layer.attachment !== undefined) {
    parts.push(variableStyleDataToCss(StyleDataType.String, layer.attachment));
  }
  if (layer.clip && layer.origin) {
    parts.push(
      [
        variableStyleDataToCss(StyleDataType.String, layer.origin),
        variableStyleDataToCss(StyleDataType.String, layer.clip),
      ].join(" ")
    );
  } else if (layer.clip) {
    parts.push(
      [
        "padding-box",
        variableStyleDataToCss(StyleDataType.String, layer.clip),
      ].join(" ")
    );
  } else if (layer.origin) {
    parts.push(variableStyleDataToCss(StyleDataType.String, layer.origin));
  }

  return parts.join(" ");
}

export function gradientbackgroundLayerToCss(
  layer: GradientBackgroundLayerData
): string {
  switch (layer.gradient?.type) {
    case "linear":
      return linearGradientToCss(layer.gradient);
    case "radial":
      return radialGradientToCss(layer.gradient);
    case "conic":
      return conicGradientToCss(layer.gradient);
    default:
      return "";
  }
}

export function backgroundLayerToCss(layer: BackgroundLayerData): string {
  switch (layer.type) {
    case "gradient":
      return gradientbackgroundLayerToCss(layer as GradientBackgroundLayerData);
    case "image":
      return imagebackgroundLayerToCss(layer as ImageBackgroundLayerData);
    default:
      return "";
  }
}
